/**
 * Send Contact Confirmation Email - Netlify Function
 * Sends a "we received your message" confirmation to the user after
 * they submit the contact form.
 *
 * Triggered client-side after successful Netlify Forms submission.
 *
 * Environment variables (set in Netlify UI):
 *  - RESEND_API_KEY: API key from resend.com
 *  - FROM_EMAIL (optional, default: noreply@noredfarms.com)
 */

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@noredfarms.com';
const SITE_URL = 'https://noredfarms.netlify.app';

const SUBJECT_LABELS = {
    general: 'General Question',
    product: 'Product Inquiry',
    wholesale: 'Wholesale / Bulk Order',
    classes: 'Classes & Courses',
    consulting: 'Consulting',
    collaboration: 'Collaboration / Partnership',
    other: 'Other'
};

function buildConfirmationEmail(firstName, subjectType) {
    const name = firstName || 'there';
    const topic = SUBJECT_LABELS[subjectType] || subjectType || 'your inquiry';

    return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#12181a;color:#bccac4;padding:32px;border-radius:12px">
        <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(80,232,192,0.08)">
            <h1 style="font-size:20px;font-weight:500;color:#50e8c0;margin:0">Nored Farms</h1>
        </div>

        <h2 style="font-size:18px;font-weight:500;color:#bccac4;margin:0 0 12px">Hi ${name}, we got your message.</h2>

        <p style="color:#8e9c98;font-size:14px;line-height:1.6;margin:0 0 16px">
            Thank you for reaching out about <strong style="color:#bccac4">${topic}</strong>. We have received your message and will get back to you within 1-2 business days.
        </p>

        <div style="background:#1e2628;border-radius:8px;padding:16px;margin:16px 0">
            <p style="color:#8e9c98;font-size:13px;line-height:1.5;margin:0">
                In the meantime, feel free to explore our latest articles, browse our product line, or check out our classes.
            </p>
        </div>

        <div style="margin:24px 0">
            <a href="${SITE_URL}/blog.html" style="display:inline-block;background:#50e8c0;color:#12181a;padding:10px 24px;border-radius:99em;text-decoration:none;font-size:14px;font-weight:400;margin-right:8px">Browse Articles</a>
            <a href="${SITE_URL}/marketplace.html" style="display:inline-block;background:transparent;color:#50e8c0;padding:10px 24px;border-radius:99em;text-decoration:none;font-size:14px;font-weight:400;border:1px solid rgba(80,232,192,0.2)">Shop Products</a>
        </div>

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(80,232,192,0.08);font-size:12px;color:#506460">
            <p style="margin:0 0 4px">Nored Farms | Premium Botanicals | Texas Hill Country</p>
            <p style="margin:0"><a href="${SITE_URL}" style="color:#50e8c0;text-decoration:none">noredfarms.netlify.app</a></p>
        </div>
    </div>`;
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { email, firstName, subject } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email is required' })
            };
        }

        // If no RESEND_API_KEY configured, log and return success (no-op mode)
        if (!process.env.RESEND_API_KEY) {
            console.log(`[CONTACT CONFIRMATION NO-OP] To: ${email}, Name: ${firstName}, Subject: ${subject}`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, provider: 'none', message: 'RESEND_API_KEY not configured' })
            };
        }

        const html = buildConfirmationEmail(firstName, subject);

        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: `Nored Farms <${FROM_EMAIL}>`,
                to: [email],
                subject: 'We received your message - Nored Farms',
                html
            })
        });

        const data = await resp.json();

        if (!resp.ok) {
            console.error('Resend error:', data);
            throw new Error(data.message || 'Resend API error');
        }

        console.log(`Contact confirmation sent: to=${email}, id=${data.id}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, provider: 'resend', id: data.id })
        };

    } catch (error) {
        console.error('Send contact confirmation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to send confirmation', message: error.message })
        };
    }
};
