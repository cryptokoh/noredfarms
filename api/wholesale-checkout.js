/**
 * Wholesale Checkout - Netlify Function
 * Handles both prepaid (Stripe) and net-terms (direct order) wholesale checkout.
 *
 * Environment variables:
 *  - STRIPE_SECRET_KEY
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
        const { items, account_id, po_number, payment_method } = JSON.parse(event.body);

        if (!items || !Array.isArray(items) || items.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items provided' }) };
        }

        if (!account_id) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No account ID' }) };
        }

        // Verify the wholesale account is approved
        const { data: account, error: accountErr } = await supabaseAdmin
            .from('wholesale_accounts')
            .select('*')
            .eq('id', account_id)
            .eq('application_status', 'approved')
            .single();

        if (accountErr || !account) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Wholesale account not found or not approved' }) };
        }

        // Calculate totals
        const subtotalCents = items.reduce((sum, item) =>
            sum + Math.round(item.wholesale_price * 100) * item.quantity, 0);

        // Check minimum order
        if (subtotalCents < account.min_order_cents) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: `Order total $${(subtotalCents / 100).toFixed(2)} is below minimum of $${(account.min_order_cents / 100).toFixed(2)}`
                })
            };
        }

        if (payment_method === 'net_terms') {
            // Create order directly (no Stripe)
            const { data: order, error: orderErr } = await supabaseAdmin
                .from('wholesale_orders')
                .insert({
                    account_id: account.id,
                    user_id: account.user_id,
                    po_number: po_number || null,
                    status: 'confirmed',
                    payment_method: 'net_terms',
                    subtotal_cents: subtotalCents,
                    total_cents: subtotalCents,
                    shipping_address: account.shipping_addresses?.[0] || null
                })
                .select('id, order_number')
                .single();

            if (orderErr) throw orderErr;

            // Insert line items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price_cents: Math.round(item.wholesale_price * 100),
                total_cents: Math.round(item.wholesale_price * 100) * item.quantity
            }));
            await supabaseAdmin.from('wholesale_order_items').insert(orderItems);

            // Calculate due date based on payment terms
            const termsDays = { net15: 15, net30: 30, net60: 60 };
            const days = termsDays[account.payment_terms] || 30;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + days);

            // Create invoice
            await supabaseAdmin.from('wholesale_invoices').insert({
                order_id: order.id,
                account_id: account.id,
                subtotal_cents: subtotalCents,
                total_cents: subtotalCents,
                due_date: dueDate.toISOString().split('T')[0]
            });

            // Send order confirmation email (non-blocking)
            const baseUrl = process.env.URL || 'https://noredfarms.netlify.app';
            fetch(baseUrl + '/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template: 'order-confirmed',
                    to: account.contact_email,
                    data: {
                        order_number: order.order_number,
                        po_number: po_number || null,
                        item_count: items.length,
                        total_cents: subtotalCents
                    }
                })
            }).catch(e => console.error('Order email error:', e));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    order_id: order.id,
                    order_number: order.order_number
                })
            };

        } else {
            // Prepaid: create Stripe checkout session
            const baseUrl = process.env.URL || 'https://noredfarms.netlify.app';

            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: `Wholesale - ${item.category}`
                    },
                    unit_amount: Math.round(item.wholesale_price * 100)
                },
                quantity: item.quantity
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${baseUrl}/wholesale/dashboard.html?checkout=success`,
                cancel_url: `${baseUrl}/wholesale/dashboard.html?checkout=cancelled`,
                metadata: {
                    order_type: 'wholesale',
                    account_id: account.id,
                    user_id: account.user_id,
                    po_number: po_number || '',
                    items_json: JSON.stringify(items.map(i => ({
                        id: i.id, name: i.name, qty: i.quantity,
                        wholesale_price: i.wholesale_price, retail_price: i.retail_price
                    })))
                }
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ sessionId: session.id, url: session.url })
            };
        }

    } catch (error) {
        console.error('Wholesale checkout error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Checkout failed', message: error.message })
        };
    }
};
