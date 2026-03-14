/**
 * Content API: Media Library
 * GET  - list media
 * POST - create media record (requires x-api-key)
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
      const params = event.queryStringParameters || {};
      let query = supabase.from('nf_media').select('*');

      if (params.folder) query = query.eq('folder', params.folder);
      if (params.mime_type) query = query.ilike('mime_type', `${params.mime_type}%`);
      query = query.order('created_at', { ascending: false });
      if (params.limit) query = query.limit(parseInt(params.limit, 10));

      const { data, error } = await query;
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      if (!authCheck(event)) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body);
      const { filename, url, alt_text, mime_type, size_bytes, width, height, folder, tags, uploaded_by } = body;
      if (!filename || !url) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'filename and url required' }) };

      const { data, error } = await supabase.from('nf_media')
        .insert({ filename, url, alt_text, mime_type, size_bytes, width, height, folder, tags, uploaded_by })
        .select().single();
      if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
