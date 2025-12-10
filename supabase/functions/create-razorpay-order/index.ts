
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HARDCODED KEYS FOR LIVE ENVIRONMENT (As requested by user)
// In production, these should be loaded via Deno.env.get() from Supabase Secrets
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { packageId, amount, customerDetails } = await req.json();

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay keys are not configured");
        }

        const razorpay = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        // 1. Create Razorpay Order
        const orderOptions = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            receipt: `pkg_${packageId.substring(0, 8)}_${Date.now()}`,
            notes: {
                packageId: packageId,
                customerName: customerDetails.name,
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        // 2. Create Booking in Supabase
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Get User ID if available
        let userId = null;
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) userId = user.id;
        }

        const { data: booking, error: bookingError } = await supabase
            .from("package_bookings")
            .insert({
                package_id: packageId,
                amount: amount,
                status: "pending",
                customer_name: customerDetails.name,
                customer_email: customerDetails.email,
                customer_phone: customerDetails.phone,
                travel_date: customerDetails.travelDate,
                razorpay_order_id: order.id,
                user_id: userId
            })
            .select()
            .single();

        if (bookingError) {
            console.error("Booking Insert Error:", bookingError);
            throw new Error("Failed to create booking record");
        }

        return new Response(
            JSON.stringify({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: RAZORPAY_KEY_ID
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
