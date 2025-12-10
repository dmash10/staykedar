
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HARDCODED KEY FOR SECRET - Must match the one in create-razorpay-order
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new Error("Missing required payment details");
        }

        // 1. Verify Signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;

        // HMAC SHA256 verification
        const encoder = new TextEncoder();
        const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
        const key = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(text)
        );

        // Convert array buffer to hex string
        const hashArray = Array.from(new Uint8Array(signature));
        const generated_signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (generated_signature !== razorpay_signature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Update Booking Status
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        const { data, error } = await supabase
            .from("package_bookings")
            .update({
                status: "paid",
                razorpay_payment_id: razorpay_payment_id,
                updated_at: new Date().toISOString()
            })
            .eq("razorpay_order_id", razorpay_order_id)
            .select()
            .single();

        if (error) {
            console.error("Database Update Error:", error);
            throw new Error("Failed to update booking status");
        }

        // 3. Trigger Notifications (Async)
        await Promise.all([
            supabase.functions.invoke('send-booking-email', { body: { booking_id: data.id } }),
            supabase.functions.invoke('send-whatsapp', { body: { booking_id: data.id } })
        ]);

        return new Response(
            JSON.stringify({ success: true, booking: data }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
