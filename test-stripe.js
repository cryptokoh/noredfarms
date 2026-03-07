/**
 * Stripe Integration Test Script
 * Quick test to verify your Stripe setup is working
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
    console.log('🧪 Testing Stripe Integration...\n');

    // Test 1: Verify API keys are loaded
    console.log('1️⃣  Checking environment variables...');
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('   ❌ STRIPE_SECRET_KEY not found in .env');
        return;
    }
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        console.error('   ❌ STRIPE_PUBLISHABLE_KEY not found in .env');
        return;
    }
    console.log('   ✅ Environment variables loaded');
    console.log(`   📝 Mode: ${process.env.STRIPE_MODE || 'test'}`);
    console.log(`   🔑 Secret Key: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);
    console.log(`   🔓 Publishable Key: ${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...`);

    // Test 2: Verify Stripe API connection
    console.log('\n2️⃣  Testing Stripe API connection...');
    try {
        const balance = await stripe.balance.retrieve();
        console.log('   ✅ Successfully connected to Stripe API');
        console.log(`   💰 Account Balance: ${balance.available[0]?.amount / 100 || 0} ${balance.available[0]?.currency?.toUpperCase() || 'USD'}`);
    } catch (error) {
        console.error('   ❌ Failed to connect to Stripe API');
        console.error(`   Error: ${error.message}`);
        return;
    }

    // Test 3: Create a test checkout session
    console.log('\n3️⃣  Creating test checkout session...');
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Test Product - Kanna Extract',
                            description: 'Premium botanical extract',
                        },
                        unit_amount: 4999, // $49.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://example.com/cancel',
        });

        console.log('   ✅ Test checkout session created successfully');
        console.log(`   🆔 Session ID: ${session.id}`);
        console.log(`   🔗 Checkout URL: ${session.url}`);
        console.log(`   💵 Amount: $${session.amount_total / 100}`);
        console.log(`   📧 Customer Email: ${session.customer_email || 'Not provided'}`);
    } catch (error) {
        console.error('   ❌ Failed to create checkout session');
        console.error(`   Error: ${error.message}`);
        return;
    }

    console.log('\n✨ All tests passed! Your Stripe integration is ready.\n');
    console.log('📋 Next steps:');
    console.log('   1. Run "npm run dev" to start the local API server');
    console.log('   2. Serve the static site with "python -m http.server 8000"');
    console.log('   3. Test checkout at http://localhost:8000');
    console.log('   4. Use test card: 4242 4242 4242 4242\n');
}

// Run the tests
testStripeIntegration().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
