/**
 * Stripe Checkout Session Creator
 * Serverless function for creating Stripe checkout sessions
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
        const { items, customerEmail } = JSON.parse(event.body);

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

        // Determine success/cancel URLs based on environment
        const baseUrl = process.env.URL || 'https://noredfarms.netlify.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel.html`,
            customer_email: customerEmail || undefined,
            shipping_address_collection: {
                allowed_countries: ['US'], // Adjust based on your shipping countries
            },
            billing_address_collection: 'required',
            // Add metadata for order tracking
            metadata: {
                orderDate: new Date().toISOString(),
                itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            },
            // Automatic tax calculation (if enabled in Stripe)
            // automatic_tax: { enabled: true },
        });

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
