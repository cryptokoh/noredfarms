#!/usr/bin/env node
/**
 * Index article HTML files into nf_articles table.
 * Scans articles/ directory, extracts metadata from HTML.
 *
 * Usage: node scripts/index-articles.js
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

function extractMeta(html, filename) {
  const slug = filename.replace('.html', '');

  // Title: prefer <title>, fallback to <h1>
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/\s*[-|]\s*Nored Farms.*$/i, '').trim();
  }
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) title = h1Match[1].trim();
  }
  if (!title) title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Meta description
  let seoDescription = '';
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  if (descMatch) seoDescription = descMatch[1].trim();

  // OG image
  let ogImage = '';
  const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogMatch) ogImage = ogMatch[1].trim();

  // Word count (strip tags)
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    slug,
    title,
    seo_description: seoDescription || null,
    og_image: ogImage || null,
    word_count: wordCount,
    reading_time_min: readingTime,
  };
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`Articles directory not found: ${ARTICLES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} article files`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const html = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const meta = extractMeta(html, file);

    // Check if exists
    const { data: existing } = await supabase.from('nf_articles').select('id').eq('slug', meta.slug).limit(1);
    if (existing && existing.length > 0) {
      // Update word count / reading time if changed
      await supabase.from('nf_articles').update({
        word_count: meta.word_count,
        reading_time_min: meta.reading_time_min,
        updated_at: new Date().toISOString(),
      }).eq('slug', meta.slug);
      console.log(`  UPDATE: ${meta.slug} (${meta.word_count} words)`);
      skipped++;
      continue;
    }

    const row = {
      slug: meta.slug,
      title: meta.title,
      seo_description: meta.seo_description,
      og_image: meta.og_image,
      word_count: meta.word_count,
      reading_time_min: meta.reading_time_min,
      is_published: true,
      published_at: new Date().toISOString(),
      author: 'Nored Farms',
    };

    const { error } = await supabase.from('nf_articles').insert(row);
    if (error) {
      console.error(`  ERROR: ${meta.slug}: ${error.message}`);
      errors++;
    } else {
      console.log(`  OK: ${meta.slug} — "${meta.title}" (${meta.word_count} words, ${meta.reading_time_min}min read)`);
      created++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} updated, ${errors} errors`);
}

main().catch(e => { console.error(e); process.exit(1); });
