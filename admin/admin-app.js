/**
 * Admin Command Center - Nored Farms
 * Single-page admin dashboard with 5 tabs and real-time updates.
 * Depends on: supabase-config.js, auth.js
 */

/* ── Product list (shared with wholesale) ── */
const ADMIN_PRODUCTS = [
    { id: '5000mg-blue-lotus-tincture', name: '5000mg Blue Lotus Tincture', retail: 60 },
    { id: '3000mg-kanna-tincture', name: '3000mg Kanna Tincture', retail: 80 },
    { id: '500mg-kanna-gummies', name: '500mg Kanna Gummies', retail: 40 },
    { id: '2500mg-blue-lotus-gummies', name: '2500mg Blue Lotus Gummies', retail: 40 },
    { id: '1g-blue-lotus-resin-extract', name: '1g Blue Lotus Resin Extract', retail: 30 },
    { id: '1g-high-potency-kanna-extract', name: '1g High Potency Kanna Extract', retail: 40 },
    { id: 'high-potency-kava-kava-co2-extract', name: 'Kava Kava CO2 Extract', retail: 30 },
    { id: 'dried-blue-lotus-1oz', name: 'Dried Blue Lotus (1 oz)', retail: 30 },
    { id: 'dried-kanna-1oz', name: 'Dried Kanna (1 oz)', retail: 30 },
    { id: 'purple-dragon-fruit', name: 'Purple Dragon Fruit', retail: 20 },
    { id: 'bob-gordon-elderberry', name: 'Bob Gordon Elderberry', retail: 20 },
    { id: 'central-texas-prickly-pear', name: 'Central TX Prickly Pear', retail: 20 },
    { id: 'davis-mountain-yucca', name: 'Davis Mountain Yucca', retail: 25 },
    { id: 'heirloom-sugarcane-seeds', name: 'Heirloom Sugarcane Seeds', retail: 20 },
    { id: 'hibiscus-seeds', name: 'Hibiscus Seeds', retail: 20 },
    { id: 'nicotiana-rustica-seeds', name: 'Nicotiana Rustica Seeds', retail: 40 }
];

const AdminApp = {
    accounts: [],
    realtimeChannel: null,

    async init() {
        initSiteAuth();

        const auth = await requireAdminAuth();
        if (!auth) return;

        this.initTabs();
        await this.loadStats();
        this.loadApplications();
        this.setupRealtime();
    },

    /* ── Tabs ── */
    initTabs() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const name = tab.dataset.tab;
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`.admin-panel[data-panel="${name}"]`).classList.add('active');

                if (name === 'customers') this.loadCustomers();
                if (name === 'pricing') this.loadPricingCustomers();
                if (name === 'orders') this.loadOrders();
                if (name === 'invoices') this.loadInvoices();
            });
        });
    },

    /* ── Stats ── */
    async loadStats() {
        const sb = getSupabase();
        const [pendingRes, activeRes, openOrdersRes, overdueRes] = await Promise.all([
            sb.from('wholesale_accounts').select('id', { count: 'exact', head: true }).eq('application_status', 'pending'),
            sb.from('wholesale_accounts').select('id', { count: 'exact', head: true }).eq('application_status', 'approved'),
            sb.from('wholesale_orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'processing']),
            sb.from('wholesale_invoices').select('id', { count: 'exact', head: true }).eq('payment_status', 'overdue')
        ]);

        document.getElementById('statPending').textContent = pendingRes.count || 0;
        document.getElementById('statActive').textContent = activeRes.count || 0;
        document.getElementById('statOpenOrders').textContent = openOrdersRes.count || 0;
        document.getElementById('statOverdue').textContent = overdueRes.count || 0;
        document.getElementById('appCount').textContent = pendingRes.count || 0;
    },

    /* ── Applications Tab ── */
    async loadApplications() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_accounts')
            .select('*')
            .order('created_at', { ascending: false });

        const body = document.getElementById('applicationsBody');
        if (!data || data.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="admin-empty">No applications</td></tr>';
            return;
        }

        body.innerHTML = data.map(a => `
            <tr>
                <td><strong>${a.company_name}</strong></td>
                <td>${a.contact_name}<br><span style="font-size:0.75rem;color:#8e9c98">${a.contact_email}</span></td>
                <td>${a.business_type || '—'}</td>
                <td>${new Date(a.created_at).toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-${a.application_status}">${a.application_status}</span></td>
                <td>
                    ${a.application_status === 'pending' ? `
                        <button class="admin-action-btn approve" onclick="AdminApp.showApproveModal('${a.id}', '${a.user_id}', '${a.company_name}')">Approve</button>
                        <button class="admin-action-btn reject" onclick="AdminApp.rejectApplication('${a.id}')">Reject</button>
                    ` : ''}
                    ${a.resale_certificate_url ? `<button class="admin-action-btn edit" onclick="AdminApp.viewDocument('${a.resale_certificate_url}')">View Doc</button>` : ''}
                </td>
            </tr>
        `).join('');
    },

    showApproveModal(accountId, userId, companyName) {
        const modal = document.getElementById('adminModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <h3>Approve: ${companyName}</h3>
            <div class="admin-modal-field">
                <label>Discount Tier</label>
                <select id="approvalTier">
                    <option value="standard">Standard (30%)</option>
                    <option value="preferred">Preferred (40%)</option>
                    <option value="premium">Premium (50%)</option>
                    <option value="custom">Custom (per-product)</option>
                </select>
            </div>
            <div class="admin-modal-field">
                <label>Payment Terms</label>
                <select id="approvalTerms">
                    <option value="prepaid">Prepaid</option>
                    <option value="net15">Net 15</option>
                    <option value="net30">Net 30</option>
                    <option value="net60">Net 60</option>
                </select>
            </div>
            <div class="admin-modal-field">
                <label>Minimum Order ($)</label>
                <input type="number" id="approvalMinOrder" value="500" min="0" step="50">
            </div>
            <div class="admin-modal-actions">
                <button class="admin-modal-btn secondary" onclick="AdminApp.closeModal()">Cancel</button>
                <button class="admin-modal-btn primary" onclick="AdminApp.approveApplication('${accountId}', '${userId}')">Approve</button>
            </div>
        `;

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    },

    closeModal() {
        document.getElementById('adminModal').classList.remove('active');
    },

    async approveApplication(accountId, userId) {
        try {
            const tier = document.getElementById('approvalTier').value;
            const terms = document.getElementById('approvalTerms').value;
            const minOrder = parseInt(document.getElementById('approvalMinOrder').value) * 100;

            const response = await fetch('/api/approve-wholesale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_id: accountId,
                    user_id: userId,
                    discount_tier: tier,
                    payment_terms: terms,
                    min_order_cents: minOrder
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed');

            this.closeModal();
            this.loadApplications();
            this.loadStats();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    },

    async rejectApplication(accountId) {
        if (!confirm('Reject this application?')) return;

        const sb = getSupabase();
        const { data: account } = await sb.from('wholesale_accounts')
            .select('company_name, contact_email')
            .eq('id', accountId)
            .single();

        await sb.from('wholesale_accounts')
            .update({ application_status: 'rejected' })
            .eq('id', accountId);

        // Send rejection email (non-blocking)
        if (account) {
            fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template: 'wholesale-rejected',
                    to: account.contact_email,
                    data: { company_name: account.company_name }
                })
            }).catch(() => {});
        }

        this.loadApplications();
        this.loadStats();
    },

    async viewDocument(path) {
        const sb = getSupabase();
        const { data } = await sb.storage.from('wholesale-documents').createSignedUrl(path, 300);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    },

    /* ── Customers Tab ── */
    async loadCustomers() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_accounts')
            .select('*')
            .in('application_status', ['approved', 'suspended'])
            .order('company_name');

        this.accounts = data || [];
        this.renderCustomers(this.accounts);

        // Bind search/filter
        const search = document.getElementById('customerSearch');
        const filter = document.getElementById('customerFilter');

        search.oninput = () => this.filterCustomers();
        filter.onchange = () => this.filterCustomers();
    },

    filterCustomers() {
        const query = (document.getElementById('customerSearch').value || '').toLowerCase();
        const status = document.getElementById('customerFilter').value;

        let filtered = this.accounts;
        if (query) {
            filtered = filtered.filter(a =>
                a.company_name.toLowerCase().includes(query) ||
                a.contact_name.toLowerCase().includes(query) ||
                a.contact_email.toLowerCase().includes(query)
            );
        }
        if (status !== 'all') {
            filtered = filtered.filter(a => a.application_status === status);
        }
        this.renderCustomers(filtered);
    },

    renderCustomers(customers) {
        const body = document.getElementById('customersBody');
        if (!customers.length) {
            body.innerHTML = '<tr><td colspan="6" class="admin-empty">No customers found</td></tr>';
            return;
        }

        body.innerHTML = customers.map(a => `
            <tr>
                <td><strong>${a.company_name}</strong></td>
                <td>${a.contact_name}<br><span style="font-size:0.75rem;color:#8e9c98">${a.contact_email}</span></td>
                <td style="color:#50e8c0">${a.discount_tier}</td>
                <td>${a.payment_terms}</td>
                <td><span class="admin-badge admin-badge-${a.application_status}">${a.application_status}</span></td>
                <td>
                    <button class="admin-action-btn edit" onclick="AdminApp.editCustomer('${a.id}')">Edit</button>
                    ${a.application_status === 'approved'
                        ? `<button class="admin-action-btn suspend" onclick="AdminApp.toggleSuspend('${a.id}', 'suspended')">Suspend</button>`
                        : `<button class="admin-action-btn reactivate" onclick="AdminApp.toggleSuspend('${a.id}', 'approved')">Reactivate</button>`
                    }
                </td>
            </tr>
        `).join('');
    },

    async editCustomer(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) return;

        const modal = document.getElementById('adminModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <h3>Edit: ${account.company_name}</h3>
            <div class="admin-modal-field">
                <label>Discount Tier</label>
                <select id="editTier">
                    <option value="standard" ${account.discount_tier === 'standard' ? 'selected' : ''}>Standard (30%)</option>
                    <option value="preferred" ${account.discount_tier === 'preferred' ? 'selected' : ''}>Preferred (40%)</option>
                    <option value="premium" ${account.discount_tier === 'premium' ? 'selected' : ''}>Premium (50%)</option>
                    <option value="custom" ${account.discount_tier === 'custom' ? 'selected' : ''}>Custom</option>
                </select>
            </div>
            <div class="admin-modal-field">
                <label>Payment Terms</label>
                <select id="editTerms">
                    <option value="prepaid" ${account.payment_terms === 'prepaid' ? 'selected' : ''}>Prepaid</option>
                    <option value="net15" ${account.payment_terms === 'net15' ? 'selected' : ''}>Net 15</option>
                    <option value="net30" ${account.payment_terms === 'net30' ? 'selected' : ''}>Net 30</option>
                    <option value="net60" ${account.payment_terms === 'net60' ? 'selected' : ''}>Net 60</option>
                </select>
            </div>
            <div class="admin-modal-field">
                <label>Min Order ($)</label>
                <input type="number" id="editMinOrder" value="${account.min_order_cents / 100}" min="0" step="50">
            </div>
            <div class="admin-modal-actions">
                <button class="admin-modal-btn secondary" onclick="AdminApp.closeModal()">Cancel</button>
                <button class="admin-modal-btn primary" onclick="AdminApp.saveCustomer('${accountId}')">Save</button>
            </div>
        `;

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    },

    async saveCustomer(accountId) {
        const sb = getSupabase();
        await sb.from('wholesale_accounts').update({
            discount_tier: document.getElementById('editTier').value,
            payment_terms: document.getElementById('editTerms').value,
            min_order_cents: parseInt(document.getElementById('editMinOrder').value) * 100
        }).eq('id', accountId);

        this.closeModal();
        this.loadCustomers();
    },

    async toggleSuspend(accountId, newStatus) {
        const label = newStatus === 'suspended' ? 'suspend' : 'reactivate';
        if (!confirm(`Are you sure you want to ${label} this account?`)) return;

        const sb = getSupabase();
        await sb.from('wholesale_accounts')
            .update({ application_status: newStatus })
            .eq('id', accountId);

        this.loadCustomers();
        this.loadStats();
    },

    /* ── Pricing Tab ── */
    async loadPricingCustomers() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_accounts')
            .select('id, company_name')
            .eq('application_status', 'approved')
            .order('company_name');

        const select = document.getElementById('pricingCustomerSelect');
        select.innerHTML = '<option value="">Select a customer...</option>' +
            (data || []).map(a => `<option value="${a.id}">${a.company_name}</option>`).join('');

        select.onchange = () => {
            if (select.value) this.loadPricingForCustomer(select.value);
            else document.getElementById('pricingGrid').innerHTML = '<div class="admin-empty">Select a customer to manage pricing</div>';
        };
    },

    async loadPricingForCustomer(accountId) {
        const sb = getSupabase();
        const { data: existing } = await sb
            .from('wholesale_pricing')
            .select('product_id, wholesale_price_cents, min_quantity')
            .eq('account_id', accountId);

        const priceMap = {};
        (existing || []).forEach(p => {
            priceMap[p.product_id] = { price: p.wholesale_price_cents, min_qty: p.min_quantity };
        });

        const grid = document.getElementById('pricingGrid');
        grid.innerHTML = `
            <div class="pricing-row" style="font-weight:400;color:#8e9c98;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em">
                <span>Product</span>
                <span>Price ($)</span>
                <span>Min Qty</span>
                <span></span>
            </div>
        ` + ADMIN_PRODUCTS.map(p => {
            const existing = priceMap[p.id];
            const currentPrice = existing ? (existing.price / 100).toFixed(2) : '';
            const currentMinQty = existing ? existing.min_qty : 1;

            return `
                <div class="pricing-row" data-product-id="${p.id}">
                    <span class="pricing-product-name">${p.name} <span style="color:#506460;font-size:0.6875rem">($${p.retail})</span></span>
                    <input type="number" class="pricing-input price-input" value="${currentPrice}" placeholder="${(p.retail * 0.7).toFixed(2)}" min="0" step="0.01">
                    <input type="number" class="pricing-input qty-input" value="${currentMinQty}" min="1" step="1">
                    <button class="pricing-save-btn" onclick="AdminApp.savePricing('${accountId}', '${p.id}', this)">Save</button>
                </div>
            `;
        }).join('');
    },

    async savePricing(accountId, productId, btn) {
        const row = btn.closest('.pricing-row');
        const priceInput = row.querySelector('.price-input');
        const qtyInput = row.querySelector('.qty-input');

        const price = parseFloat(priceInput.value);
        const minQty = parseInt(qtyInput.value) || 1;

        if (!price || price <= 0) {
            // Delete custom pricing if price is empty
            const sb = getSupabase();
            await sb.from('wholesale_pricing')
                .delete()
                .eq('account_id', accountId)
                .eq('product_id', productId);
            btn.textContent = 'Cleared';
            setTimeout(() => { btn.textContent = 'Save'; }, 800);
            return;
        }

        const sb = getSupabase();
        const { error } = await sb.from('wholesale_pricing').upsert({
            account_id: accountId,
            product_id: productId,
            wholesale_price_cents: Math.round(price * 100),
            min_quantity: minQty
        }, { onConflict: 'account_id,product_id' });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            btn.textContent = 'Saved!';
            setTimeout(() => { btn.textContent = 'Save'; }, 800);
        }
    },

    /* ── Orders Tab ── */
    async loadOrders() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_orders')
            .select('*, wholesale_accounts(company_name)')
            .order('created_at', { ascending: false });

        const body = document.getElementById('ordersBody');
        if (!data || !data.length) {
            body.innerHTML = '<tr><td colspan="7" class="admin-empty">No orders</td></tr>';
            return;
        }

        body.innerHTML = data.map(o => `
            <tr>
                <td>${o.order_number}</td>
                <td>${o.wholesale_accounts?.company_name || '—'}</td>
                <td>${o.po_number || '—'}</td>
                <td>$${(o.total_cents / 100).toFixed(2)}</td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-${o.status}">${o.status}</span></td>
                <td>
                    <button class="admin-action-btn edit" onclick="AdminApp.showOrderDetail('${o.id}')">View</button>
                    <button class="admin-action-btn edit" onclick="AdminApp.showOrderModal('${o.id}', '${o.status}', '${o.tracking_number || ''}', '${o.tracking_carrier || ''}')">Update</button>
                </td>
            </tr>
        `).join('');

        // Bind search/filter
        document.getElementById('orderSearch').oninput = () => this.filterOrders(data);
        document.getElementById('orderFilter').onchange = () => this.filterOrders(data);
    },

    filterOrders(allOrders) {
        const query = (document.getElementById('orderSearch').value || '').toLowerCase();
        const status = document.getElementById('orderFilter').value;

        let filtered = allOrders;
        if (query) {
            filtered = filtered.filter(o =>
                o.order_number.toLowerCase().includes(query) ||
                (o.po_number || '').toLowerCase().includes(query) ||
                (o.wholesale_accounts?.company_name || '').toLowerCase().includes(query)
            );
        }
        if (status !== 'all') filtered = filtered.filter(o => o.status === status);

        const body = document.getElementById('ordersBody');
        if (!filtered.length) {
            body.innerHTML = '<tr><td colspan="7" class="admin-empty">No matching orders</td></tr>';
            return;
        }
        body.innerHTML = filtered.map(o => `
            <tr>
                <td>${o.order_number}</td>
                <td>${o.wholesale_accounts?.company_name || '—'}</td>
                <td>${o.po_number || '—'}</td>
                <td>$${(o.total_cents / 100).toFixed(2)}</td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-${o.status}">${o.status}</span></td>
                <td>
                    <button class="admin-action-btn edit" onclick="AdminApp.showOrderDetail('${o.id}')">View</button>
                    <button class="admin-action-btn edit" onclick="AdminApp.showOrderModal('${o.id}', '${o.status}', '${o.tracking_number || ''}', '${o.tracking_carrier || ''}')">Update</button>
                </td>
            </tr>
        `).join('');
    },

    async showOrderDetail(orderId) {
        const sb = getSupabase();
        const [orderRes, itemsRes, invoiceRes] = await Promise.all([
            sb.from('wholesale_orders').select('*, wholesale_accounts(company_name, contact_email)').eq('id', orderId).single(),
            sb.from('wholesale_order_items').select('*').eq('order_id', orderId).order('product_name'),
            sb.from('wholesale_invoices').select('invoice_number, payment_status, due_date').eq('order_id', orderId).maybeSingle()
        ]);
        const order = orderRes.data;
        const items = itemsRes.data || [];
        const invoice = invoiceRes.data;
        if (!order) return;

        const modal = document.getElementById('adminModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <h3 style="color:#50e8c0">${order.order_number} <span style="font-size:0.75rem;color:#8e9c98;font-weight:350">${order.wholesale_accounts?.company_name || ''}</span></h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0;font-size:0.8125rem">
                <div><span style="color:#8e9c98">Date:</span> ${new Date(order.created_at).toLocaleDateString()}</div>
                <div><span style="color:#8e9c98">Status:</span> <span class="admin-badge admin-badge-${order.status}">${order.status}</span></div>
                <div><span style="color:#8e9c98">PO:</span> ${order.po_number || '—'}</div>
                <div><span style="color:#8e9c98">Payment:</span> ${order.payment_method}</div>
                ${order.tracking_number ? `<div><span style="color:#8e9c98">Tracking:</span> <span style="color:#50e8c0">${order.tracking_carrier ? order.tracking_carrier.toUpperCase()+': ':''} ${order.tracking_number}</span></div>` : ''}
                ${invoice ? `<div><span style="color:#8e9c98">Invoice:</span> ${invoice.invoice_number} <span class="admin-badge admin-badge-${invoice.payment_status}">${invoice.payment_status}</span></div>` : ''}
            </div>
            <table class="admin-table" style="font-size:0.8125rem">
                <thead><tr><th>Product</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>${items.map(i => `<tr><td>${i.product_name}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">$${(i.unit_price_cents/100).toFixed(2)}</td><td style="text-align:right">$${(i.total_cents/100).toFixed(2)}</td></tr>`).join('')}</tbody>
                <tfoot><tr><td colspan="3" style="text-align:right;color:#8e9c98">Total</td><td style="text-align:right;color:#50e8c0;font-weight:500">$${(order.total_cents/100).toFixed(2)}</td></tr></tfoot>
            </table>
            <div class="admin-modal-actions" style="margin-top:16px">
                <button class="admin-modal-btn secondary" onclick="AdminApp.closeModal()">Close</button>
                <button class="admin-modal-btn primary" onclick="AdminApp.closeModal();AdminApp.showOrderModal('${order.id}', '${order.status}', '${order.tracking_number||''}', '${order.tracking_carrier||''}')">Edit Status</button>
            </div>
        `;
        modal.classList.add('active');
        modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
    },

    showOrderModal(orderId, currentStatus, tracking, carrier) {
        const modal = document.getElementById('adminModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <h3>Update Order</h3>
            <div class="admin-modal-field">
                <label>Status</label>
                <select id="orderStatus">
                    ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s =>
                        `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="admin-modal-field">
                <label>Tracking Number</label>
                <input type="text" id="orderTracking" value="${tracking}" placeholder="1Z999AA10123456784">
            </div>
            <div class="admin-modal-field">
                <label>Carrier</label>
                <select id="orderCarrier">
                    <option value="" ${!carrier ? 'selected' : ''}>Select...</option>
                    <option value="ups" ${carrier === 'ups' ? 'selected' : ''}>UPS</option>
                    <option value="fedex" ${carrier === 'fedex' ? 'selected' : ''}>FedEx</option>
                    <option value="usps" ${carrier === 'usps' ? 'selected' : ''}>USPS</option>
                    <option value="dhl" ${carrier === 'dhl' ? 'selected' : ''}>DHL</option>
                </select>
            </div>
            <div class="admin-modal-actions">
                <button class="admin-modal-btn secondary" onclick="AdminApp.closeModal()">Cancel</button>
                <button class="admin-modal-btn primary" onclick="AdminApp.updateOrder('${orderId}')">Save</button>
            </div>
        `;

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    },

    async updateOrder(orderId) {
        const sb = getSupabase();
        const status = document.getElementById('orderStatus').value;
        const tracking = document.getElementById('orderTracking').value;
        const carrier = document.getElementById('orderCarrier').value;

        const update = { status, tracking_number: tracking || null, tracking_carrier: carrier || null };
        if (status === 'shipped') update.shipped_at = new Date().toISOString();
        if (status === 'delivered') update.delivered_at = new Date().toISOString();

        await sb.from('wholesale_orders').update(update).eq('id', orderId);

        // Send shipping notification email
        if (status === 'shipped') {
            const { data: order } = await sb.from('wholesale_orders')
                .select('order_number, wholesale_accounts(contact_email)')
                .eq('id', orderId)
                .single();

            if (order?.wholesale_accounts?.contact_email) {
                fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template: 'order-shipped',
                        to: order.wholesale_accounts.contact_email,
                        data: {
                            order_number: order.order_number,
                            tracking_number: tracking || null,
                            tracking_carrier: carrier || null
                        }
                    })
                }).catch(() => {});
            }
        }

        this.closeModal();
        this.loadOrders();
        this.loadStats();
    },

    /* ── Invoices Tab ── */
    async loadInvoices() {
        const sb = getSupabase();
        const { data } = await sb
            .from('wholesale_invoices')
            .select('*, wholesale_orders(order_number), wholesale_accounts(company_name)')
            .order('created_at', { ascending: false });

        const body = document.getElementById('invoicesBody');
        if (!data || !data.length) {
            body.innerHTML = '<tr><td colspan="7" class="admin-empty">No invoices</td></tr>';
            return;
        }

        body.innerHTML = data.map(inv => `
            <tr>
                <td>${inv.invoice_number}</td>
                <td>${inv.wholesale_orders?.order_number || '—'}</td>
                <td>${inv.wholesale_accounts?.company_name || '—'}</td>
                <td>$${(inv.total_cents / 100).toFixed(2)}</td>
                <td>${new Date(inv.due_date).toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-${inv.payment_status}">${inv.payment_status}</span></td>
                <td>
                    ${inv.payment_status !== 'paid' && inv.payment_status !== 'void' ?
                        `<button class="admin-action-btn approve" onclick="AdminApp.markInvoicePaid('${inv.id}')">Mark Paid</button>` : ''}
                </td>
            </tr>
        `).join('');

        // Bind filter
        document.getElementById('invoiceFilter').onchange = () => {
            const status = document.getElementById('invoiceFilter').value;
            const filtered = status === 'all' ? data : data.filter(i => i.payment_status === status);
            if (!filtered.length) {
                body.innerHTML = '<tr><td colspan="7" class="admin-empty">No matching invoices</td></tr>';
                return;
            }
            body.innerHTML = filtered.map(inv => `
                <tr>
                    <td>${inv.invoice_number}</td>
                    <td>${inv.wholesale_orders?.order_number || '—'}</td>
                    <td>${inv.wholesale_accounts?.company_name || '—'}</td>
                    <td>$${(inv.total_cents / 100).toFixed(2)}</td>
                    <td>${new Date(inv.due_date).toLocaleDateString()}</td>
                    <td><span class="admin-badge admin-badge-${inv.payment_status}">${inv.payment_status}</span></td>
                    <td>
                        ${inv.payment_status !== 'paid' && inv.payment_status !== 'void' ?
                            `<button class="admin-action-btn approve" onclick="AdminApp.markInvoicePaid('${inv.id}')">Mark Paid</button>` : ''}
                    </td>
                </tr>
            `).join('');
        };
    },

    async markInvoicePaid(invoiceId) {
        const sb = getSupabase();
        await sb.from('wholesale_invoices').update({
            payment_status: 'paid',
            paid_at: new Date().toISOString()
        }).eq('id', invoiceId);

        this.loadInvoices();
        this.loadStats();
    },

    /* ── Real-time Updates ── */
    setupRealtime() {
        const sb = getSupabase();

        this.realtimeChannel = sb.channel('admin-wholesale')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wholesale_accounts' }, () => {
                this.loadStats();
                const activeTab = document.querySelector('.admin-tab.active')?.dataset.tab;
                if (activeTab === 'applications') this.loadApplications();
                if (activeTab === 'customers') this.loadCustomers();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wholesale_orders' }, () => {
                this.loadStats();
                const activeTab = document.querySelector('.admin-tab.active')?.dataset.tab;
                if (activeTab === 'orders') this.loadOrders();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wholesale_invoices' }, () => {
                this.loadStats();
                const activeTab = document.querySelector('.admin-tab.active')?.dataset.tab;
                if (activeTab === 'invoices') this.loadInvoices();
            })
            .subscribe();
    }
};

document.addEventListener('DOMContentLoaded', () => AdminApp.init());
