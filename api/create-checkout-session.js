/**
 * Stripe Checkout Session Creator
 * Serverless function for creating Stripe checkout sessions
 * Supports guest checkout with pre-collected shipping info
 * Deploy to: Netlify Functions, Vercel, AWS Lambda, etc.
 */

// For Netlify Functions / Vercel, uncomment:
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// For local testing or custom deployment:
require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { items, customerEmail, userId, shippingAddress } = JSON.parse(event.body);

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid cart items' })
            };
        }

        // Convert cart items to Stripe line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.category,
                    // Add images if you have them:
                    // images: [item.imageUrl],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Calculate subtotal for free shipping threshold
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Build shipping options: free over $100, flat $8 otherwise
        const shippingOptions = [];
        if (subtotal >= 100) {
            shippingOptions.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 0,
                        currency: 'usd',
                    },
                    display_name: 'Free Shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 5 },
                        maximum: { unit: 'business_day', value: 7 },
                    },
                },
            });
        } else {
            shippingOptions.push(
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 800, // $8.00
                            currency: 'usd',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd',
                        },
                        display_name: 'Free Shipping (orders over $100)',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                }
            );
            // Only show the free option as informational if under $100
            // Actually just show standard shipping as the only real option
            shippingOptions.length = 0;
            shippingOptions.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 800,
                        currency: 'usd',
                    },
                    display_name: 'Standard Shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 5 },
                        maximum: { unit: 'business_day', value: 7 },
                    },
                },
            });
        }

        // Determine success/cancel URLs based on environment
        const baseUrl = process.env.URL || 'https://noredfarms.netlify.app';

        // Build session configuration
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel.html`,
            shipping_options: shippingOptions,
            // Allow Stripe to collect/confirm shipping address as fallback
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            billing_address_collection: 'required',
            metadata: {
                orderDate: new Date().toISOString(),
                itemCount: String(items.reduce((sum, item) => sum + item.quantity, 0)),
                user_id: userId || '',
                items_json: JSON.stringify(items.map(i => ({
                    id: i.id, name: i.name, qty: i.quantity, price: i.price
                }))),
            },
            // Automatic tax calculation (if enabled in Stripe)
            // automatic_tax: { enabled: true },
        };

        // Set customer email for guest checkout (no Stripe login required)
        if (customerEmail) {
            sessionConfig.customer_email = customerEmail;
        }

        // If shipping address was pre-collected, store it in metadata
        // so the Stripe checkout page can pre-fill shipping fields
        if (shippingAddress) {
            sessionConfig.metadata.shipping_name = shippingAddress.name || '';
            sessionConfig.metadata.shipping_line1 = shippingAddress.address_line1 || '';
            sessionConfig.metadata.shipping_city = shippingAddress.city || '';
            sessionConfig.metadata.shipping_state = shippingAddress.state || '';
            sessionConfig.metadata.shipping_zip = shippingAddress.postal_code || '';
            sessionConfig.metadata.shipping_country = shippingAddress.country || 'US';
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                sessionId: session.id,
                url: session.url
            })
        };

    } catch (error) {
        console.error('Stripe error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create checkout session',
                message: error.message
            })
        };
    }
};

// For local testing with Express:
if (require.main === module) {
    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.post('/api/create-checkout-session', async (req, res) => {
        const result = await exports.handler({
            httpMethod: 'POST',
            body: JSON.stringify(req.body)
        }, {});

        res.status(result.statusCode).json(JSON.parse(result.body));
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Local API server running on http://localhost:${PORT}`);
        console.log(`Test endpoint: POST http://localhost:${PORT}/api/create-checkout-session`);
    });
}
