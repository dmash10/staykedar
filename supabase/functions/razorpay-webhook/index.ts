
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

// You must set this in Supabase Secrets!
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Validate Secret Existence
        if (!RAZORPAY_WEBHOOK_SECRET) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set");
            return new Response("Internal Server Error: Webhook secret missing", { status: 500 });
        }

        // 2. Get Signature and Body
        const signature = req.headers.get("x-razorpay-signature");
        if (!signature) {
            return new Response("Missing Signature", { status: 400 });
        }

        const bodyText = await req.text(); // Raw body is needed for HMAC

        // 3. Verify Signature (HMAC SHA256)
        const encoder = new TextEncoder();
        const keyData = encoder.encode(RAZORPAY_WEBHOOK_SECRET);
        const key = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signedHash = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(bodyText)
        );

        const hashArray = Array.from(new Uint8Array(signedHash));
        const generatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (generatedSignature !== signature) {
            console.error("Invalid Signature");
            return new Response("Invalid Signature", { status: 401 });
        }

        // 4. Parse Body and Handle Events
        const payload = JSON.parse(bodyText);
        const event = payload.event;
        const razorpay_order_id = payload.payload?.payment?.entity?.order_id;
        const razorpay_payment_id = payload.payload?.payment?.entity?.id;

        if (!razorpay_order_id) {
            console.log("No order ID found in payload, ignoring.");
            return new Response(JSON.stringify({ received: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Handle 'order.paid'
        if (event === "order.paid") {
            const paymentAmount = payload.payload?.payment?.entity?.amount / 100; // Convert paise to rupees

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
                console.error("Error creating/updating booking:", error);
                return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
            }

            // =====================================================
            // CREATE COMMISSION RECORD
            // =====================================================
            const COMMISSION_RATE = 20; // 20% platform commission
            const grossAmount = data.amount || paymentAmount;
            const platformCommission = (grossAmount * COMMISSION_RATE) / 100;
            const hostShare = grossAmount - platformCommission;
            const gstOnCommission = (platformCommission * 18) / 100; // 18% GST
            const netCommission = platformCommission - gstOnCommission;

            await supabase.from("commissions").insert({
                booking_id: data.id,
                property_id: data.property_id || null,
                package_id: data.package_id || null,
                gross_amount: grossAmount,
                host_share: hostShare,
                platform_commission: platformCommission,
                commission_rate: COMMISSION_RATE,
                gst_on_commission: gstOnCommission,
                net_commission: netCommission,
                razorpay_payment_id: razorpay_payment_id,
                razorpay_order_id: razorpay_order_id,
                status: 'collected'
            });

            console.log(`Commission recorded: ₹${platformCommission} (Net: ₹${netCommission})`);

            // =====================================================
            // CREATE OR GET USER WALLET
            // =====================================================
            if (data.user_id) {
                // Check if wallet exists
                const { data: existingWallet } = await supabase
                    .from("user_wallets")
                    .select("id")
                    .eq("user_id", data.user_id)
                    .single();

                if (!existingWallet) {
                    // Create wallet for first-time user
                    const { data: newWallet } = await supabase
                        .from("user_wallets")
                        .insert({ user_id: data.user_id, balance: 0 })
                        .select()
                        .single();

                    // Check for referral and credit bonus
                    const { data: referral } = await supabase
                        .from("referrals")
                        .select("*")
                        .eq("referred_user_id", data.user_id)
                        .eq("status", "signed_up")
                        .single();

                    if (referral && newWallet) {
                        // Credit referred user (new user)
                        await supabase.from("wallet_transactions").insert({
                            wallet_id: newWallet.id,
                            type: "credit",
                            amount: referral.referred_reward,
                            balance_before: 0,
                            balance_after: referral.referred_reward,
                            source: "referral_bonus",
                            referral_id: referral.id,
                            description: "Welcome referral bonus"
                        });

                        await supabase.from("user_wallets")
                            .update({
                                balance: referral.referred_reward,
                                total_credited: referral.referred_reward
                            })
                            .eq("id", newWallet.id);

                        // Credit referrer
                        const { data: referrerWallet } = await supabase
                            .from("user_wallets")
                            .select("*")
                            .eq("user_id", referral.referrer_id)
                            .single();

                        if (referrerWallet) {
                            const newBalance = referrerWallet.balance + referral.referrer_reward;
                            await supabase.from("wallet_transactions").insert({
                                wallet_id: referrerWallet.id,
                                type: "credit",
                                amount: referral.referrer_reward,
                                balance_before: referrerWallet.balance,
                                balance_after: newBalance,
                                source: "referral_bonus",
                                referral_id: referral.id,
                                booking_id: data.id,
                                description: "Referral reward for friend's booking"
                            });

                            await supabase.from("user_wallets")
                                .update({
                                    balance: newBalance,
                                    total_credited: referrerWallet.total_credited + referral.referrer_reward
                                })
                                .eq("id", referrerWallet.id);
                        }

                        // Update referral status
                        await supabase.from("referrals")
                            .update({
                                status: "rewarded",
                                first_booking_id: data.id,
                                referrer_rewarded_at: new Date().toISOString(),
                                referred_rewarded_at: new Date().toISOString()
                            })
                            .eq("id", referral.id);

                        console.log(`Referral rewards credited for booking ${data.id}`);
                    }
                }
            }

            // =====================================================
            // CREATE ADMIN NOTIFICATION
            // =====================================================
            await supabase.from("admin_notifications").insert({
                type: "booking",
                title: "New Booking Paid",
                message: `₹${grossAmount.toLocaleString()} payment received. Commission: ₹${platformCommission.toLocaleString()}`,
                link: "/admin/bookings",
                priority: "high"
            });

            // Trigger Notifications
            await Promise.all([
                supabase.functions.invoke('send-booking-email', { body: { booking_id: data.id } }),
                supabase.functions.invoke('send-whatsapp', { body: { booking_id: data.id } })
            ]);

            console.log(`Booking ${data.id} marked as PAID via Webhook.`);
        }

        // Handle 'payment.failed'
        else if (event === "payment.failed") {
            const { error } = await supabase
                .from("package_bookings")
                .update({
                    status: "failed", // Or keep as pending? Failed is better for clarity.
                    updated_at: new Date().toISOString()
                })
                .eq("razorpay_order_id", razorpay_order_id);

            if (error) console.error("Error marking booking as failed:", error);
            else console.log(`Booking for order ${razorpay_order_id} marked as FAILED.`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Webhook Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
