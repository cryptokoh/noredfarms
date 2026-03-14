/**
 * Content API: Products
 * GET  - list/filter products
 * POST - create product
 * PATCH - update product (requires x-api-key)
 * DELETE - soft-delete product (requires x-api-key)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function authCheck(event) {
  const key = event.headers['x-api-key'];
  return key && key === process.env.CONTENT_API_KEY;
}

async function notifyFlowB(eventType, data) {
  const url = process.env.FLOWB_WEBHOOK_URL;
  const apiKey = process.env.CONTENT_API_KEY;
  if (!url || !apiKey) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_slug: 'nored-farms',
        api_key: apiKey,
        event: eventType,
        data,
      }),
    });
  } catch (e) {
    console.error('FlowB webhook error:', e.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    // GET: list/filter products
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      let query = supabase.from('nf_products').select('*');

      if (params.category) query = query.eq('category', params.category);
      if (params.published !== 'all') query = query.eq('is_published', true);
      if (params.search) query = query.or(`name.ilike.%${params.search}%,tags.cs.{${params.search}}`);
      if (params.slug) query = query.eq('slug', params.slug).limit(1);

      query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (params.limit) query = query.limit(parseInt(params.limit, 10));

      const { data, error } = await query;
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(params.slug ? (data?.[0] || null) : data) };
    }

    // POST: create product
    if (event.httpMethod === 'POST') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { name, slug, category, price_cents, ...rest } = body;
      if (!name || !slug || !category || !price_cents) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'name, slug, category, price_cents required' }) };
      }

      const { data, error } = await supabase.from('nf_products').insert({ name, slug, category, price_cents, ...rest }).select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      await notifyFlowB('product_added', { entity_type: 'product', entity_id: data.id, name, category, price_cents });
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(data) };
    }

    // PATCH: update product
    if (event.httpMethod === 'PATCH') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { id, ...updates } = body;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'id required' }) };
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase.from('nf_products').update(updates).eq('id', id).select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      await notifyFlowB('product_updated', { entity_type: 'product', entity_id: id, fields: Object.keys(updates) });
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // DELETE: soft-delete
    if (event.httpMethod === 'DELETE') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const params = event.queryStringParameters || {};
      if (!params.id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'id required' }) };

      const { error } = await supabase.from('nf_products').update({ is_published: false }).eq('id', params.id);
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
