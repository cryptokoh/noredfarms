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
        const { tier_id, user_id, course_slug } = session.metadata;
        const tierId = parseInt(tier_id, 10);

        try {
            // 1. Upgrade tier (only if new tier > current)
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('tier_level')
                .eq('id', user_id)
                .single();

            if (!profile || tierId > profile.tier_level) {
                await supabaseAdmin
                    .from('profiles')
                    .update({ tier_level: tierId, updated_at: new Date().toISOString() })
                    .eq('id', user_id);
            }

            // 2. Enroll in all published courses at purchased tier and below
            const { data: courses } = await supabaseAdmin
                .from('courses')
                .select('id, slug')
                .eq('is_published', true)
                .lte('min_tier', tierId);

            if (courses && courses.length > 0) {
                const enrollments = courses.map(course => ({
                    user_id,
                    course_id: course.id,
                    tier_level: tierId,
                    stripe_session_id: session.id,
                    is_active: true
                }));

                await supabaseAdmin
                    .from('enrollments')
                    .upsert(enrollments, { onConflict: 'user_id,course_id' });
            }

            console.log(`Enrolled user ${user_id} at tier ${tierId} in ${courses ? courses.length : 0} courses`);

        } catch (err) {
            console.error('Webhook processing error:', err);
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Processing failed' }) };
        }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
};
