/**
 * Update Stripe product names, descriptions, and metadata
 * Cleans up verbose names into short product names + rich attributes
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const updates = [
    {
        nored_id: 'blue-lotus-tincture-5000',
        name: 'Blue Lotus Tincture',
        description: 'Full-spectrum Nymphaea caerulea flower extract tincture. Traditionally used for relaxation and mood support.',
        metadata: {
            nored_id: 'blue-lotus-tincture-5000',
            category: 'Tinctures',
            strength: '5000mg',
            botanical: 'Nymphaea caerulea',
            size: '1 fl oz (30ml)',
            type: 'Tincture',
        },
    },
    {
        nored_id: 'kanna-tincture-3000',
        name: 'Kanna Tincture',
        description: 'High-potency Sceletium tortuosum extract tincture. Traditionally used for mood elevation and stress relief.',
        metadata: {
            nored_id: 'kanna-tincture-3000',
            category: 'Tinctures',
            strength: '3000mg',
            botanical: 'Sceletium tortuosum',
            size: '1 fl oz (30ml)',
            type: 'Tincture',
        },
    },
    {
        nored_id: 'kanna-gummies-500',
        name: 'Kanna Gummies',
        description: 'Kanna-infused botanical gummies. Convenient daily supplement for mood and focus support.',
        metadata: {
            nored_id: 'kanna-gummies-500',
            category: 'Gummies',
            strength: '500mg total',
            botanical: 'Sceletium tortuosum',
            type: 'Gummy',
        },
    },
    {
        nored_id: 'blue-lotus-gummies-2500',
        name: 'Blue Lotus Gummies',
        description: 'Blue Lotus flower extract gummies. Premium botanical edible for relaxation and calm.',
        metadata: {
            nored_id: 'blue-lotus-gummies-2500',
            category: 'Gummies',
            strength: '2500mg total',
            botanical: 'Nymphaea caerulea',
            type: 'Gummy',
        },
    },
    {
        nored_id: 'blue-lotus-resin-1g',
        name: 'Blue Lotus Resin Extract',
        description: 'Concentrated Blue Lotus resin. High-potency botanical concentrate for experienced users.',
        metadata: {
            nored_id: 'blue-lotus-resin-1g',
            category: 'Extracts',
            weight: '1g',
            botanical: 'Nymphaea caerulea',
            type: 'Resin Extract',
        },
    },
    {
        nored_id: 'kanna-extract-1g',
        name: 'Kanna Extract',
        description: 'High potency Kanna extract powder. Concentrated Sceletium tortuosum for targeted use.',
        metadata: {
            nored_id: 'kanna-extract-1g',
            category: 'Extracts',
            weight: '1g',
            potency: 'High Potency',
            botanical: 'Sceletium tortuosum',
            type: 'Powder Extract',
        },
    },
    {
        nored_id: 'kava-co2-extract',
        name: 'Kava Kava CO2 Extract',
        description: 'Supercritical CO2 extracted Kava Kava. Clean extraction method preserving full kavalactone profile.',
        metadata: {
            nored_id: 'kava-co2-extract',
            category: 'Extracts',
            potency: 'High Potency',
            extraction: 'Supercritical CO2',
            botanical: 'Piper methysticum',
            type: 'CO2 Extract',
        },
    },
    {
        nored_id: 'dried-blue-lotus-1oz',
        name: 'Dried Blue Lotus Flowers',
        description: 'Whole dried Nymphaea caerulea flowers. Premium quality for tea, smoking blends, or extraction.',
        metadata: {
            nored_id: 'dried-blue-lotus-1oz',
            category: 'Dried Botanicals',
            weight: '1 oz',
            botanical: 'Nymphaea caerulea',
            form: 'Whole Dried Flowers',
            type: 'Dried Botanical',
        },
    },
    {
        nored_id: 'dried-kanna-1oz',
        name: 'Dried Kanna',
        description: 'Traditionally fermented dried Kanna herb. Ready for tea, chewing, or extraction.',
        metadata: {
            nored_id: 'dried-kanna-1oz',
            category: 'Dried Botanicals',
            weight: '1 oz',
            botanical: 'Sceletium tortuosum',
            form: 'Dried Fermented Herb',
            type: 'Dried Botanical',
        },
    },
    {
        nored_id: 'purple-dragon-fruit',
        name: 'Purple Dragon Fruit Plant',
        description: 'Rooted Purple Dragon Fruit cutting ready for planting. Thrives in USDA zones 9-11 or as an indoor tropical.',
        metadata: {
            nored_id: 'purple-dragon-fruit',
            category: 'Live Plants',
            size: '12-16 inches',
            botanical: 'Hylocereus',
            condition: 'Rooted Cutting',
            zones: '9-11',
            type: 'Live Plant',
        },
    },
    {
        nored_id: 'bob-gordon-elderberry',
        name: 'Bob Gordon Elderberry Plant',
        description: 'High-yield Bob Gordon cultivar elderberry. Excellent for culinary, medicinal, and landscaping use.',
        metadata: {
            nored_id: 'bob-gordon-elderberry',
            category: 'Live Plants',
            size: '12-16 inches',
            botanical: 'Sambucus nigra',
            cultivar: 'Bob Gordon',
            type: 'Live Plant',
        },
    },
    {
        nored_id: 'prickly-pear-2pad',
        name: 'Central Texas Prickly Pear',
        description: 'Native Central Texas Prickly Pear cactus. Drought-tolerant, produces edible fruit and pads.',
        metadata: {
            nored_id: 'prickly-pear-2pad',
            category: 'Live Plants',
            size: '2 pads, ~10 inches wide',
            botanical: 'Opuntia',
            origin: 'Central Texas',
            type: 'Live Plant',
        },
    },
    {
        nored_id: 'davis-mountain-yucca',
        name: 'Davis Mountain Yucca',
        description: 'Native Texas soapweed yucca from the Davis Mountains. Hardy, drought-tolerant ornamental.',
        metadata: {
            nored_id: 'davis-mountain-yucca',
            category: 'Live Plants',
            size: '6 inches',
            botanical: 'Yucca elata',
            common_name: 'Soapweed Yucca',
            origin: 'Davis Mountains, TX',
            type: 'Live Plant',
        },
    },
    {
        nored_id: 'sugarcane-seeds',
        name: 'Heirloom Sugarcane Seeds',
        description: 'Rare heirloom sugarcane seeds in archival glass vial. Long-term storage with 10-20 year shelf life.',
        metadata: {
            nored_id: 'sugarcane-seeds',
            category: 'Seeds',
            botanical: 'Saccharum officinarum',
            packaging: 'Glass vial',
            shelf_life: '10-20 years',
            type: 'Seeds',
        },
    },
    {
        nored_id: 'hibiscus-seeds',
        name: 'Hibiscus Seeds',
        description: 'Hibiscus seeds for home cultivation. Produces vibrant flowers used in teas, beverages, and herbal preparations.',
        metadata: {
            nored_id: 'hibiscus-seeds',
            category: 'Seeds',
            botanical: 'Hibiscus sabdariffa',
            type: 'Seeds',
        },
    },
    {
        nored_id: 'nicotiana-rustica-seeds',
        name: 'Nicotiana Rustica Seeds',
        description: 'Sacred tobacco seeds used traditionally in indigenous Hape (rapé) preparations. For cultivation and ethnobotanical study.',
        metadata: {
            nored_id: 'nicotiana-rustica-seeds',
            category: 'Seeds',
            botanical: 'Nicotiana rustica',
            common_name: 'Hape / Mapacho',
            type: 'Seeds',
        },
    },
];

async function updateProducts() {
    console.log('Updating 16 Stripe products...\n');

    let updated = 0;
    let errors = 0;

    for (const u of updates) {
        try {
            const existing = await stripe.products.search({
                query: `metadata["nored_id"]:"${u.nored_id}"`,
            });

            if (existing.data.length === 0) {
                console.log(`  MISS  ${u.nored_id} — not found in Stripe`);
                errors++;
                continue;
            }

            const productId = existing.data[0].id;

            await stripe.products.update(productId, {
                name: u.name,
                description: u.description,
                metadata: u.metadata,
            });

            console.log(`  OK    ${u.name}`);
            updated++;
        } catch (err) {
            console.error(`  FAIL  ${u.nored_id}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);
    console.log('View at: https://dashboard.stripe.com/test/products');
}

updateProducts().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
