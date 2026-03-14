/**
 * Content API: SEO Status
 * GET - returns SEO health for articles
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function checkSeoIssues(article) {
  const issues = [];
  if (!article.seo_title) issues.push('Missing SEO title');
  if (!article.seo_description) issues.push('Missing meta description');
  if (article.seo_title && article.seo_title.length > 60) issues.push('SEO title too long (>60 chars)');
  if (article.seo_description && article.seo_description.length > 160) issues.push('Meta description too long (>160 chars)');
  if (!article.featured_image) issues.push('No featured image');
  if (!article.og_image) issues.push('No Open Graph image');
  if (!article.excerpt) issues.push('Missing excerpt');
  if (!article.tags || article.tags.length === 0) issues.push('No tags');

  // Score: start at 100, deduct per issue
  const score = Math.max(0, 100 - (issues.length * 12));
  return { score, issues };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const params = event.queryStringParameters || {};

    // Single article SEO check
    if (params.article_id) {
      const { data: article, error } = await supabase.from('nf_articles').select('*').eq('id', params.article_id).single();
      if (error || !article) return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'Article not found' }) };

      const { score, issues } = checkSeoIssues(article);

      // Update score in DB
      await supabase.from('nf_articles').update({ seo_score: score, seo_issues: issues }).eq('id', article.id);

      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ article: article.title, slug: article.slug, score, issues }),
      };
    }

    // Overall SEO status
    const { data: articles, error } = await supabase.from('nf_articles').select('id,title,slug,seo_title,seo_description,featured_image,og_image,excerpt,tags,seo_score');
    if (error) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) };

    const results = (articles || []).map(a => {
      const { score, issues } = checkSeoIssues(a);
      return { id: a.id, title: a.title, slug: a.slug, score, issues, issue_count: issues.length };
    });

    // Batch update scores
    for (const r of results) {
      await supabase.from('nf_articles').update({ seo_score: r.score, seo_issues: r.issues }).eq('id', r.id);
    }

    const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
    const critical = results.filter(r => r.score < 50);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        total_articles: results.length,
        average_score: avgScore,
        critical_count: critical.length,
        critical: critical.map(r => ({ title: r.title, slug: r.slug, score: r.score, issues: r.issues })),
        all: results.sort((a, b) => a.score - b.score),
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
