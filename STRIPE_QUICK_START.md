# 🚀 Stripe Checkout - Quick Start Guide

## ✅ Status: READY TO TEST

Your Stripe integration test **PASSED**! All systems operational.

---

## 🏃 Quick Start (30 seconds)

```bash
# Terminal 1: Start Stripe API
npm run dev

# Terminal 2: Serve website
python -m http.server 8000

# Terminal 3: Test it (optional)
node test-stripe.js
```

Then open: **http://localhost:8000**

---

## 💳 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 9995` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 3D Secure |

**Details:** Any future date + any 3 digits + any ZIP

---

## 📂 What Was Created

### ✨ Frontend Files
- `stripe-config.js` - Stripe.js setup
- `success.html` - Payment success page
- `cancel.html` - Payment cancelled page
- `cart.js` (updated) - Real Stripe checkout

### ⚙️ Backend Files
- `api/create-checkout-session.js` - Serverless API
- `package.json` - Dependencies
- `netlify.toml` - Deployment config

### 🔐 Security Files
- `.env` - Your API keys (PROTECTED)
- `.gitignore` - Security rules
- `.env.example` - Template for others

### 📚 Documentation
- `STRIPE_SETUP.md` - Complete guide
- `README.md` - Project overview
- `STRIPE_QUICK_START.md` - This file!
- `test-stripe.js` - Integration test

---

## 🌐 Deploy to Production

### Netlify (Recommended)

1. Push to GitHub
2. Go to https://app.netlify.com
3. Import your repository
4. Add environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
5. Deploy!

**Your API will be at:** `/.netlify/functions/create-checkout-session`

---

## 🎯 Current Configuration

```
✅ Mode: TEST
✅ Balance: $0.00 USD
✅ API Connection: Working
✅ Checkout Sessions: Working
✅ Success/Cancel Pages: Created
```

---

## ⚠️ Before Going LIVE

1. Get **production keys** from Stripe Dashboard
2. Update environment variables (NOT in .env!)
3. Test with small real payment
4. Enable webhooks (optional but recommended)
5. Add product images to checkout

---

## 🆘 Troubleshooting

### "Stripe not configured"
**Fix:** Check that `stripe-config.js` loads before `cart.js` in HTML

### "Unable to connect to payment processor"
**Fix:** Make sure API server is running (`npm run dev`)

### Checkout button doesn't work
**Fix:** Enable cart by uncommenting `Cart.init()` in `cart.js` line 484

---

## 📞 Support

- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **Dashboard:** https://dashboard.stripe.com

---

## 🎉 You're Ready!

Test locally first, then deploy to production when ready.

**Remember:** Switch to LIVE keys before accepting real payments!
