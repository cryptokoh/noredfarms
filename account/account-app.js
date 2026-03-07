/**
 * Account Dashboard - Nored Farms
 * Tabs: Orders, Favorites, Cart
 * Depends on: supabase-config.js, auth.js, cart.js
 */

const AccountApp = {
    currentTab: 'orders',

    async init() {
        // Auth guard
        const session = await requireAuth();
        if (!session) return;

        const user = session.user;
        const displayName = user.user_metadata?.display_name || user.email.split('@')[0];
        document.getElementById('accountGreeting').textContent = displayName;

        // Tab switching
        document.querySelectorAll('.account-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Sign out
        document.getElementById('signOutBtn').addEventListener('click', async () => {
            await logOut();
        });

        // Load data
        this.loadOrders();
        this.loadFavorites();
        this.loadCart();
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.account-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('active', p.id === 'panel-' + tabName);
        });
    },

    async loadOrders() {
        const container = document.getElementById('ordersContent');
        const sb = getSupabase();

        const { data: orders, error } = await sb
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <h3>No orders yet</h3>
                    <p>Your purchase history will appear here after your first order.</p>
                    <a href="/index.html#products">Browse Products</a>
                </div>`;
            return;
        }

        // Load order items for all orders
        const orderIds = orders.map(o => o.id);
        const { data: items } = await sb
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        const itemsByOrder = {};
        if (items) {
            items.forEach(item => {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            });
        }

        container.innerHTML = orders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const total = (order.total_cents / 100).toFixed(2);
            const orderItems = itemsByOrder[order.id] || [];
            const statusClass = order.status || 'completed';

            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-date">${date}</div>
                            <span class="order-status ${statusClass}">${statusClass}</span>
                        </div>
                        <div class="order-total">$${total}</div>
                    </div>
                    ${orderItems.length > 0 ? `
                        <button class="order-toggle" onclick="this.nextElementSibling.classList.toggle('open'); this.textContent = this.nextElementSibling.classList.contains('open') ? 'Hide items' : 'Show items'">Show items</button>
                        <div class="order-items-detail">
                            <ul class="order-items-list">
                                ${orderItems.map(item => `
                                    <li>
                                        <span>${item.product_name} x ${item.quantity}</span>
                                        <span>$${(item.unit_price_cents / 100 * item.quantity).toFixed(2)}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : '<div class="order-date">Order details unavailable</div>'}
                </div>`;
        }).join('');
    },

    async loadFavorites() {
        const container = document.getElementById('favoritesContent');
        const sb = getSupabase();

        const { data: favs, error } = await sb
            .from('favorites')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !favs || favs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <h3>No favorites yet</h3>
                    <p>Heart any product or article to save it here.</p>
                    <a href="/index.html#products">Browse Products</a>
                </div>`;
            return;
        }

        // Group by item_type
        const grouped = {};
        favs.forEach(f => {
            if (!grouped[f.item_type]) grouped[f.item_type] = [];
            grouped[f.item_type].push(f);
        });

        container.innerHTML = Object.entries(grouped).map(([type, items]) => `
            <div class="favorites-group">
                <h3>${type}s</h3>
                <div class="favorites-grid">
                    ${items.map(fav => `
                        <div class="favorite-card" data-fav-id="${fav.id}">
                            <div class="favorite-card-title">
                                <a href="${fav.item_url}">${fav.item_title}</a>
                            </div>
                            ${fav.item_meta?.price ? `<div class="favorite-card-meta">$${fav.item_meta.price}</div>` : ''}
                            ${fav.item_meta?.category ? `<div class="favorite-card-meta">${fav.item_meta.category}</div>` : ''}
                            <button class="favorite-remove" aria-label="Remove favorite" onclick="AccountApp.removeFavorite('${fav.id}', this)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    async removeFavorite(favId, btn) {
        const sb = getSupabase();
        await sb.from('favorites').delete().eq('id', favId);
        const card = btn.closest('.favorite-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();
                // Check if group is now empty
                document.querySelectorAll('.favorites-group').forEach(group => {
                    if (group.querySelectorAll('.favorite-card').length === 0) {
                        group.remove();
                    }
                });
                // If no groups left, show empty
                if (document.querySelectorAll('.favorites-group').length === 0) {
                    this.loadFavorites();
                }
            }, 200);
        }
    },

    loadCart() {
        const container = document.getElementById('cartContent');
        const cartItems = typeof Cart !== 'undefined' ? Cart.items : [];

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <h3>Your cart is empty</h3>
                    <p>Add items to your cart and they'll appear here.</p>
                    <a href="/index.html#products">Browse Products</a>
                </div>`;
            return;
        }

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        container.innerHTML = `
            <ul class="cart-tab-items">
                ${cartItems.map(item => `
                    <li class="cart-tab-item">
                        <div>
                            <div class="cart-tab-item-name">${item.name}</div>
                            <div class="cart-tab-item-info">${item.category} &middot; Qty: ${item.quantity}</div>
                        </div>
                        <div class="cart-tab-item-name">$${(item.price * item.quantity).toFixed(2)}</div>
                    </li>
                `).join('')}
            </ul>
            <div class="cart-tab-total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="cart-tab-checkout" onclick="window.location.href='/index.html#products'">
                Continue Shopping
            </button>`;
    }
};

document.addEventListener('DOMContentLoaded', () => AccountApp.init());
