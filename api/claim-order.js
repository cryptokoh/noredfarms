/**
 * Claim Order - Link guest order to new account
 * Called after post-purchase signup to attach the order to the user
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { stripeSessionId, userId } = JSON.parse(event.body);

        if (!stripeSessionId || !userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing stripeSessionId or userId' })
            };
        }

        // Verify the user exists
        const { data: user, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userErr || !user) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        // Update the order — only claim if currently unclaimed (user_id IS NULL)
        const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .update({ user_id: userId })
            .eq('stripe_session_id', stripeSessionId)
            .is('user_id', null)
            .select('id')
            .single();

        if (orderErr) {
            // Could be already claimed or not found
            console.error('Claim order error:', orderErr);
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ error: 'Order already claimed or not found' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ claimed: true, orderId: order.id })
        };

    } catch (error) {
        console.error('Claim order error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to claim order' })
        };
    }
};
