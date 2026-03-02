# Nored Farms - E-Commerce Site

Premium botanical extracts website with integrated Stripe checkout.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local API server:**
   ```bash
   npm run dev
   ```
   This starts the Stripe checkout API on http://localhost:3001

3. **Serve the static site (in another terminal):**
   ```bash
   # Option 1: Python
   python -m http.server 8000

   # Option 2: Node.js
   npx serve .

   # Option 3: PHP
   php -S localhost:8000
   ```

4. **Test the checkout:**
   - Open http://localhost:8000
   - Add items to cart
   - Use Stripe test card: `4242 4242 4242 4242`

## 📁 Project Structure

```
noredfarms/
├── api/
│   └── create-checkout-session.js  # Stripe API endpoint
├── articles/                        # Blog posts & guides
├── products/                        # Product pages
├── .env                            # Stripe API keys (DO NOT COMMIT)
├── .env.example                    # Environment template
├── stripe-config.js                # Frontend Stripe config
├── cart.js                         # Shopping cart system
├── success.html                    # Payment success page
├── cancel.html                     # Payment cancel page
├── index.html                      # Homepage
└── netlify.toml                    # Netlify deployment config
```

## 🔐 Environment Variables

Required environment variables in `.env`:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional, for webhooks
STRIPE_MODE=test
```

**Security:** The `.env` file is protected by `.gitignore` and will never be committed.

## 🌐 Deployment

### Deploy to Netlify (Recommended)

1. **Connect your repository:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import from Git"
   - Select your repository

2. **Configure build settings:**
   - Build command: (leave empty for static site)
   - Publish directory: `.`
   - Functions directory: `api`

3. **Add environment variables:**
   - Go to Site Settings → Environment Variables
   - Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

4. **Deploy!** 
   - Netlify will auto-deploy on every push to main branch

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
```

Then update `stripe-config.js` to use `/api/create-checkout-session` endpoint.

## 💳 Testing Payments

Use these test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires 3D Secure |

- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 📚 Documentation

- **Setup Guide:** See `STRIPE_SETUP.md` for detailed integration docs
- **Stripe Docs:** https://stripe.com/docs/checkout
- **Test Cards:** https://stripe.com/docs/testing

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Payments:** Stripe Checkout
- **Backend:** Serverless Functions (Netlify/Vercel)
- **Hosting:** Netlify / Vercel
- **Analytics:** Google Analytics 4

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ `.gitignore` protects sensitive files
- ✅ Server-side payment processing
- ✅ Stripe handles all card data (PCI compliant)
- ✅ HTTPS enforced in production

## 📝 License

Copyright © 2024 Nored Farms. All rights reserved.
