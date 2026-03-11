/**
 * Get Checkout Session Details
 * Retrieves Stripe session info for the success page
 * Returns: customer email, line items, totals, shipping
 */

require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const sessionId = event.queryStringParameters?.session_id;
    if (!sessionId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing session_id' }) };
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });

        // Only return safe, non-sensitive data
        const result = {
            customer_email: session.customer_details?.email || session.customer_email || '',
            customer_name: session.customer_details?.name || session.metadata?.shipping_name || '',
            amount_total: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            shipping: session.shipping_details || {
                name: session.metadata?.shipping_name || '',
                address: {
                    line1: session.metadata?.shipping_line1 || '',
                    city: session.metadata?.shipping_city || '',
                    state: session.metadata?.shipping_state || '',
                    postal_code: session.metadata?.shipping_zip || '',
                    country: session.metadata?.shipping_country || 'US'
                }
            },
            items: (session.line_items?.data || []).map(item => ({
                name: item.description,
                quantity: item.quantity,
                amount: item.amount_total
            })),
            metadata: {
                orderDate: session.metadata?.orderDate || new Date().toISOString(),
                itemCount: session.metadata?.itemCount || '0'
            }
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Session retrieval error:', error);
        return {
            statusCode: error.statusCode || 500,
            headers,
            body: JSON.stringify({ error: 'Failed to retrieve session details' })
        };
    }
};
