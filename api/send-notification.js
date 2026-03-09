/**
 * Send Notification Email - Netlify Function
 * Sends transactional emails for wholesale events.
 *
 * Supports multiple providers via env vars:
 *  - RESEND_API_KEY → uses Resend
 *  - SENDGRID_API_KEY → uses SendGrid
 *  - Falls back to logging (no-op) if neither configured
 *
 * Environment variables:
 *  - RESEND_API_KEY or SENDGRID_API_KEY
 *  - FROM_EMAIL (default: noreply@noredfarms.com)
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@noredfarms.com';
const SITE_URL = 'https://noredfarms.netlify.app';

/* ── Email Provider Abstraction ── */

async function sendEmail(to, subject, html) {
    if (process.env.RESEND_API_KEY) {
        return sendViaResend(to, subject, html);
    }
    if (process.env.SENDGRID_API_KEY) {
        return sendViaSendGrid(to, subject, html);
    }
    console.log(`[EMAIL NO-OP] To: ${to}, Subject: ${subject}`);
    return { success: true, provider: 'none' };
}

async function sendViaResend(to, subject, html) {
    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: `Nored Farms <${FROM_EMAIL}>`,
            to: [to],
            subject,
            html
        })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Resend error');
    return { success: true, provider: 'resend', id: data.id };
}

async function sendViaSendGrid(to, subject, html) {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: FROM_EMAIL, name: 'Nored Farms' },
            subject,
            content: [{ type: 'text/html', value: html }]
        })
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'SendGrid error');
    }
    return { success: true, provider: 'sendgrid' };
}

/* ── Email Templates ── */

function baseTemplate(content) {
    return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#12181a;color:#bccac4;padding:32px;border-radius:12px">
        <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(80,232,192,0.08)">
            <h1 style="font-size:20px;font-weight:500;color:#50e8c0;margin:0">Nored Farms</h1>
        </div>
        ${content}
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(80,232,192,0.08);font-size:12px;color:#506460">
            <p>Nored Farms | Premium Botanicals | Texas Hill Country</p>
            <p><a href="${SITE_URL}" style="color:#50e8c0;text-decoration:none">noredfarms.netlify.app</a></p>
        </div>
    </div>`;
}

const TEMPLATES = {
    'wholesale-approved': (data) => ({
        subject: 'Your Wholesale Application is Approved!',
        html: baseTemplate(`
            <h2 style="font-size:18px;font-weight:500;color:#bccac4;margin:0 0 12px">Welcome, ${data.company_name}!</h2>
            <p style="color:#8e9c98;font-size:14px;line-height:1.6">
                Your wholesale application has been approved. Here are your account details:
            </p>
            <div style="background:#1e2628;border-radius:8px;padding:16px;margin:16px 0">
                <div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Discount Tier:</span> <span style="color:#50e8c0">${data.discount_tier}</span></div>
                <div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Payment Terms:</span> <span style="color:#bccac4">${data.payment_terms}</span></div>
                <div style="font-size:13px"><span style="color:#8e9c98">Min Order:</span> <span style="color:#bccac4">$${(data.min_order_cents / 100).toFixed(0)}</span></div>
            </div>
            <a href="${SITE_URL}/wholesale/dashboard.html" style="display:inline-block;background:#50e8c0;color:#12181a;padding:10px 24px;border-radius:99em;text-decoration:none;font-size:14px;font-weight:400;margin-top:8px">Go to Dashboard</a>
        `)
    }),

    'wholesale-rejected': (data) => ({
        subject: 'Update on Your Wholesale Application',
        html: baseTemplate(`
            <h2 style="font-size:18px;font-weight:500;color:#bccac4;margin:0 0 12px">Application Update</h2>
            <p style="color:#8e9c98;font-size:14px;line-height:1.6">
                Thank you for your interest in partnering with Nored Farms. After reviewing your application for <strong style="color:#bccac4">${data.company_name}</strong>, we're unable to approve it at this time.
            </p>
            <p style="color:#8e9c98;font-size:14px;line-height:1.6">
                If you have questions or would like to discuss further, please contact us at <a href="mailto:info@noredfarms.com" style="color:#50e8c0">info@noredfarms.com</a>.
            </p>
        `)
    }),

    'order-confirmed': (data) => ({
        subject: `Order Confirmed: ${data.order_number}`,
        html: baseTemplate(`
            <h2 style="font-size:18px;font-weight:500;color:#bccac4;margin:0 0 12px">Order Confirmed</h2>
            <p style="color:#8e9c98;font-size:14px;line-height:1.6">
                Your wholesale order has been confirmed.
            </p>
            <div style="background:#1e2628;border-radius:8px;padding:16px;margin:16px 0">
                <div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Order:</span> <span style="color:#50e8c0">${data.order_number}</span></div>
                ${data.po_number ? `<div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">PO:</span> <span style="color:#bccac4">${data.po_number}</span></div>` : ''}
                <div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Items:</span> <span style="color:#bccac4">${data.item_count} product(s)</span></div>
                <div style="font-size:13px"><span style="color:#8e9c98">Total:</span> <span style="color:#50e8c0">$${(data.total_cents / 100).toFixed(2)}</span></div>
            </div>
            <a href="${SITE_URL}/wholesale/dashboard.html" style="display:inline-block;background:#50e8c0;color:#12181a;padding:10px 24px;border-radius:99em;text-decoration:none;font-size:14px;font-weight:400;margin-top:8px">View Order</a>
        `)
    }),

    'order-shipped': (data) => ({
        subject: `Order Shipped: ${data.order_number}`,
        html: baseTemplate(`
            <h2 style="font-size:18px;font-weight:500;color:#bccac4;margin:0 0 12px">Your Order Has Shipped!</h2>
            <div style="background:#1e2628;border-radius:8px;padding:16px;margin:16px 0">
                <div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Order:</span> <span style="color:#50e8c0">${data.order_number}</span></div>
                ${data.tracking_carrier ? `<div style="font-size:13px;margin-bottom:8px"><span style="color:#8e9c98">Carrier:</span> <span style="color:#bccac4">${data.tracking_carrier.toUpperCase()}</span></div>` : ''}
                ${data.tracking_number ? `<div style="font-size:13px"><span style="color:#8e9c98">Tracking:</span> <span style="color:#50e8c0">${data.tracking_number}</span></div>` : ''}
            </div>
            <a href="${SITE_URL}/wholesale/dashboard.html" style="display:inline-block;background:#50e8c0;color:#12181a;padding:10px 24px;border-radius:99em;text-decoration:none;font-size:14px;font-weight:400;margin-top:8px">View Order</a>
        `)
    })
};

/* ── Handler ── */

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { template, to, data } = JSON.parse(event.body);

        if (!template || !to || !data) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing template, to, or data' }) };
        }

        const templateFn = TEMPLATES[template];
        if (!templateFn) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown template: ${template}` }) };
        }

        const { subject, html } = templateFn(data);
        const result = await sendEmail(to, subject, html);

        console.log(`Email sent: template=${template}, to=${to}, provider=${result.provider}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, provider: result.provider })
        };
    } catch (error) {
        console.error('Send notification error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to send notification', message: error.message })
        };
    }
};
