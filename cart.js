/**
 * Nored Farms - Shopping Cart System
 * Frontend cart management with Stripe checkout preparation
 */

// Cart State
const Cart = {
    items: [],
    isOpen: false,
    isProcessing: false, // Prevent double-clicks

    // Initialize cart from localStorage
    init() {
        const saved = localStorage.getItem('noredfarms-cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
        this.render();
        this.updateCartCount();
        this.bindEvents();
    },

    // Add item to cart (with debounce protection)
    addItem(product) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.save();
        this.render();
        this.updateCartCount();
        this.showAddedFeedback(product.name);

        // Reset processing flag after a short delay
        setTimeout(() => {
            this.isProcessing = false;
        }, 300);
    },

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.render();
        this.updateCartCount();
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.save();
                this.render();
                this.updateCartCount();
            }
        }
    },

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    // Save to localStorage
    save() {
        localStorage.setItem('noredfarms-cart', JSON.stringify(this.items));
    },

    // Clear cart
    clear() {
        this.items = [];
        this.save();
        this.render();
        this.updateCartCount();
    },

    // Open cart sidebar
    open() {
        if (this.isOpen) return; // Prevent double-open
        this.isOpen = true;
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    },

    // Close cart sidebar
    close() {
        this.isOpen = false;
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
        document.body.style.overflow = '';
    },

    // Toggle cart
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    // Update cart count badge
    updateCartCount() {
        const count = this.getItemCount();
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    // Show feedback when item is added (simpler than notification + sidebar)
    showAddedFeedback(productName) {
        // Just open the cart - the item appearing is feedback enough
        this.open();

        // Brief highlight animation on the cart icon
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.classList.add('cart-bounce');
            setTimeout(() => cartToggle.classList.remove('cart-bounce'), 500);
        }
    },

    // Render cart sidebar content
    render() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartEmpty = document.getElementById('cartEmpty');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            cartItems.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (cartTotal) cartTotal.textContent = '$0.00';
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = false;

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <div class="cart-item-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-category">${item.category}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn qty-minus" data-id="${item.id}" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        }

        // Use event delegation instead of rebinding
        this.bindCartItemEvents();
    },

    // Bind events for cart items using event delegation
    bindCartItemEvents() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        // Remove old listener if exists, then add new one
        cartItems.removeEventListener('click', this.handleCartItemClick);
        this.handleCartItemClick = (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const id = target.dataset.id;
            if (!id) return;

            e.preventDefault();
            e.stopPropagation();

            if (target.classList.contains('qty-minus')) {
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity - 1);
            } else if (target.classList.contains('qty-plus')) {
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity + 1);
            } else if (target.classList.contains('cart-item-remove')) {
                this.removeItem(id);
            }
        };
        cartItems.addEventListener('click', this.handleCartItemClick);
    },

    // Bind global events (called once on init)
    bindEvents() {
        // Cart toggle button
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Close button
        const closeBtn = document.getElementById('cartClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Overlay click to close
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.checkout();
            });
        }

        // Bind Add to Cart buttons using event delegation on document
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (!btn) return;

            // Skip if inside the checkout modal (handled separately)
            if (btn.closest('.checkout-modal')) return;

            e.preventDefault();
            e.stopPropagation();

            const product = this.getProductFromCard(btn);
            if (product) {
                this.addItem(product);
            }
        });
    },

    // Get product data from card (supports .product-card-item, .product-card, and .featured-card)
    getProductFromCard(button) {
        // Try featured card first (homepage carousel)
        const featuredCard = button.closest('.featured-card');
        if (featuredCard) {
            const name = featuredCard.querySelector('.featured-name')?.textContent || 'Product';
            const category = featuredCard.querySelector('.featured-category')?.textContent || 'Botanical';
            const id = featuredCard.dataset.productId || name.toLowerCase().replace(/\s+/g, '-');
            const price = parseFloat(featuredCard.dataset.price) || 29.99;

            return { id, name, category, price };
        }

        // Try product-card-item (product detail pages)
        const cardItem = button.closest('.product-card-item');
        if (cardItem) {
            const name = cardItem.querySelector('h3')?.textContent || 'Product';
            const category = cardItem.dataset.category || 'Botanical';
            const id = cardItem.dataset.productId || name.toLowerCase().replace(/\s+/g, '-');
            const price = parseFloat(cardItem.dataset.price) || 0;

            return { id, name, category, price };
        }

        // Fall back to product card (homepage grid)
        const card = button.closest('.product-card');
        if (!card) return null;

        const title = card.querySelector('.product-title')?.textContent || 'Product';
        const category = card.querySelector('.product-category')?.textContent || 'Botanical';
        const id = card.dataset.productId || title.toLowerCase().replace(/\s+/g, '-');
        const price = parseFloat(card.dataset.price) || 29.99;

        return { id, name: title, category, price };
    },

    // Checkout process - Real Stripe Integration
    async checkout() {
        if (this.items.length === 0 || this.isProcessing) return;
        this.isProcessing = true;

        const checkoutBtn = document.getElementById('checkoutBtn');
        const originalText = checkoutBtn.innerHTML;

        checkoutBtn.innerHTML = '<span>Processing...</span>';
        checkoutBtn.disabled = true;

        try {
            // Check if Stripe is configured
            if (!window.StripeConfig) {
                throw new Error('Stripe not configured. Please include stripe-config.js');
            }

            // Create checkout session
            const { sessionId, url } = await window.StripeConfig.createCheckoutSession(
                this.items,
                null // Can add customer email here if you collect it
            );

            // Redirect to Stripe Checkout
            if (url) {
                // Direct redirect (Stripe Checkout hosted page)
                window.location.href = url;
            } else if (sessionId) {
                // Use Stripe.js redirect
                await window.StripeConfig.redirectToCheckout(sessionId);
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);

            // Show user-friendly error message
            const errorMsg = error.message.includes('fetch')
                ? 'Unable to connect to payment processor. Please check your internet connection and try again.'
                : error.message || 'There was an error processing your checkout. Please try again.';

            alert(errorMsg);

            // Reset button
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
            this.isProcessing = false;
        }
    },

    // Show checkout modal (demo)
    showCheckoutModal() {
        if (document.querySelector('.checkout-modal')) return;

        this.close(); // Close cart sidebar first

        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-modal-overlay"></div>
            <div class="checkout-modal-content">
                <button class="checkout-modal-close" aria-label="Close" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="checkout-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <h2>Secure Checkout</h2>
                </div>
                <div class="checkout-summary">
                    <h3>Order Summary</h3>
                    <div class="checkout-items">
                        ${this.items.map(item => `
                            <div class="checkout-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="checkout-total">
                        <span>Total</span>
                        <span>$${this.getTotal().toFixed(2)}</span>
                    </div>
                </div>
                <div class="checkout-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <p>Demo checkout. Production will redirect to Stripe.</p>
                </div>
                <div class="checkout-actions">
                    <button class="btn btn-secondary" id="continueShopping" type="button">Continue Shopping</button>
                    <button class="btn btn-primary" id="simulatePayment" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Complete Order</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => modal.classList.add('open'));

        const closeModal = () => {
            modal.classList.remove('open');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        modal.querySelector('.checkout-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.checkout-modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('#continueShopping').addEventListener('click', closeModal);

        modal.querySelector('#simulatePayment').addEventListener('click', async () => {
            const btn = modal.querySelector('#simulatePayment');
            btn.innerHTML = '<span>Processing...</span>';
            btn.disabled = true;

            await new Promise(resolve => setTimeout(resolve, 1500));

            modal.querySelector('.checkout-modal-content').innerHTML = `
                <div class="checkout-success">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h2>Order Confirmed!</h2>
                    <p>Thank you for your order. This is a demo.</p>
                    <p class="order-number">Order #DEMO-${Date.now()}</p>
                    <button class="btn btn-primary" id="closeSuccess" type="button">
                        <span>Return to Shop</span>
                    </button>
                </div>
            `;

            this.clear();
            modal.querySelector('#closeSuccess').addEventListener('click', closeModal);
        });
    }
};

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cart;
}
