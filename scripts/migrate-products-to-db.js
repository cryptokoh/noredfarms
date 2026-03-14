#!/usr/bin/env node
/**
 * Migrate hardcoded cart.js products into nf_products table.
 *
 * Usage: node scripts/migrate-products-to-db.js
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: STRIPE_SECRET_KEY (to create Stripe products/prices)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Extract products from cart.js — parse the products array
function extractProducts() {
  const cartPath = path.join(__dirname, '..', 'cart.js');
  const src = fs.readFileSync(cartPath, 'utf8');

  // Find the products array: const products = [ ... ];
  const match = src.match(/(?:const|let|var)\s+products\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find products array in cart.js');
    process.exit(1);
  }

  // Eval in a sandbox-like context (safe since it's our own file)
  let products;
  try {
    products = new Function(`return ${match[1]}`)();
  } catch (e) {
    console.error('Failed to parse products:', e.message);
    process.exit(1);
  }
  return products;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const products = extractProducts();
  console.log(`Found ${products.length} products in cart.js`);

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const slug = p.slug || slugify(p.name);
    const priceCents = Math.round((p.price || 0) * 100);

    // Check if exists
    const { data: existing } = await supabase.from('nf_products').select('id').eq('slug', slug).limit(1);
    if (existing && existing.length > 0) {
      console.log(`  SKIP: ${slug} (already exists)`);
      skipped++;
      continue;
    }

    const row = {
      slug,
      name: p.name,
      category: p.category || 'general',
      price_cents: priceCents,
      compare_at_cents: p.compareAtPrice ? Math.round(p.compareAtPrice * 100) : null,
      description: p.description || null,
      short_description: p.shortDescription || null,
      images: p.images || (p.image ? [p.image] : []),
      tags: p.tags || [],
      sku: p.sku || null,
      stock_status: p.inStock === false ? 'out_of_stock' : 'in_stock',
      is_published: true,
      metadata: {},
      sort_order: created,
    };

    const { error } = await supabase.from('nf_products').insert(row);
    if (error) {
      console.error(`  ERROR: ${slug}: ${error.message}`);
    } else {
      console.log(`  OK: ${slug} ($${(priceCents / 100).toFixed(2)})`);
      created++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);

  // Optionally create Stripe products
  if (process.env.STRIPE_SECRET_KEY && created > 0) {
    console.log('\nCreating Stripe products/prices...');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { data: dbProducts } = await supabase.from('nf_products').select('*').is('stripe_product_id', null);
    for (const prod of (dbProducts || [])) {
      try {
        const stripeProduct = await stripe.products.create({
          name: prod.name,
          metadata: { nf_id: prod.id, category: prod.category },
        });
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: prod.price_cents,
          currency: 'usd',
        });

        await supabase.from('nf_products').update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        }).eq('id', prod.id);

        console.log(`  Stripe: ${prod.slug} -> ${stripeProduct.id}`);
      } catch (e) {
        console.error(`  Stripe ERROR: ${prod.slug}: ${e.message}`);
      }
    }
    console.log('Stripe sync complete.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
