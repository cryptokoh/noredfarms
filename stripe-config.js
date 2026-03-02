/**
 * Stripe Client Configuration
 * Loads publishable key from environment (via build process) or falls back to test key
 */

const StripeConfig = {
    // In production, this should come from your build process environment variables
    // For Netlify: Set in Site Settings > Build & Deploy > Environment
    // For Vercel: Set in Project Settings > Environment Variables
    publishableKey: 'pk_test_51Sy23yBg05CEGIZTwbLLxRmU31Fm1aclLMFHoe5leI64VZf5HkLAeNORGbV75bPWcGUuM4Vx2FW3eYSA18LGHa2Y00uijqhK85',

    // API endpoint - adjust based on your deployment
    // For local development:
    apiEndpoint: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api/create-checkout-session'
        // For Netlify Functions:
        : '/.netlify/functions/create-checkout-session',
        // For Vercel:
        // : '/api/create-checkout-session',

    // Stripe.js instance (initialized lazily)
    _stripe: null,

    // Get or initialize Stripe instance
    getStripe() {
        if (!this._stripe && window.Stripe) {
            this._stripe = window.Stripe(this.publishableKey);
        }
        return this._stripe;
    },

    // Create checkout session
    async createCheckoutSession(items, customerEmail = null) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items, customerEmail }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            return await response.json();
        } catch (error) {
            console.error('Checkout session error:', error);
            throw error;
        }
    },

    // Redirect to Stripe Checkout
    async redirectToCheckout(sessionId) {
        const stripe = this.getStripe();
        if (!stripe) {
            throw new Error('Stripe.js not loaded');
        }

        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            throw new Error(error.message);
        }
    }
};

// Make available globally
window.StripeConfig = StripeConfig;
