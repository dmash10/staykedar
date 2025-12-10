
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface Booking {
    id: string;
    customer_name: string;
    customer_email: string;
    amount: number;
    package_id: string;
    travel_date: string;
    // Join package details
    packages?: {
        title: string;
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { booking_id } = await req.json();

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set");
        }

        if (!booking_id) {
            throw new Error("Missing booking_id");
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // 1. Fetch Booking Details (with Package Title)
        const { data: bookingData, error: bookingError } = await supabase
            .from("package_bookings")
            .select(`
                *,
                packages (
                    title
                )
            `)
            .eq("id", booking_id)
            .single();

        if (bookingError || !bookingData) {
            console.error("Booking Fetch Error:", bookingError);
            throw new Error("Booking not found");
        }

        const booking = bookingData as Booking;

        // 2. Fetch Email Template
        // We look for a template categorized as 'booking' and active. 
        // Or specific name 'booking_confirmation'
        const { data: templateData, error: templateError } = await supabase
            .from("email_templates")
            .select("*")
            .eq("is_active", true)
            .eq("category", "booking")
            .limit(1)
            .single();

        // Fallback or Error if no template found
        if (templateError || !templateData) {
            console.log("No active booking template found. Skipping email.");
            return new Response(
                JSON.stringify({ message: "No active email template found" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        }

        // 3. Replace Variables
        let subject = templateData.subject;
        let body = templateData.body;

        const variables = {
            "customer_name": booking.customer_name,
            "amount": booking.amount.toString(),
            "package_name": booking.packages?.title || "StayKedarnath Package",
            "booking_id": booking.id.slice(0, 8),
            "travel_date": new Date(booking.travel_date).toLocaleDateString(),
        };

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            // Global replace
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            body = body.replace(new RegExp(placeholder, 'g'), value);
        }

        // 4. Send Email via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "StayKedarnath Bookings <bookings@staykedarnath.in>",
                to: [booking.customer_email],
                reply_to: "info@staykedarnath.in",
                bcc: ["staykedarnath@gmail.com"],
                subject: subject,
                html: body,
            }),
        });

        const resData = await res.json();

        if (!res.ok) {
            console.error("Resend API Error:", resData);
            throw new Error(`Failed to send email: ${JSON.stringify(resData)}`);
        }

        return new Response(
            JSON.stringify({ success: true, id: resData.id }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        console.error("Email Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
