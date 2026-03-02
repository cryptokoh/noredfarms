# Stripe Checkout Integration Setup Guide

## 🎯 Overview

This site now has full Stripe Checkout integration for secure payment processing. Your Stripe keys are stored securely in `.env` (never committed to git).

**Test Keys Configured:**
- Publishable Key: `pk_test_YOUR_PUBLISHABLE_KEY_HERE`
- Secret Key: `sk_test_YOUR_SECRET_KEY_HERE`

---

## 📁 Files Created

### Frontend Files
- **`stripe-config.js`** - Stripe.js configuration and API endpoint
- **`success.html`** - Order confirmation page
- **`cancel.html`** - Checkout cancellation page
- **`cart.js`** (updated) - Real Stripe checkout integration

### Backend Files
- **`api/create-checkout-session.js`** - Serverless function for creating Stripe sessions
- **`package.json`** - Node.js dependencies
- **`netlify.toml`** - Netlify deployment configuration

### Security Files
- **`.env`** - Stripe API keys (NEVER commit this)
- **`.gitignore`** - Protects sensitive files

---

## 🚀 Deployment Options

### Option 1: Netlify (Recommended - Easiest)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Netlify:**
   ```bash
   # Option A: Use Netlify CLI
   npm install -g netlify-cli
   netlify init
   netlify deploy --prod

   # Option B: Connect GitHub repo in Netlify UI
   # - Go to https://app.netlify.com
   # - Click "Add new site" → "Import from Git"
   # - Connect your repository
   ```

3. **Set Environment Variables in Netlify:**
   - Go to Site Settings → Build & Deploy → Environment
   - Add:
     - `STRIPE_SECRET_KEY` = `sk_test_YOUR_SECRET_KEY_HERE`
     - `STRIPE_PUBLISHABLE_KEY` = `pk_test_YOUR_PUBLISHABLE_KEY_HERE`

4. **Done!** Your API endpoint will be: `/.netlify/functions/create-checkout-session`

---

### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_PUBLISHABLE_KEY
   ```

4. **Update `stripe-config.js`:**
   Change the API endpoint to:
   ```javascript
   apiEndpoint: '/api/create-checkout-session'
   ```

---

### Option 3: Local Testing

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Local API Server:**
   ```bash
   npm run dev
   # Server starts on http://localhost:3001
   ```

3. **Serve Static Files:**
   ```bash
   # In another terminal
   python -m http.server 8000
   # or
   npx serve .
   ```

4. **Test Checkout:**
   - Open http://localhost:8000
   - Add items to cart
   - Click checkout
   - Use Stripe test card: `4242 4242 4242 4242`

---

## 🔧 Adding Stripe to HTML Pages

Add these lines to any page with a cart/checkout button (already in `index.html`):

```html
<!-- Before closing </body> tag -->
<script src="https://js.stripe.com/v3/"></script>
<script src="/stripe-config.js"></script>
<script src="/cart.js"></script>
```

---

## 💳 Testing Payments

### Test Credit Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | Requires authentication |

- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

---

## 🔐 Security Best Practices

### ✅ Current Security Measures:
- ✅ Secret keys stored in `.env` (not committed)
- ✅ `.gitignore` prevents accidental commits
- ✅ Publishable key safe for frontend use
- ✅ Payment processing happens server-side
- ✅ Stripe Checkout handles all sensitive data

### ⚠️ Before Going Live:

1. **Get Production Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Live** keys (start with `pk_live_` and `sk_live_`)

2. **Update Environment Variables:**
   - **Netlify:** Site Settings → Environment → Update variables
   - **Vercel:** `vercel env add STRIPE_SECRET_KEY production`
   - **Never** put live keys in `.env` files in your repository

3. **Enable Webhook Endpoints:**
   ```javascript
   // In api/create-checkout-session.js, uncomment:
   // automatic_tax: { enabled: true },
   ```

4. **Test in Production Mode:**
   - Use real card (small amount)
   - Verify email confirmations
   - Check Stripe dashboard

---

## 🧪 Webhook Setup (Optional - for order tracking)

1. **Create Webhook in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yoursite.com/.netlify/functions/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`

2. **Create Webhook Handler:**
   ```javascript
   // api/stripe-webhook.js
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

   exports.handler = async (event) => {
       const sig = event.headers['stripe-signature'];

       try {
           const stripeEvent = stripe.webhooks.constructEvent(
               event.body,
               sig,
               process.env.STRIPE_WEBHOOK_SECRET
           );

           if (stripeEvent.type === 'checkout.session.completed') {
               // Handle successful payment
               // - Send confirmation email
               // - Update inventory
               // - Create order record
           }

           return { statusCode: 200, body: 'Success' };
       } catch (err) {
           return { statusCode: 400, body: err.message };
       }
   };
   ```

---

## 📊 Monitoring & Analytics

### Stripe Dashboard
- View all transactions: https://dashboard.stripe.com/payments
- Monitor test vs live mode
- Check for declined payments
- Review customer disputes

### Google Analytics (Already integrated)
Track checkout funnel:
1. Product view
2. Add to cart
3. Checkout initiated
4. Payment completed

---

## 🐛 Troubleshooting

### "Stripe not configured" Error
**Solution:** Make sure `stripe-config.js` is loaded before `cart.js`:
```html
<script src="/stripe-config.js"></script>
<script src="/cart.js"></script>
```

### "Unable to connect to payment processor"
**Solutions:**
- Check if API server is running (local dev)
- Verify environment variables are set (production)
- Check browser console for CORS errors
- Ensure `api/create-checkout-session.js` is deployed

### Redirect Not Working
**Solution:** Update success/cancel URLs in `api/create-checkout-session.js`:
```javascript
success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${baseUrl}/cancel.html`,
```

### "Invalid API Key"
**Solutions:**
- Verify `.env` file exists and has correct keys
- Check environment variables in hosting platform
- Ensure no extra spaces in API keys
- Confirm test/live mode matches your keys

---

## 📝 Next Steps

1. ✅ **Test locally** using `npm run dev`
2. ✅ **Deploy to Netlify/Vercel**
3. ⬜ **Enable cart on website** (currently disabled in `cart.js` line 484)
4. ⬜ **Add product images** to Stripe checkout
5. ⬜ **Set up webhook** for order notifications
6. ⬜ **Configure shipping rates** in Stripe
7. ⬜ **Switch to production keys** when ready to go live

---

## 🆘 Support

- **Stripe Documentation:** https://stripe.com/docs/checkout
- **Stripe Support:** https://support.stripe.com
- **Test Cards:** https://stripe.com/docs/testing

---

## 🎉 You're All Set!

Your site now has professional Stripe Checkout integration. Test thoroughly before going live!
