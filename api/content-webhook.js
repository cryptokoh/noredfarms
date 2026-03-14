/**
 * Content API: Webhook forwarder
 * POST - receives internal events and forwards to FlowB inbound-webhook
 */

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const key = event.headers['x-api-key'];
  if (!key || key !== process.env.CONTENT_API_KEY) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { event_type, data } = body;
    if (!event_type) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'event_type required' }) };

    const webhookUrl = process.env.FLOWB_WEBHOOK_URL;
    if (!webhookUrl) return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: 'no FLOWB_WEBHOOK_URL' }) };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_slug: 'nored-farms',
        api_key: process.env.CONTENT_API_KEY,
        event: event_type,
        data: data || {},
      }),
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ok: res.ok, status: res.status }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
