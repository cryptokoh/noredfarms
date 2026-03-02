/**
 * Stripe Course Checkout - Netlify Function
 * Creates a Stripe Checkout session for course tier purchases.
 *
 * Receives: { tierId, courseSlug, userId, userEmail }
 * Returns:  { sessionId, url }
 */

require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const TIER_PRICES = {
    1: { amount: 10000,  name: 'Tier 1 - Home Grower',           desc: 'At-home automated growing & basic extraction' },
    2: { amount: 50000,  name: 'Tier 2 - Advanced Practitioner',  desc: 'Advanced regenerative agriculture & extraction mastery' },
    3: { amount: 200000, name: 'Tier 3 - Small Business',         desc: 'Medium business scale: greenhouse, lab testing, 2 methods' },
    4: { amount: 1000000, name: 'Tier 4 - Industrial Operations', desc: 'Industrial wholesale: linked systems, lab, formulation' }
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { tierId, courseSlug, userId, userEmail } = JSON.parse(event.body);

        if (!tierId || !userId || !userEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: tierId, userId, userEmail' })
            };
        }

        const tier = TIER_PRICES[tierId];
        if (!tier) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid tier ID. Must be 1-4.' })
            };
        }

        const baseUrl = process.env.URL || 'https://noredfarms.netlify.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: tier.name,
                        description: tier.desc
                    },
                    unit_amount: tier.amount
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${baseUrl}/courses/dashboard.html?enrolled=true&tier=${tierId}`,
            cancel_url: `${baseUrl}/classes.html?cancelled=true`,
            customer_email: userEmail,
            metadata: {
                tier_id: String(tierId),
                course_slug: courseSlug || 'all',
                user_id: userId,
                purchase_date: new Date().toISOString()
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ sessionId: session.id, url: session.url })
        };

    } catch (error) {
        console.error('Stripe course checkout error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create checkout session', message: error.message })
        };
    }
};
