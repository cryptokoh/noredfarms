/**
 * Approve Wholesale Application - Netlify Function
 * Admin action: updates account status, sets tier/terms, updates profile role.
 *
 * Environment variables:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY
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
        const { account_id, user_id, discount_tier, payment_terms, min_order_cents } = JSON.parse(event.body);

        if (!account_id || !user_id) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing account_id or user_id' }) };
        }

        // Update wholesale account
        const { error: accountErr } = await supabaseAdmin
            .from('wholesale_accounts')
            .update({
                application_status: 'approved',
                discount_tier: discount_tier || 'standard',
                payment_terms: payment_terms || 'prepaid',
                min_order_cents: min_order_cents || 50000,
                approved_at: new Date().toISOString()
            })
            .eq('id', account_id);

        if (accountErr) throw accountErr;

        // Update user's profile role to 'wholesale'
        const { error: profileErr } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'wholesale' })
            .eq('id', user_id);

        if (profileErr) throw profileErr;

        // Send approval email (non-blocking)
        const { data: account } = await supabaseAdmin
            .from('wholesale_accounts')
            .select('company_name, contact_email')
            .eq('id', account_id)
            .single();

        if (account) {
            fetch((process.env.URL || 'https://noredfarms.netlify.app') + '/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template: 'wholesale-approved',
                    to: account.contact_email,
                    data: {
                        company_name: account.company_name,
                        discount_tier: discount_tier || 'standard',
                        payment_terms: payment_terms || 'prepaid',
                        min_order_cents: min_order_cents || 50000
                    }
                })
            }).catch(e => console.error('Approval email error:', e));
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error('Approve wholesale error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Approval failed', message: error.message })
        };
    }
};
