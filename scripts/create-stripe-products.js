/**
 * Create Stripe Products & Prices for Nored Farms
 * Run: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.js
 * Or create .env with STRIPE_SECRET_KEY and run: node scripts/create-stripe-products.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const products = [
    // Tinctures
    {
        id: 'blue-lotus-tincture-5000',
        name: '5000mg Blue Lotus Tincture',
        description: 'Premium 5000mg Blue Lotus flower extract tincture. Full-spectrum botanical preparation.',
        price: 6000, // cents
        category: 'Tinctures',
        images: [],
    },
    {
        id: 'kanna-tincture-3000',
        name: '3000mg Kanna Tincture',
        description: 'High-potency 3000mg Kanna (Sceletium tortuosum) extract tincture.',
        price: 8000,
        category: 'Tinctures',
        images: [],
    },

    // Gummies
    {
        id: 'kanna-gummies-500',
        name: '500mg Kanna Gummies',
        description: 'Kanna-infused gummies, 500mg total. Convenient botanical supplement.',
        price: 4000,
        category: 'Gummies',
        images: [],
    },
    {
        id: 'blue-lotus-gummies-2500',
        name: '2500mg Blue Lotus Gummies',
        description: 'Blue Lotus flower extract gummies, 2500mg total. Premium botanical edible.',
        price: 4000,
        category: 'Gummies',
        images: [],
    },

    // Extracts
    {
        id: 'blue-lotus-resin-1g',
        name: '1g Blue Lotus Resin Extract',
        description: 'Concentrated Blue Lotus resin extract, 1 gram. High-potency botanical concentrate.',
        price: 3000,
        category: 'Extracts',
        images: [],
    },
    {
        id: 'kanna-extract-1g',
        name: '1g High Potency Kanna Extract',
        description: 'High potency Kanna (Sceletium tortuosum) extract, 1 gram. Concentrated botanical.',
        price: 4000,
        category: 'Extracts',
        images: [],
    },
    {
        id: 'kava-co2-extract',
        name: 'High Potency Kava Kava CO2 Extract',
        description: 'Supercritical CO2 extracted Kava Kava. High potency kavalactone concentration.',
        price: 3000,
        category: 'Extracts',
        images: [],
    },

    // Dried Botanicals
    {
        id: 'dried-blue-lotus-1oz',
        name: 'Dried Blue Lotus (1 oz)',
        description: 'Whole dried Blue Lotus flowers (Nymphaea caerulea), 1 ounce. Premium quality.',
        price: 3000,
        category: 'Dried Botanicals',
        images: [],
    },
    {
        id: 'dried-kanna-1oz',
        name: 'Dried Kanna (1 oz)',
        description: 'Dried Kanna (Sceletium tortuosum) herb, 1 ounce. Traditionally fermented.',
        price: 3000,
        category: 'Dried Botanicals',
        images: [],
    },

    // Live Plants
    {
        id: 'purple-dragon-fruit',
        name: 'Purple Dragon Fruit, rooted 12-16"',
        description: 'Rooted Purple Dragon Fruit cutting, 12-16 inches. Ready for planting in USDA zones 9-11.',
        price: 2000,
        category: 'Live Plants',
        images: [],
    },
    {
        id: 'bob-gordon-elderberry',
        name: 'Bob Gordon Elderberry, 12-16" tall',
        description: 'Bob Gordon Elderberry plant, 12-16 inches tall. High-yield cultivar for culinary and medicinal use.',
        price: 2000,
        category: 'Live Plants',
        images: [],
    },
    {
        id: 'prickly-pear-2pad',
        name: 'Central Texas Prickly Pear, 2 pads 10" wide',
        description: 'Central Texas Prickly Pear cactus, 2 pads approximately 10 inches wide. Drought-tolerant native.',
        price: 2000,
        category: 'Live Plants',
        images: [],
    },
    {
        id: 'davis-mountain-yucca',
        name: 'Davis Mountain Yucca (soapweed), 6" tall',
        description: 'Davis Mountain Yucca (soapweed), 6 inches tall. Native Texas drought-tolerant ornamental.',
        price: 2500,
        category: 'Live Plants',
        images: [],
    },

    // Seeds
    {
        id: 'sugarcane-seeds',
        name: 'Heirloom Sugarcane Seeds, glass vial 10-20yr shelf life',
        description: 'Heirloom sugarcane seeds in archival glass vial. 10-20 year shelf life. Rare botanical seed.',
        price: 2000,
        category: 'Seeds',
        images: [],
    },
    {
        id: 'hibiscus-seeds',
        name: 'Hibiscus Seeds',
        description: 'Hibiscus seeds for home cultivation. Produces vibrant flowers used in teas and preparations.',
        price: 2000,
        category: 'Seeds',
        images: [],
    },
    {
        id: 'nicotiana-rustica-seeds',
        name: 'Nicotiana Rustica (Hape) Seeds',
        description: 'Nicotiana Rustica seeds, traditionally used in indigenous Hape preparations. Sacred botanical.',
        price: 4000,
        category: 'Seeds',
        images: [],
    },
];

async function createProducts() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY not set. Either:');
        console.error('  1. Create .env file with STRIPE_SECRET_KEY=sk_test_...');
        console.error('  2. Run: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.js');
        process.exit(1);
    }

    console.log('Creating 16 products in Stripe...\n');

    const results = { created: [], skipped: [], errors: [] };

    for (const p of products) {
        try {
            // Check if product already exists by metadata lookup
            const existing = await stripe.products.search({
                query: `metadata["nored_id"]:"${p.id}"`,
            });

            if (existing.data.length > 0) {
                console.log(`  SKIP  ${p.name} (already exists: ${existing.data[0].id})`);
                results.skipped.push(p.name);
                continue;
            }

            // Create product
            const product = await stripe.products.create({
                name: p.name,
                description: p.description,
                metadata: {
                    nored_id: p.id,
                    category: p.category,
                },
                shippable: ['Live Plants', 'Seeds', 'Dried Botanicals'].includes(p.category),
                // images: p.images, // uncomment when product images are hosted
            });

            // Create price
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: p.price,
                currency: 'usd',
                metadata: {
                    nored_id: p.id,
                },
            });

            // Set default price on product
            await stripe.products.update(product.id, {
                default_price: price.id,
            });

            console.log(`  OK    ${p.name} — $${(p.price / 100).toFixed(2)} (${product.id} / ${price.id})`);
            results.created.push({ name: p.name, productId: product.id, priceId: price.id });
        } catch (err) {
            console.error(`  FAIL  ${p.name}: ${err.message}`);
            results.errors.push({ name: p.name, error: err.message });
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Created: ${results.created.length}`);
    console.log(`Skipped: ${results.skipped.length}`);
    console.log(`Errors:  ${results.errors.length}`);

    if (results.created.length > 0) {
        console.log('\nProduct ID → Price ID mapping:');
        for (const r of results.created) {
            console.log(`  ${r.name}`);
            console.log(`    product: ${r.productId}`);
            console.log(`    price:   ${r.priceId}`);
        }
    }

    console.log('\nView products at: https://dashboard.stripe.com/test/products');
}

createProducts().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
