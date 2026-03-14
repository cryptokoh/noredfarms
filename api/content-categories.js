/**
 * Content API: Categories
 * GET  - list categories
 * POST - create category (requires x-api-key)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function authCheck(event) {
  const key = event.headers['x-api-key'];
  return key && key === process.env.CONTENT_API_KEY;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase.from('nf_categories').select('*').order('sort_order');
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { name, slug, description, icon, sort_order } = body;
      if (!name || !slug) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'name and slug required' }) };

      const { data, error } = await supabase.from('nf_categories')
        .insert({ name, slug, description, icon, sort_order: sort_order || 0 })
        .select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
