
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Get enabled alerts where price dropped
        const { data: wishlists, error: wishError } = await supabase
            .from('wishlists')
            .select(`
        id,
        user_id,
        target_price,
        alert_sent_at,
        packages!inner (
          id,
          name,
          price,
          slug,
          images
        )
      `)
            .eq('price_alert_enabled', true);

        if (wishError) {
            throw wishError;
        }

        const alertsToSend = [];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        for (const item of wishlists) {
            const currentPrice = item.packages?.price;
            const targetPrice = item.target_price || 99999999;
            const lastSent = item.alert_sent_at ? new Date(item.alert_sent_at) : null;

            // Logic: Price is lower AND (never sent OR sent > 7 days ago)
            if (currentPrice && currentPrice < targetPrice) {
                if (!lastSent || lastSent < sevenDaysAgo) {

                    // Fetch User Email
                    const { data: userData } = await supabase.auth.admin.getUserById(item.user_id);
                    const userEmail = userData?.user?.email;

                    if (userEmail) {
                        alertsToSend.push({
                            email: userEmail,
                            package: item.packages,
                            price: currentPrice,
                            wishlistId: item.id
                        });
                    }
                }
            }
        }

        console.log(`Found ${alertsToSend.length} price alerts to send.`);

        // 2. Send Emails
        const results = [];
        for (const alert of alertsToSend) {
            if (!RESEND_API_KEY) {
                console.error("RESEND_API_KEY not set");
                continue;
            }

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'StayKedarnath <alerts@staykedarnath.com>', // Update with verified domain
                    to: [alert.email],
                    subject: `Price Drop Alert: ${alert.package.name} is now cheaper!`,
                    html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Good news!</h1>
                        <p>The package <strong>${alert.package.name}</strong> you wishlisted has dropped in price.</p>
                        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <img src="${alert.package.images?.[0] || ''}" style="width: 100%; border-radius: 4px; margin-bottom: 10px;" />
                            <h2 style="margin: 0;">${alert.package.name}</h2>
                            <p style="font-size: 24px; color: #16a34a; font-weight: bold; margin: 10px 0;">₹${alert.price}</p>
                            <a href="https://staykedarnath.com/package/${alert.package.slug}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Deal</a>
                        </div>
                        <p>Don't wait! Prices may change again.</p>
                    </div>
                `
                })
            });

            if (res.ok) {
                // Update last_notified_at
                await supabase.from('wishlists').update({
                    alert_sent: true,
                    alert_sent_at: new Date().toISOString(),
                    // Update target price to avoid re-alerting unless it drops FURTHER? 
                    // Plan said "update state". Let's stick strictly to preventing spam via date check.
                }).eq('id', alert.wishlistId);
                results.push({ email: alert.email, status: 'sent' });
            } else {
                const err = await res.text();
                console.error('Resend Error:', err);
                results.push({ email: alert.email, status: 'failed', error: err });
            }
        }

        return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
