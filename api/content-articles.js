/**
 * Content API: Articles
 * GET  - list/filter articles
 * POST - create article metadata
 * PATCH - update article metadata (requires x-api-key)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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
      body: JSON.stringify({ project_slug: 'nored-farms', api_key: apiKey, event: eventType, data }),
    });
  } catch (e) {
    console.error('FlowB webhook error:', e.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      let query = supabase.from('nf_articles').select('*');

      if (params.status === 'draft') query = query.eq('is_published', false);
      else if (params.status !== 'all') query = query.eq('is_published', true);
      if (params.category) query = query.eq('category', params.category);
      if (params.search) query = query.or(`title.ilike.%${params.search}%,tags.cs.{${params.search}}`);
      if (params.slug) query = query.eq('slug', params.slug).limit(1);

      query = query.order('published_at', { ascending: false, nullsFirst: false });
      if (params.limit) query = query.limit(parseInt(params.limit, 10));

      const { data, error } = await query;
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(params.slug ? (data?.[0] || null) : data) };
    }

    if (event.httpMethod === 'POST') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { title, slug, ...rest } = body;
      if (!title || !slug) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'title and slug required' }) };

      const { data, error } = await supabase.from('nf_articles').insert({ title, slug, ...rest }).select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      await notifyFlowB('article_created', { entity_type: 'article', entity_id: data.id, title });
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PATCH') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { id, ...updates } = body;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'id required' }) };
      updates.updated_at = new Date().toISOString();

      // Handle publish action
      if (updates.is_published === true && !updates.published_at) {
        updates.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase.from('nf_articles').update(updates).eq('id', id).select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };

      const eventType = updates.is_published ? 'article_published' : 'article_updated';
      await notifyFlowB(eventType, { entity_type: 'article', entity_id: id, title: data.title, fields: Object.keys(updates) });
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
