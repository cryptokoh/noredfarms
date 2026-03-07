/**
 * Update Stripe product descriptions to include size/strength/specs
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const updates = [
    {
        nored_id: 'blue-lotus-tincture-5000',
        description: '5000mg · 1 fl oz (30ml). Full-spectrum Nymphaea caerulea flower extract tincture. Traditionally used for relaxation and mood support.',
    },
    {
        nored_id: 'kanna-tincture-3000',
        description: '3000mg · 1 fl oz (30ml). High-potency Sceletium tortuosum extract tincture. Traditionally used for mood elevation and stress relief.',
    },
    {
        nored_id: 'kanna-gummies-500',
        description: '500mg total. Kanna-infused botanical gummies. Convenient daily supplement for mood and focus support.',
    },
    {
        nored_id: 'blue-lotus-gummies-2500',
        description: '2500mg total. Blue Lotus flower extract gummies. Premium botanical edible for relaxation and calm.',
    },
    {
        nored_id: 'blue-lotus-resin-1g',
        description: '1 gram. Concentrated Blue Lotus resin. High-potency botanical concentrate for experienced users.',
    },
    {
        nored_id: 'kanna-extract-1g',
        description: '1 gram · High Potency. Concentrated Kanna (Sceletium tortuosum) extract powder for targeted use.',
    },
    {
        nored_id: 'kava-co2-extract',
        description: 'High Potency · Supercritical CO2 Extraction. Clean extraction method preserving full kavalactone profile from Piper methysticum root.',
    },
    {
        nored_id: 'dried-blue-lotus-1oz',
        description: '1 oz. Whole dried Nymphaea caerulea flowers. Premium quality for tea, smoking blends, or extraction.',
    },
    {
        nored_id: 'dried-kanna-1oz',
        description: '1 oz. Traditionally fermented dried Kanna (Sceletium tortuosum) herb. Ready for tea, chewing, or extraction.',
    },
    {
        nored_id: 'purple-dragon-fruit',
        description: 'Rooted cutting · 12-16 inches. Purple Dragon Fruit ready for planting. Thrives in USDA zones 9-11 or as an indoor tropical.',
    },
    {
        nored_id: 'bob-gordon-elderberry',
        description: '12-16 inches tall. High-yield Bob Gordon cultivar elderberry (Sambucus nigra). Excellent for culinary, medicinal, and landscaping use.',
    },
    {
        nored_id: 'prickly-pear-2pad',
        description: '2 pads · ~10 inches wide. Native Central Texas Prickly Pear cactus (Opuntia). Drought-tolerant, produces edible fruit and pads.',
    },
    {
        nored_id: 'davis-mountain-yucca',
        description: '6 inches tall. Native Texas soapweed yucca (Yucca elata) from the Davis Mountains. Hardy, drought-tolerant ornamental.',
    },
    {
        nored_id: 'sugarcane-seeds',
        description: 'Glass vial · 10-20 year shelf life. Rare heirloom sugarcane (Saccharum officinarum) seeds in archival storage.',
    },
    {
        nored_id: 'hibiscus-seeds',
        description: 'Hibiscus sabdariffa seeds for home cultivation. Produces vibrant flowers used in teas, beverages, and herbal preparations.',
    },
    {
        nored_id: 'nicotiana-rustica-seeds',
        description: 'Nicotiana rustica (Mapacho). Sacred tobacco seeds used traditionally in indigenous Hape (rapé) preparations. For cultivation and ethnobotanical study.',
    },
];

async function run() {
    console.log('Updating descriptions...\n');
    for (const u of updates) {
        const res = await stripe.products.search({ query: `metadata["nored_id"]:"${u.nored_id}"` });
        if (!res.data.length) { console.log(`  MISS  ${u.nored_id}`); continue; }
        await stripe.products.update(res.data[0].id, { description: u.description });
        console.log(`  OK    ${res.data[0].name}`);
    }
    console.log('\nDone.');
}

run().catch(e => { console.error(e.message); process.exit(1); });
