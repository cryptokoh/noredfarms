/**
 * Nored Farms - Shopping Cart System
 * Frontend cart management with Stripe checkout preparation
 */

// Cart State
const Cart = {
    items: [],
    isOpen: false,
    isProcessing: false, // Prevent double-clicks
    isCheckoutView: false, // Track if checkout form is showing
    _syncTimer: null,

    // Initialize cart from localStorage, then merge server cart if logged in
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

        // Attempt server cart merge after auth is ready
        if (typeof getSupabase === 'function') {
            setTimeout(() => this._mergeServerCart(), 500);
            // Listen for auth changes
            try {
                const sb = getSupabase();
                sb.auth.onAuthStateChange((event) => {
                    if (event === 'SIGNED_IN') {
                        this._mergeServerCart();
                    }
                });
            } catch (e) { /* supabase not loaded yet */ }
        }
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

    // Save to localStorage + debounce server sync
    save() {
        localStorage.setItem('noredfarms-cart', JSON.stringify(this.items));
        this._debounceSyncToServer();
    },

    // Debounced server sync (500ms)
    _debounceSyncToServer() {
        if (this._syncTimer) clearTimeout(this._syncTimer);
        this._syncTimer = setTimeout(() => this._syncToServer(), 500);
    },

    // Persist cart to user_carts table
    async _syncToServer() {
        if (typeof getUser !== 'function') return;
        try {
            const user = await getUser();
            if (!user) return;
            const sb = getSupabase();
            await sb.from('user_carts').upsert({
                user_id: user.id,
                cart_data: this.items,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        } catch (e) { /* silently fail */ }
    },

    // Merge server cart with local cart on login
    async _mergeServerCart() {
        if (typeof getUser !== 'function') return;
        try {
            const user = await getUser();
            if (!user) return;
            const sb = getSupabase();
            const { data } = await sb
                .from('user_carts')
                .select('cart_data')
                .eq('user_id', user.id)
                .single();

            if (data && Array.isArray(data.cart_data) && data.cart_data.length > 0) {
                const serverItems = data.cart_data;
                // Merge: union of items, take higher quantity for duplicates
                serverItems.forEach(serverItem => {
                    const local = this.items.find(i => i.id === serverItem.id);
                    if (local) {
                        local.quantity = Math.max(local.quantity, serverItem.quantity);
                    } else {
                        this.items.push(serverItem);
                    }
                });
                this.save();
                this.render();
                this.updateCartCount();
            } else if (this.items.length > 0) {
                // No server cart but local has items — push local to server
                this._syncToServer();
            }
        } catch (e) { /* silently fail */ }
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
        this.isCheckoutView = false;
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
        document.body.style.overflow = '';
        // Restore cart view when closing
        this.render();
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
                if (this.isCheckoutView) {
                    this.showCartView();
                } else {
                    this.close();
                }
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCheckoutForm();
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

    // Show checkout form inside the cart sidebar
    showCheckoutForm() {
        if (this.items.length === 0) return;
        this.isCheckoutView = true;

        const cartBody = document.querySelector('.cart-sidebar .cart-body');
        const cartFooter = document.querySelector('.cart-sidebar .cart-footer');
        const cartHeader = document.querySelector('.cart-sidebar .cart-header h2');

        if (!cartBody) return;

        // Update header
        if (cartHeader) {
            cartHeader.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Checkout
            `;
        }

        // Calculate shipping display
        const subtotal = this.getTotal();
        const shippingText = subtotal >= 100 ? 'Free' : '$8.00';
        const total = subtotal >= 100 ? subtotal : subtotal + 8;

        // Build checkout form
        cartBody.innerHTML = `
            <form class="checkout-form" id="checkoutForm" novalidate>
                <div class="checkout-form-summary">
                    <h3 class="checkout-form-section-title">Order Summary</h3>
                    <div class="checkout-form-items">
                        ${this.items.map(item => `
                            <div class="checkout-form-item">
                                <span class="checkout-form-item-name">${item.name} <span class="checkout-form-item-qty">&times; ${item.quantity}</span></span>
                                <span class="checkout-form-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="checkout-form-totals">
                        <div class="checkout-form-row">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="checkout-form-row">
                            <span>Shipping</span>
                            <span>${shippingText}</span>
                        </div>
                        <div class="checkout-form-row checkout-form-row-total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <h3 class="checkout-form-section-title">Contact</h3>
                <div class="checkout-form-group">
                    <label class="checkout-label" for="checkout-email">Email</label>
                    <input
                        class="checkout-input"
                        type="email"
                        id="checkout-email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        autocomplete="email"
                    />
                    <span class="checkout-field-error" id="error-email"></span>
                </div>

                <h3 class="checkout-form-section-title">Shipping Address</h3>
                <div class="checkout-form-group">
                    <label class="checkout-label" for="checkout-name">Full Name</label>
                    <input
                        class="checkout-input"
                        type="text"
                        id="checkout-name"
                        name="name"
                        placeholder="Jane Doe"
                        required
                        autocomplete="name"
                    />
                    <span class="checkout-field-error" id="error-name"></span>
                </div>

                <div class="checkout-form-group">
                    <label class="checkout-label" for="checkout-address">Street Address</label>
                    <input
                        class="checkout-input"
                        type="text"
                        id="checkout-address"
                        name="address_line1"
                        placeholder="123 Main St"
                        required
                        autocomplete="address-line1"
                    />
                    <span class="checkout-field-error" id="error-address"></span>
                </div>

                <div class="checkout-form-row-inputs">
                    <div class="checkout-form-group checkout-form-group-flex">
                        <label class="checkout-label" for="checkout-city">City</label>
                        <input
                            class="checkout-input"
                            type="text"
                            id="checkout-city"
                            name="city"
                            placeholder="Austin"
                            required
                            autocomplete="address-level2"
                        />
                        <span class="checkout-field-error" id="error-city"></span>
                    </div>
                    <div class="checkout-form-group checkout-form-group-small">
                        <label class="checkout-label" for="checkout-state">State</label>
                        <input
                            class="checkout-input"
                            type="text"
                            id="checkout-state"
                            name="state"
                            placeholder="TX"
                            maxlength="2"
                            required
                            autocomplete="address-level1"
                        />
                        <span class="checkout-field-error" id="error-state"></span>
                    </div>
                    <div class="checkout-form-group checkout-form-group-small">
                        <label class="checkout-label" for="checkout-zip">ZIP</label>
                        <input
                            class="checkout-input"
                            type="text"
                            id="checkout-zip"
                            name="zip"
                            placeholder="78701"
                            maxlength="10"
                            required
                            autocomplete="postal-code"
                        />
                        <span class="checkout-field-error" id="error-zip"></span>
                    </div>
                </div>

                <div class="checkout-form-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Payment is handled securely by Stripe. We never see your card details.</span>
                </div>

                <div class="checkout-form-actions">
                    <button type="button" class="checkout-back-btn" id="checkoutBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Back
                    </button>
                    <button type="submit" class="checkout-submit-btn" id="checkoutSubmitBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Pay with Stripe</span>
                    </button>
                </div>
            </form>
        `;

        // Hide the cart footer
        if (cartFooter) {
            cartFooter.style.display = 'none';
        }

        // Bind form events
        this._bindCheckoutFormEvents();

        // Focus the email field
        const emailInput = document.getElementById('checkout-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    },

    // Restore the normal cart view from checkout form
    showCartView() {
        this.isCheckoutView = false;

        const cartFooter = document.querySelector('.cart-sidebar .cart-footer');
        const cartHeader = document.querySelector('.cart-sidebar .cart-header h2');

        // Restore header
        if (cartHeader) {
            cartHeader.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Your Cart
            `;
        }

        // Show footer again
        if (cartFooter) {
            cartFooter.style.display = '';
        }

        // Re-render cart items
        this.render();
    },

    // Bind checkout form submission and back button
    _bindCheckoutFormEvents() {
        const form = document.getElementById('checkoutForm');
        const backBtn = document.getElementById('checkoutBackBtn');

        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCartView();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._handleCheckoutSubmit();
            });
        }
    },

    // Validate a single field and show/clear its error
    _validateField(name, value) {
        const errorEl = document.getElementById(`error-${name}`);
        let message = '';

        switch (name) {
            case 'email':
                if (!value) {
                    message = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    message = 'Enter a valid email address';
                }
                break;
            case 'name':
                if (!value) {
                    message = 'Full name is required';
                } else if (value.length < 2) {
                    message = 'Enter your full name';
                }
                break;
            case 'address':
                if (!value) {
                    message = 'Street address is required';
                }
                break;
            case 'city':
                if (!value) {
                    message = 'City is required';
                }
                break;
            case 'state':
                if (!value) {
                    message = 'State is required';
                } else if (!/^[A-Za-z]{2}$/.test(value)) {
                    message = 'Use 2-letter code (e.g. TX)';
                }
                break;
            case 'zip':
                if (!value) {
                    message = 'ZIP code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    message = 'Enter a valid ZIP code';
                }
                break;
        }

        if (errorEl) {
            errorEl.textContent = message;
        }

        // Toggle error class on the input
        const inputMap = {
            email: 'checkout-email',
            name: 'checkout-name',
            address: 'checkout-address',
            city: 'checkout-city',
            state: 'checkout-state',
            zip: 'checkout-zip'
        };
        const input = document.getElementById(inputMap[name]);
        if (input) {
            if (message) {
                input.classList.add('checkout-input-error');
            } else {
                input.classList.remove('checkout-input-error');
            }
        }

        return !message;
    },

    // Handle checkout form submission
    async _handleCheckoutSubmit() {
        if (this.isProcessing) return;

        // Gather values
        const email = (document.getElementById('checkout-email')?.value || '').trim();
        const name = (document.getElementById('checkout-name')?.value || '').trim();
        const address = (document.getElementById('checkout-address')?.value || '').trim();
        const city = (document.getElementById('checkout-city')?.value || '').trim();
        const state = (document.getElementById('checkout-state')?.value || '').trim().toUpperCase();
        const zip = (document.getElementById('checkout-zip')?.value || '').trim();

        // Validate all fields
        const validations = [
            this._validateField('email', email),
            this._validateField('name', name),
            this._validateField('address', address),
            this._validateField('city', city),
            this._validateField('state', state),
            this._validateField('zip', zip)
        ];

        if (validations.some(v => !v)) {
            // Focus first invalid field
            const firstError = document.querySelector('.checkout-input-error');
            if (firstError) firstError.focus();
            return;
        }

        this.isProcessing = true;
        const submitBtn = document.getElementById('checkoutSubmitBtn');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
            submitBtn.innerHTML = '<span class="checkout-spinner"></span><span>Processing...</span>';
            submitBtn.disabled = true;
        }

        try {
            if (!window.StripeConfig) {
                throw new Error('Stripe not configured. Please include stripe-config.js');
            }

            // Get current user if logged in
            let userId = null;
            if (typeof getUser === 'function') {
                try {
                    const user = await getUser();
                    if (user) userId = user.id;
                } catch (e) { /* not logged in - guest checkout */ }
            }

            // Build shipping address object
            const shippingAddress = {
                name: name,
                address_line1: address,
                city: city,
                state: state,
                postal_code: zip,
                country: 'US'
            };

            // Call the checkout session endpoint with shipping info
            const response = await fetch(window.StripeConfig.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: this.items,
                    customerEmail: email,
                    userId: userId,
                    shippingAddress: shippingAddress
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const { sessionId, url } = await response.json();

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            } else if (sessionId) {
                await window.StripeConfig.redirectToCheckout(sessionId);
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);

            const errorMsg = error.message.includes('fetch')
                ? 'Unable to connect to payment processor. Please check your internet connection and try again.'
                : error.message || 'There was an error processing your checkout. Please try again.';

            // Show inline error instead of alert
            this._showCheckoutError(errorMsg);

            // Reset button
            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
            this.isProcessing = false;
        }
    },

    // Show an inline error message on the checkout form
    _showCheckoutError(message) {
        // Remove existing error banner
        const existing = document.querySelector('.checkout-form-error-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.className = 'checkout-form-error-banner';
        banner.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>${message}</span>
        `;

        const form = document.getElementById('checkoutForm');
        if (form) {
            // Insert before the actions row
            const actions = form.querySelector('.checkout-form-actions');
            if (actions) {
                form.insertBefore(banner, actions);
            } else {
                form.appendChild(banner);
            }
        }

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.classList.add('checkout-form-error-banner-fade');
                setTimeout(() => banner.remove(), 300);
            }
        }, 8000);
    },

    // Checkout process - Real Stripe Integration (kept as fallback)
    async checkout() {
        if (this.items.length === 0 || this.isProcessing) return;
        // Redirect to the inline checkout form
        this.showCheckoutForm();
    },

    // Show checkout modal (demo - legacy, kept for reference)
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
                                <span>${item.name} x ${item.quantity}</span>
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
