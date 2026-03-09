/**
 * Wholesale Cart - Nored Farms
 * Adapted from cart.js for wholesale pricing, min quantities, and bulk controls.
 * Depends on: supabase-config.js, auth.js
 */

const WholesaleCart = {
    items: [],
    account: null,
    getDiscountRate: null,
    getProductPrice: null,

    init(account, getDiscountRate, getProductPrice) {
        this.account = account;
        this.getDiscountRate = getDiscountRate;
        this.getProductPrice = getProductPrice;

        // Load from localStorage
        const saved = localStorage.getItem('noredfarms-wholesale-cart');
        if (saved) {
            try { this.items = JSON.parse(saved); } catch (e) { this.items = []; }
        }

        this.render();
        this.bindCheckout();
    },

    /**
     * Add product from catalog card button click.
     */
    addFromCatalog(productId, buttonEl) {
        const card = buttonEl.closest('.ws-product-card');
        const qtyInput = card.querySelector('.ws-qty-input');
        const qty = parseInt(qtyInput.value) || 1;
        const minQty = parseInt(qtyInput.dataset.min) || 1;

        if (qty < minQty) {
            qtyInput.value = minQty;
            return;
        }

        // Find product in PRODUCTS array
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const { price } = this.getProductPrice(product);

        const existing = this.items.find(i => i.id === productId);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                category: product.category,
                retail_price: product.retail_price,
                wholesale_price: price,
                quantity: qty,
                min_qty: parseInt(qtyInput.dataset.min) || 1
            });
        }

        this.save();
        this.render();

        // Brief feedback
        buttonEl.textContent = 'Added!';
        setTimeout(() => { buttonEl.textContent = 'Add to Cart'; }, 800);
    },

    removeItem(productId) {
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
        this.render();
    },

    updateQuantity(productId, qty) {
        const item = this.items.find(i => i.id === productId);
        if (!item) return;

        if (qty < item.min_qty) {
            qty = item.min_qty;
        }
        if (qty <= 0) {
            this.removeItem(productId);
            return;
        }

        item.quantity = qty;
        this.save();
        this.render();
    },

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + item.wholesale_price * item.quantity, 0);
    },

    getRetailTotal() {
        return this.items.reduce((sum, item) => sum + item.retail_price * item.quantity, 0);
    },

    getDiscount() {
        return this.getRetailTotal() - this.getSubtotal();
    },

    save() {
        localStorage.setItem('noredfarms-wholesale-cart', JSON.stringify(this.items));
    },

    clear() {
        this.items = [];
        this.save();
        this.render();
    },

    render() {
        const cartItemsEl = document.getElementById('wsCartItems');
        const cartTotals = document.getElementById('cartTotals');
        const cartDivider = document.getElementById('cartDivider');
        const minWarning = document.getElementById('minWarning');
        const checkoutBtn = document.getElementById('wsCheckoutBtn');
        const minOrderAmt = document.getElementById('minOrderAmt');

        if (!cartItemsEl) return;

        if (this.items.length === 0) {
            cartItemsEl.innerHTML = '<div class="ws-empty"><div class="ws-empty-icon">&#128722;</div><p>Cart is empty</p></div>';
            if (cartTotals) cartTotals.style.display = 'none';
            if (cartDivider) cartDivider.style.display = 'none';
            if (minWarning) minWarning.style.display = 'none';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        cartItemsEl.innerHTML = this.items.map(item => `
            <div class="ws-cart-item">
                <div>
                    <div class="ws-cart-item-name">${item.name}</div>
                    <div class="ws-cart-item-qty">${item.quantity} x $${item.wholesale_price.toFixed(2)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="ws-cart-item-price">$${(item.wholesale_price * item.quantity).toFixed(2)}</span>
                    <button class="ws-cart-item-remove" onclick="WholesaleCart.removeItem('${item.id}')">&times;</button>
                </div>
            </div>
        `).join('');

        if (cartTotals) cartTotals.style.display = 'block';
        if (cartDivider) cartDivider.style.display = 'block';

        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const total = subtotal;
        const minOrderCents = this.account ? this.account.min_order_cents : 50000;
        const minOrder = minOrderCents / 100;

        const subtotalEl = document.getElementById('cartSubtotal');
        const discountEl = document.getElementById('cartDiscount');
        const totalEl = document.getElementById('cartTotal');

        if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
        if (discountEl) discountEl.textContent = discount > 0 ? '-$' + discount.toFixed(2) : '—';
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        if (minOrderAmt) minOrderAmt.textContent = '$' + minOrder.toFixed(0);

        const meetsMinimum = total >= minOrder;
        if (minWarning) minWarning.style.display = meetsMinimum ? 'none' : 'block';
        if (checkoutBtn) checkoutBtn.disabled = !meetsMinimum;
    },

    bindCheckout() {
        const btn = document.getElementById('wsCheckoutBtn');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            if (this.items.length === 0) return;
            btn.textContent = 'Processing...';
            btn.disabled = true;

            try {
                const poNumber = document.getElementById('poNumber')?.value || '';
                const paymentMethod = this.account.payment_terms === 'prepaid' ? 'prepaid' : 'net_terms';

                const response = await fetch('/api/wholesale-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: this.items,
                        account_id: this.account.id,
                        po_number: poNumber,
                        payment_method: paymentMethod
                    })
                });

                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Checkout failed');

                if (result.url) {
                    // Stripe checkout redirect (prepaid)
                    window.location.href = result.url;
                } else if (result.order_id) {
                    // Net terms order created directly
                    this.clear();
                    alert('Order placed successfully! Order #' + result.order_number);
                    // Switch to orders tab
                    document.querySelector('.ws-tab[data-tab="orders"]')?.click();
                }
            } catch (err) {
                console.error('Checkout error:', err);
                alert('Checkout error: ' + err.message);
                btn.textContent = 'Place Order';
                btn.disabled = false;
            }
        });
    }
};
