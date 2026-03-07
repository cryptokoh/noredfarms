/**
 * Stripe Webhook Handler - Netlify Function
 * Processes checkout.session.completed events to:
 *  1. Upgrade profiles.tier_level (only if new tier > current)
 *  2. Upsert enrollments for ALL published courses at purchased tier and below
 *
 * Environment variables needed:
 *  - STRIPE_SECRET_KEY
 *  - STRIPE_WEBHOOK_SECRET
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        const metadata = session.metadata || {};

        try {
            // --- Course enrollment flow (existing) ---
            if (metadata.tier_id && metadata.user_id) {
                const tierId = parseInt(metadata.tier_id, 10);
                const userId = metadata.user_id;

                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('tier_level')
                    .eq('id', userId)
                    .single();

                if (!profile || tierId > profile.tier_level) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({ tier_level: tierId, updated_at: new Date().toISOString() })
                        .eq('id', userId);
                }

                const { data: courses } = await supabaseAdmin
                    .from('courses')
                    .select('id, slug')
                    .eq('is_published', true)
                    .lte('min_tier', tierId);

                if (courses && courses.length > 0) {
                    const enrollments = courses.map(course => ({
                        user_id: userId,
                        course_id: course.id,
                        tier_level: tierId,
                        stripe_session_id: session.id,
                        is_active: true
                    }));
                    await supabaseAdmin
                        .from('enrollments')
                        .upsert(enrollments, { onConflict: 'user_id,course_id' });
                }
                console.log(`Enrolled user ${userId} at tier ${tierId} in ${courses ? courses.length : 0} courses`);
            }

            // --- Product order recording (new) ---
            const totalCents = session.amount_total || 0;
            const userId = metadata.user_id || null;

            // Insert order
            const { data: order, error: orderErr } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: userId || null,
                    stripe_session_id: session.id,
                    stripe_payment_intent: session.payment_intent || null,
                    total_cents: totalCents,
                    currency: session.currency || 'usd',
                    shipping_info: session.shipping_details || {}
                })
                .select('id')
                .single();

            if (orderErr) {
                console.error('Order insert error:', orderErr);
            } else if (order && metadata.items_json) {
                // Insert line items from metadata
                try {
                    const items = JSON.parse(metadata.items_json);
                    const orderItems = items.map(item => ({
                        order_id: order.id,
                        product_id: item.id,
                        product_name: item.name,
                        quantity: item.qty,
                        unit_price_cents: Math.round(item.price * 100)
                    }));
                    await supabaseAdmin.from('order_items').insert(orderItems);
                } catch (parseErr) {
                    console.error('Items parse error:', parseErr);
                }
            }

            console.log(`Order recorded: session=${session.id}, user=${userId}, total=${totalCents}`);

        } catch (err) {
            console.error('Webhook processing error:', err);
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Processing failed' }) };
        }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
};
