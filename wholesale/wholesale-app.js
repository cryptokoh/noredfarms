/**
 * Wholesale Dashboard - Nored Farms
 * Main application logic for the wholesale portal dashboard.
 * Depends on: supabase-config.js, auth.js, wholesale-cart.js
 */

/* ── Product Catalog (matches main site product list) ── */
const PRODUCTS = [
    { id: '5000mg-blue-lotus-tincture', name: '5000mg Blue Lotus Tincture', category: 'Tinctures', retail_price: 60 },
    { id: '3000mg-kanna-tincture', name: '3000mg Kanna Tincture', category: 'Tinctures', retail_price: 80 },
    { id: '500mg-kanna-gummies', name: '500mg Kanna Gummies', category: 'Gummies', retail_price: 40 },
    { id: '2500mg-blue-lotus-gummies', name: '2500mg Blue Lotus Gummies', category: 'Gummies', retail_price: 40 },
    { id: '1g-blue-lotus-resin-extract', name: '1g Blue Lotus Resin Extract', category: 'Extracts', retail_price: 30 },
    { id: '1g-high-potency-kanna-extract', name: '1g High Potency Kanna Extract', category: 'Extracts', retail_price: 40 },
    { id: 'high-potency-kava-kava-co2-extract', name: 'High Potency Kava Kava CO2 Extract', category: 'Extracts', retail_price: 30 },
    { id: 'dried-blue-lotus-1oz', name: 'Dried Blue Lotus (1 oz)', category: 'Dried Botanicals', retail_price: 30 },
    { id: 'dried-kanna-1oz', name: 'Dried Kanna (1 oz)', category: 'Dried Botanicals', retail_price: 30 },
    { id: 'purple-dragon-fruit', name: 'Purple Dragon Fruit, rooted 12-16"', category: 'Live Plants', retail_price: 20 },
    { id: 'bob-gordon-elderberry', name: 'Bob Gordon Elderberry, 12-16" tall', category: 'Live Plants', retail_price: 20 },
    { id: 'central-texas-prickly-pear', name: 'Central Texas Prickly Pear, 2 pads', category: 'Live Plants', retail_price: 20 },
    { id: 'davis-mountain-yucca', name: 'Davis Mountain Yucca (soapweed), 6" tall', category: 'Live Plants', retail_price: 25 },
    { id: 'heirloom-sugarcane-seeds', name: 'Heirloom Sugarcane Seeds', category: 'Seeds', retail_price: 20 },
    { id: 'hibiscus-seeds', name: 'Hibiscus Seeds', category: 'Seeds', retail_price: 20 },
    { id: 'nicotiana-rustica-seeds', name: 'Nicotiana Rustica (Hape) Seeds', category: 'Seeds', retail_price: 40 }
];

/* ── Discount Tiers ── */
const DISCOUNT_TIERS = {
    standard: 0.30,
    preferred: 0.40,
    premium: 0.50,
    custom: 0 // uses per-product pricing
};

/* ── Dashboard App ── */
const WSDashboard = {
    account: null,
    profile: null,
    customPricing: {},
    session: null,

    async init() {
        initSiteAuth();

        const auth = await requireWholesaleAuth();
        if (!auth) return;

        this.session = auth.session;
        this.profile = auth.profile;
        this.account = auth.account;

        // Greeting
        const greeting = document.getElementById('wsGreeting');
        if (greeting) {
            greeting.textContent = `Welcome, ${this.account.company_name}`;
        }

        // Load custom pricing
        await this.loadCustomPricing();

        // Init tabs
        this.initTabs();

        // Load initial data
        this.loadOverview();
        this.loadCatalog();

        // Init wholesale cart
        WholesaleCart.init(this.account, this.getDiscountRate.bind(this), this.getProductPrice.bind(this));
    },

    initTabs() {
        document.querySelectorAll('.ws-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.ws-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ws-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`.ws-panel[data-panel="${tabName}"]`).classList.add('active');

                // Lazy-load tab data
                if (tabName === 'orders') this.loadOrders();
                if (tabName === 'invoices') this.loadInvoices();
                if (tabName === 'account') this.loadAccountInfo();
            });
        });
    },

    async loadCustomPricing() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_pricing')
            .select('product_id, wholesale_price_cents, min_quantity')
            .eq('account_id', this.account.id);

        if (data) {
            data.forEach(p => {
                this.customPricing[p.product_id] = {
                    price_cents: p.wholesale_price_cents,
                    min_qty: p.min_quantity
                };
            });
        }
    },

    getDiscountRate() {
        return DISCOUNT_TIERS[this.account.discount_tier] || 0;
    },

    /**
     * Get wholesale price for a product (in dollars).
     * Priority: custom pricing > tier discount > retail price.
     */
    getProductPrice(product) {
        const custom = this.customPricing[product.id];
        if (custom) {
            return { price: custom.price_cents / 100, min_qty: custom.min_qty, isCustom: true };
        }

        const discount = this.getDiscountRate();
        const wholesalePrice = product.retail_price * (1 - discount);
        return { price: Math.round(wholesalePrice * 100) / 100, min_qty: 1, isCustom: false };
    },

    /* ── Overview Tab ── */
    async loadOverview() {
        const sb = getSupabase();

        // Stats
        const [ordersRes, invoicesRes] = await Promise.all([
            sb.from('wholesale_orders')
                .select('id, total_cents, status, created_at, order_number')
                .eq('account_id', this.account.id)
                .order('created_at', { ascending: false }),
            sb.from('wholesale_invoices')
                .select('id, payment_status')
                .eq('account_id', this.account.id)
                .in('payment_status', ['unpaid', 'overdue'])
        ]);

        const orders = ordersRes.data || [];
        const openInvoices = invoicesRes.data || [];

        const tierEl = document.getElementById('statTier');
        if (tierEl) tierEl.textContent = this.account.discount_tier.charAt(0).toUpperCase() + this.account.discount_tier.slice(1);

        const ordersEl = document.getElementById('statOrders');
        if (ordersEl) ordersEl.textContent = orders.length;

        const spentEl = document.getElementById('statSpent');
        const totalSpent = orders.reduce((sum, o) => sum + (o.total_cents || 0), 0);
        if (spentEl) spentEl.textContent = '$' + (totalSpent / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });

        const invEl = document.getElementById('statInvoices');
        if (invEl) invEl.textContent = openInvoices.length;

        // Recent orders (last 5)
        const recentBody = document.getElementById('recentOrdersBody');
        if (recentBody) {
            const recent = orders.slice(0, 5);
            if (recent.length === 0) {
                recentBody.innerHTML = '<tr><td colspan="5" class="ws-empty">No orders yet</td></tr>';
            } else {
                recentBody.innerHTML = recent.map(o => `
                    <tr>
                        <td>${o.order_number}</td>
                        <td>${new Date(o.created_at).toLocaleDateString()}</td>
                        <td>—</td>
                        <td>$${(o.total_cents / 100).toFixed(2)}</td>
                        <td><span class="ws-badge ws-badge-${o.status}">${o.status}</span></td>
                    </tr>
                `).join('');
            }
        }
    },

    /* ── Catalog Tab ── */
    loadCatalog() {
        const grid = document.getElementById('catalogGrid');
        if (!grid) return;

        grid.innerHTML = PRODUCTS.map(product => {
            const { price, min_qty, isCustom } = this.getProductPrice(product);
            const savings = Math.round((1 - price / product.retail_price) * 100);

            return `
                <div class="ws-product-card" data-product-id="${product.id}">
                    <div class="ws-product-name">${product.name}</div>
                    <div class="ws-product-category">${product.category}</div>
                    <div class="ws-price-row">
                        <span class="ws-price-wholesale">$${price.toFixed(2)}</span>
                        <span class="ws-price-retail">$${product.retail_price.toFixed(2)}</span>
                        <span class="ws-price-savings">${savings}% off</span>
                    </div>
                    <div class="ws-product-controls">
                        <input type="number" class="ws-qty-input" value="${min_qty}" min="${min_qty}" step="1" data-min="${min_qty}">
                        <button class="ws-add-btn" onclick="WholesaleCart.addFromCatalog('${product.id}', this)">Add to Cart</button>
                    </div>
                    ${min_qty > 1 ? `<div class="ws-min-qty-note">Min quantity: ${min_qty}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    /* ── Orders Tab ── */
    async loadOrders() {
        const sb = getSupabase();
        const { data: orders } = await sb
            .from('wholesale_orders')
            .select('*')
            .eq('account_id', this.account.id)
            .order('created_at', { ascending: false });

        const body = document.getElementById('allOrdersBody');
        if (!body) return;

        if (!orders || orders.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="ws-empty">No orders yet</td></tr>';
            return;
        }

        body.innerHTML = orders.map(o => `
            <tr style="cursor:pointer" onclick="WSDashboard.showOrderDetail('${o.id}')">
                <td><span style="color:#50e8c0">${o.order_number}</span></td>
                <td>${o.po_number || '—'}</td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td>$${(o.total_cents / 100).toFixed(2)}</td>
                <td><span class="ws-badge ws-badge-${o.status}">${o.status}</span></td>
                <td>${o.tracking_number
                    ? `<a href="#" onclick="event.stopPropagation()" style="color:#50e8c0">${o.tracking_number}</a>`
                    : '—'}</td>
            </tr>
        `).join('');
    },

    async showOrderDetail(orderId) {
        const sb = getSupabase();
        const [orderRes, itemsRes] = await Promise.all([
            sb.from('wholesale_orders').select('*').eq('id', orderId).single(),
            sb.from('wholesale_order_items').select('*').eq('order_id', orderId).order('product_name')
        ]);

        const order = orderRes.data;
        const items = itemsRes.data || [];
        if (!order) return;

        const invoiceRes = await sb.from('wholesale_invoices')
            .select('invoice_number, payment_status, due_date')
            .eq('order_id', orderId)
            .maybeSingle();
        const invoice = invoiceRes.data;

        const modal = document.getElementById('wsModal');
        const content = document.getElementById('wsModalContent');

        const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIdx = statusSteps.indexOf(order.status);
        const timeline = statusSteps.map((s, i) => {
            const state = i <= currentIdx ? 'completed' : (order.status === 'cancelled' ? 'cancelled' : '');
            return `<div class="ws-timeline-step ${state}"><div class="ws-timeline-dot"></div><span>${s}</span></div>`;
        }).join('');

        content.innerHTML = `
            <div class="ws-modal-header">
                <h3>${order.order_number}</h3>
                <button class="ws-modal-close" onclick="WSDashboard.closeModal()">&times;</button>
            </div>
            <div class="ws-modal-body">
                <div class="ws-timeline">${timeline}</div>
                <div class="ws-detail-grid">
                    <div class="ws-detail-item"><span class="ws-detail-label">Date</span><span>${new Date(order.created_at).toLocaleDateString()}</span></div>
                    <div class="ws-detail-item"><span class="ws-detail-label">PO Number</span><span>${order.po_number || '—'}</span></div>
                    <div class="ws-detail-item"><span class="ws-detail-label">Payment</span><span>${order.payment_method === 'prepaid' ? 'Prepaid (Stripe)' : 'Net Terms'}</span></div>
                    ${order.tracking_number ? `<div class="ws-detail-item"><span class="ws-detail-label">Tracking</span><span style="color:#50e8c0">${order.tracking_carrier ? order.tracking_carrier.toUpperCase() + ': ' : ''}${order.tracking_number}</span></div>` : ''}
                    ${invoice ? `<div class="ws-detail-item"><span class="ws-detail-label">Invoice</span><span>${invoice.invoice_number} <span class="ws-badge ws-badge-${invoice.payment_status}">${invoice.payment_status}</span></span></div>` : ''}
                </div>
                <h4 style="font-size:0.8125rem;font-weight:400;color:#8e9c98;text-transform:uppercase;letter-spacing:0.05em;margin:20px 0 8px">Line Items</h4>
                <table class="ws-table" style="font-size:0.8125rem">
                    <thead><tr><th>Product</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td style="text-align:right">${item.quantity}</td>
                                <td style="text-align:right">$${(item.unit_price_cents / 100).toFixed(2)}</td>
                                <td style="text-align:right">$${(item.total_cents / 100).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="border-top:1px solid rgba(80,232,192,0.08)">
                            <td colspan="3" style="text-align:right;font-weight:400;color:#8e9c98">Total</td>
                            <td style="text-align:right;color:#50e8c0;font-weight:500">$${(order.total_cents / 100).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                ${invoice ? `<button class="ws-btn ws-btn-secondary" style="margin-top:16px" onclick="WSDashboard.printInvoice('${orderId}')">Print Invoice</button>` : ''}
            </div>
        `;

        modal.style.display = 'flex';
        modal.onclick = (e) => { if (e.target === modal) this.closeModal(); };
    },

    closeModal() {
        document.getElementById('wsModal').style.display = 'none';
    },

    async printInvoice(orderId) {
        const sb = getSupabase();
        const [orderRes, itemsRes, invoiceRes] = await Promise.all([
            sb.from('wholesale_orders').select('*').eq('id', orderId).single(),
            sb.from('wholesale_order_items').select('*').eq('order_id', orderId),
            sb.from('wholesale_invoices').select('*').eq('order_id', orderId).maybeSingle()
        ]);
        const order = orderRes.data;
        const items = itemsRes.data || [];
        const invoice = invoiceRes.data;
        if (!order || !invoice) return;

        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoice_number}</title>
        <style>
            body{font-family:Inter,system-ui,sans-serif;margin:40px;color:#222;font-size:14px}
            h1{font-size:24px;margin:0;font-weight:600}
            .inv-header{display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #222;padding-bottom:16px}
            .inv-meta{text-align:right;font-size:13px;line-height:1.6}
            .inv-meta strong{display:block;font-size:18px}
            table{width:100%;border-collapse:collapse;margin:24px 0}
            th{text-align:left;padding:8px 12px;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#666}
            td{padding:8px 12px;border-bottom:1px solid #eee}
            .text-right{text-align:right}
            .total-row td{border-top:2px solid #222;font-weight:600;font-size:16px}
            .footer{margin-top:40px;font-size:12px;color:#888;border-top:1px solid #ddd;padding-top:16px}
            @media print{body{margin:20px}}
        </style></head><body>
        <div class="inv-header">
            <div><h1>Nored Farms</h1><p>Premium Botanicals<br>Texas Hill Country</p></div>
            <div class="inv-meta">
                <strong>${invoice.invoice_number}</strong>
                Order: ${order.order_number}<br>
                Date: ${new Date(invoice.created_at).toLocaleDateString()}<br>
                Due: ${new Date(invoice.due_date).toLocaleDateString()}<br>
                Status: ${invoice.payment_status.toUpperCase()}
            </div>
        </div>
        <div><strong>Bill To:</strong><br>${this.account.company_name}<br>${this.account.contact_name}<br>${this.account.contact_email}</div>
        <table>
            <thead><tr><th>Product</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
            <tbody>
                ${items.map(i => `<tr><td>${i.product_name}</td><td class="text-right">${i.quantity}</td><td class="text-right">$${(i.unit_price_cents/100).toFixed(2)}</td><td class="text-right">$${(i.total_cents/100).toFixed(2)}</td></tr>`).join('')}
            </tbody>
            <tfoot><tr class="total-row"><td colspan="3" class="text-right">Total Due</td><td class="text-right">$${(invoice.total_cents/100).toFixed(2)}</td></tr></tfoot>
        </table>
        ${order.po_number ? `<p><strong>PO Number:</strong> ${order.po_number}</p>` : ''}
        <p><strong>Payment Terms:</strong> ${this.account.payment_terms}</p>
        <div class="footer"><p>Nored Farms | noredfarms.netlify.app | Thank you for your business</p></div>
        <script>window.onload=function(){window.print()}<\/script>
        </body></html>`);
        win.document.close();
    },

    /* ── Invoices Tab ── */
    async loadInvoices() {
        const sb = getSupabase();
        const { data: invoices } = await sb
            .from('wholesale_invoices')
            .select('*, wholesale_orders(order_number, id)')
            .eq('account_id', this.account.id)
            .order('created_at', { ascending: false });

        const body = document.getElementById('invoicesBody');
        if (!body) return;

        if (!invoices || invoices.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="ws-empty">No invoices yet</td></tr>';
            return;
        }

        body.innerHTML = invoices.map(inv => `
            <tr>
                <td>${inv.invoice_number}</td>
                <td><span style="color:#50e8c0;cursor:pointer" onclick="WSDashboard.showOrderDetail('${inv.wholesale_orders?.id}')">${inv.wholesale_orders?.order_number || '—'}</span></td>
                <td>$${(inv.total_cents / 100).toFixed(2)}</td>
                <td>${new Date(inv.due_date).toLocaleDateString()}</td>
                <td><span class="ws-badge ws-badge-${inv.payment_status}">${inv.payment_status}</span></td>
                <td><button class="ws-btn ws-btn-secondary" style="padding:4px 12px;font-size:0.75rem" onclick="WSDashboard.printInvoice('${inv.order_id}')">Print</button></td>
            </tr>
        `).join('');
    },

    /* ── Account Tab ── */
    loadAccountInfo() {
        const container = document.getElementById('accountInfo');
        if (!container) return;

        const a = this.account;
        const discount = DISCOUNT_TIERS[a.discount_tier];
        const discountLabel = discount ? `${Math.round(discount * 100)}%` : 'Custom';

        container.innerHTML = `
            <div class="ws-account-card">
                <h3>Company Details</h3>
                <div class="ws-info-grid">
                    <span class="ws-info-label">Company</span>
                    <span class="ws-info-value">${a.company_name}</span>
                    <span class="ws-info-label">Type</span>
                    <span class="ws-info-value">${a.business_type || '—'}</span>
                    <span class="ws-info-label">Tax ID</span>
                    <span class="ws-info-value">${a.tax_id || '—'}</span>
                    <span class="ws-info-label">Website</span>
                    <span class="ws-info-value">${a.website_url || '—'}</span>
                </div>
            </div>
            <div class="ws-account-card">
                <h3>Contact</h3>
                <div class="ws-info-grid">
                    <span class="ws-info-label">Name</span>
                    <span class="ws-info-value">${a.contact_name}</span>
                    <span class="ws-info-label">Email</span>
                    <span class="ws-info-value">${a.contact_email}</span>
                    <span class="ws-info-label">Phone</span>
                    <span class="ws-info-value">${a.contact_phone || '—'}</span>
                </div>
            </div>
            <div class="ws-account-card">
                <h3>Account Terms</h3>
                <div class="ws-info-grid">
                    <span class="ws-info-label">Discount Tier</span>
                    <span class="ws-info-value" style="color:#50e8c0">${a.discount_tier} (${discountLabel})</span>
                    <span class="ws-info-label">Payment Terms</span>
                    <span class="ws-info-value">${a.payment_terms}</span>
                    <span class="ws-info-label">Min Order</span>
                    <span class="ws-info-value">$${(a.min_order_cents / 100).toFixed(0)}</span>
                    <span class="ws-info-label">Status</span>
                    <span class="ws-info-value"><span class="ws-badge ws-badge-${a.application_status}">${a.application_status}</span></span>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => WSDashboard.init());
