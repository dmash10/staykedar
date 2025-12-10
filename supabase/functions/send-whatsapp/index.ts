
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
// Setup DB
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { booking_id } = await req.json();

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.log("WhatsApp credentials not set. Skipping.");
            return new Response(JSON.stringify({ message: "WhatsApp not configured" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200
            });
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // 1. Fetch Booking
        const { data: booking, error: bookingError } = await supabase
            .from("package_bookings")
            .select(`*, packages(title)`)
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            throw new Error("Booking not found");
        }

        const customerPhone = booking.customer_phone.replace(/\D/g, ''); // Remove non-digits
        // Ensure 12 digits (91 + 10 digit number) if Indian
        // This is a basic formatter, might need more robust lib for intl numbers
        const formattedPhone = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;


        // 2. Send WhatsApp Template Message
        // We assume a template named 'booking_confirmation' exists in Meta Manager
        // Variables: {{1}} = Customer Name, {{2}} = Package Name, {{3}} = Travel Date
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: formattedPhone,
                    type: "template",
                    template: {
                        name: "booking_confirmation",
                        language: { code: "en" },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    { type: "text", text: booking.customer_name }, // {{1}}
                                    { type: "text", text: booking.packages?.title || "Package" }, // {{2}}
                                    { type: "text", text: new Date(booking.travel_date).toLocaleDateString() } // {{3}}
                                ]
                            }
                        ]
                    }
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error:", data);
            throw new Error(`WhatsApp API failed: ${JSON.stringify(data)}`);
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        console.error("WhatsApp Worker Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
