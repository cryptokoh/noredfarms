/**
 * Nored Farms - Blog & Education Scripts
 * Data-driven article listing with search, filtering, and pagination
 * Covers 130+ articles across Plants, Garden Design, Compounds, Extraction, Studies, and Science
 */

/* ──────────────────────────────────────────────────────────
   ARTICLE DATA
   Categories: plants, garden-design, compounds, extraction, studies, science
   ────────────────────────────────────────────────────────── */
var ARTICLES = [

    // ── PLANTS (cultivation guides) ──────────────────────
    { title: 'Absinthe Wormwood (Artemisia absinthium)', excerpt: 'Thujone chemistry, bitter compound profiles, propagation, harvest, and historical context in distillation and herbalism.', href: 'articles/absinthe-wormwood-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Agarita (Mahonia trifoliata)', excerpt: 'Drought-hardy Texas native: berberine-rich chemistry, propagation from seed and cuttings, and wild harvest best practices.', href: 'articles/agarita-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Akuamma (Picralima nitida)', excerpt: 'West African tree: akuammine alkaloid chemistry, tropical cultivation, seed propagation, and ethnobotanical context.', href: 'articles/akuamma-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Aloe Vera (Aloe barbadensis)', excerpt: 'Succulent cultivation, acemannan polysaccharide chemistry, propagation from offsets, and gel processing methods.', href: 'articles/aloe-vera-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Ashwagandha (Withania somnifera)', excerpt: 'Adaptogenic root cultivation, withanolide chemistry, seed propagation, and harvest timing for root potency.', href: 'articles/ashwagandha-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Bacopa Monnieri (Brahmi)', excerpt: 'Bacoside chemistry, aquatic growing systems, propagation methods, and cognitive enhancement research.', href: 'articles/bacopa-monnieri-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Blue Java Banana (Musa acuminata x balbisiana)', excerpt: 'Cold-hardy Musa genetics, mat management, tropical requirements, and bunch harvest timing.', href: 'articles/blue-java-banana-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Calea Zacatechichi (Dream Herb)', excerpt: 'Mexican dream herb cultivation, sesquiterpene lactone chemistry, propagation, and Oaxacan ethnobotanical context.', href: 'articles/calea-zacatechichi-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Calendula (Calendula officinalis)', excerpt: 'Pot marigold cultivation, triterpenoid chemistry, direct-seeding, and skin-care preparations.', href: 'articles/calendula-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: "Cat's Claw (Uncaria tomentosa)", excerpt: 'Amazonian vine cultivation, oxindole alkaloid chemistry, trellis systems, and immunomodulatory research.', href: 'articles/cats-claw-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Chaga Mushroom (Inonotus obliquus)', excerpt: 'Birch-parasitic fungus cultivation, betulinic acid chemistry, inoculation methods, and sustainable wild-harvest.', href: 'articles/chaga-mushroom-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Chamomile (Matricaria chamomilla)', excerpt: 'German chamomile cultivation, apigenin and bisabolol chemistry, direct-seeding, and tea processing.', href: 'articles/chamomile-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Citronella Grass (Cymbopogon nardus)', excerpt: 'Essential oil grass cultivation, citronellal chemistry, division propagation, and natural insect repellent uses.', href: 'articles/citronella-grass-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Cordyceps Mushroom (Cordyceps militaris)', excerpt: 'Lab-cultured medicinal mushroom, cordycepin chemistry, substrate preparation, and athletic performance research.', href: 'articles/cordyceps-mushroom-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Damiana (Turnera diffusa)', excerpt: 'Mexican shrub cultivation, flavonoid chemistry, seed propagation, and traditional aphrodisiac applications.', href: 'articles/damiana-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Dandelion (Taraxacum officinale)', excerpt: 'Nutritional density, taproot biology, culinary preparation, and preclinical anticancer research.', href: 'articles/dandelion-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Davis Mountain Yucca (Yucca pallida)', excerpt: 'Compact West Texas native: saponin chemistry, xeriscaping applications, and traditional surfactant extraction.', href: 'articles/davis-mountain-yucca-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Deep Purple Carrot (Daucus carota)', excerpt: 'Purple-rooted cultivars: anthocyanin profiles, direct-seeding, growing parameters, and pigment-preserving processing.', href: 'articles/deep-purple-carrot-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Detroit Dark Red Beet (Beta vulgaris)', excerpt: 'Heirloom beet: betalain pigment chemistry, direct-seeding techniques, harvest timing, and root processing.', href: 'articles/detroit-red-beet-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Dragon Fruit (Hylocereus)', excerpt: 'Pitaya cactus: betalain chemistry, trellis systems, hand pollination, and post-harvest handling.', href: 'articles/dragon-fruit-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Duckweed (Lemna & Wolffia)', excerpt: 'Smallest flowering plant: protein content analysis, aquatic cultivation systems, and sustainable food research.', href: 'articles/duckweed-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Echinacea (Echinacea purpurea)', excerpt: 'Purple coneflower cultivation, alkamide chemistry, seed stratification, and immune support research.', href: 'articles/echinacea-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Egyptian Blue Lotus (Nymphaea caerulea)', excerpt: 'Sacred water lily: apomorphine and nuciferine chemistry, aquatic growing systems, and historical Egyptian context.', href: 'articles/egyptian-blue-lotus-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Elderberry (Sambucus)', excerpt: 'Anthocyanin chemistry, climate adaptation, propagation, harvest timing, and home-scale extraction.', href: 'articles/elderberry-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Feverfew (Tanacetum parthenium)', excerpt: 'Parthenolide chemistry, container cultivation, seed propagation, and migraine prevention research.', href: 'articles/feverfew-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Ginger (Zingiber officinale)', excerpt: 'Gingerol chemistry, tropical growing parameters, rhizome propagation, harvest, and extraction methods.', href: 'articles/ginger-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Hawaiian Baby Woodrose (Argyreia nervosa)', excerpt: 'Tropical vine: ergine alkaloid chemistry, propagation from seed, and ethnobotanical context.', href: 'articles/hawaiian-baby-woodrose-guide.html', category: 'plants', time: '18 min' },
    { title: 'Heavenly Blue Morning Glory (Ipomoea tricolor)', excerpt: 'LSA-containing seed chemistry, growing requirements, and Mesoamerican ethnobotanical significance.', href: 'articles/heavenly-blue-morning-glory-guide.html', category: 'plants', time: '18 min' },
    { title: 'Heirloom Quinoa (Chenopodium quinoa)', excerpt: 'Andean grain: saponin management, altitude adaptation, direct-seeding, harvest, and post-harvest threshing.', href: 'articles/heirloom-quinoa-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Heirloom Sugarcane (Saccharum officinarum)', excerpt: 'Heritage varieties: sucrose biology, bud propagation, tropical requirements, and juice extraction.', href: 'articles/heirloom-sugarcane-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'High-CBD Hemp (Cannabis sativa)', excerpt: 'CBD-dominant chemotype cultivation, cannabinoid biosynthesis, compliance monitoring, and therapeutic research.', href: 'articles/high-cbd-hemp-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'High-THC Cannabis Research Overview', excerpt: 'Evidence-based THC-dominant chemotype research, entourage effect science, and safety considerations.', href: 'articles/high-thc-cannabis-research-guide.html', category: 'plants', time: '20 min' },
    { title: 'Holy Basil / Tulsi (Ocimum tenuiflorum)', excerpt: 'Adaptogenic herb: eugenol chemistry, seed propagation, tropical requirements, and Ayurvedic applications.', href: 'articles/holy-basil-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Industrial Hemp (Cannabis sativa)', excerpt: 'Fiber and seed hemp: bast fiber biology, retting, hempcrete applications, and carbon-sequestering agriculture.', href: 'articles/industrial-hemp-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Jerusalem Artichoke (Helianthus tuberosus)', excerpt: 'Sunchoke tubers: inulin prebiotic chemistry, aggressive spreading management, and culinary preparation.', href: 'articles/jerusalem-artichoke-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Kanna (Sceletium tortuosum)', excerpt: 'South African succulent: mesembrine alkaloid chemistry, cultivation from seed, fermentation, and serotonergic research.', href: 'articles/kanna-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Kava (Piper methysticum)', excerpt: 'Kavalactone chemistry, tropical cultivation requirements, root harvest timing, and Pacific Island preparation.', href: 'articles/kava-cultivation-guide.html', category: 'plants', time: '22 min' },
    { title: 'Lavender (Lavandula angustifolia)', excerpt: 'Essential oil cultivation, linalool chemistry, propagation from cuttings, and distillation methods.', href: 'articles/lavender-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Lemon Balm (Melissa officinalis)', excerpt: 'Rosmarinic acid chemistry, container cultivation, division propagation, and calming tea preparation.', href: 'articles/lemon-balm-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Lemongrass (Cymbopogon citratus)', excerpt: 'Citral-rich essential oil grass, division propagation, tropical requirements, and culinary integration.', href: 'articles/lemongrass-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: "Lion's Mane Mushroom (Hericium erinaceus)", excerpt: 'Hericenone and erinacine chemistry, substrate preparation, fruiting conditions, and neuroprotective research.', href: 'articles/lions-mane-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Little Bluestem (Schizachyrium scoparium)', excerpt: 'Prairie bunch grass: drought adaptation, seed establishment, ornamental value, and native grassland restoration.', href: 'articles/little-bluestem-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Maca (Lepidium meyenii)', excerpt: 'High-altitude Andean root: glucosinolate chemistry, cold-climate adaptation, and endocrine research.', href: 'articles/maca-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Milk Thistle (Silybum marianum)', excerpt: 'Silymarin chemistry, direct-seeding, biennial growth, and hepatoprotective research.', href: 'articles/milk-thistle-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Moringa (Moringa oleifera)', excerpt: 'Drumstick tree: exceptional nutrient density, tropical cultivation, propagation from seed and cuttings.', href: 'articles/moringa-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Muira Puama (Ptychopetalum olacoides)', excerpt: 'Amazonian tonic tree: terpenoid chemistry, tropical requirements, and traditional use research.', href: 'articles/muira-puama-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Mullein (Verbascum thapsus)', excerpt: 'Saponin chemistry, biennial growth cycle, propagation, and respiratory health ethnobotanical traditions.', href: 'articles/mullein-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Nemaguard Peach Rootstock', excerpt: 'Nematode-resistant rootstock: compatibility, grafting timing, nursery production, and orchard protocols.', href: 'articles/nemaguard-peach-rootstock-guide.html', category: 'plants', time: '18 min' },
    { title: 'Nettle (Urtica dioica)', excerpt: 'Stinging nettle cultivation, mineral-rich nutrition, foraging safety, and traditional fiber use.', href: 'articles/nettle-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Nicotiana Rustica (Mapacho)', excerpt: 'High-nicotine tobacco: alkaloid chemistry, seed propagation, and traditional ceremonial context.', href: 'articles/nicotiana-rustica-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Passionflower (Passiflora incarnata)', excerpt: 'Maypop vine: chrysin and flavonoid chemistry, trellis cultivation, fruit production, and anxiolytic research.', href: 'articles/passionflower-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Pomegranate (Punica granatum)', excerpt: 'Punicalagin chemistry, propagation, growing parameters, harvest optimization, and home-scale extraction.', href: 'articles/pomegranate-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Prickly Pear Cactus (Opuntia)', excerpt: 'Pad and fruit production, betalain chemistry, cold-hardy varieties, and culinary preparation of nopal and tuna.', href: 'articles/prickly-pear-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Purple Sweet Potato (Ipomoea batatas)', excerpt: 'Stokes Purple and Okinawan varieties: anthocyanin chemistry, slip propagation, and culinary integration.', href: 'articles/purple-sweet-potato-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Redbor Kale (Brassica oleracea)', excerpt: 'Purple ornamental kale: anthocyanin profiles, cold-season growing, propagation, and nutritional density.', href: 'articles/redbor-kale-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Red Spanish Pineapple (Ananas comosus)', excerpt: 'Heritage pineapple: bromelain chemistry, crown propagation, tropical requirements, and harvest indicators.', href: 'articles/red-spanish-pineapple-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Reishi Mushroom (Ganoderma lucidum)', excerpt: 'Ganoderic acid chemistry, log and bag cultivation, fruiting conditions, and immunomodulatory research.', href: 'articles/reishi-mushroom-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Rhodiola (Rhodiola rosea)', excerpt: 'Arctic adaptogen: rosavin and salidroside chemistry, cold-climate cultivation, and stress-response research.', href: 'articles/rhodiola-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Roselle Hibiscus (Hibiscus sabdariffa)', excerpt: 'Calyx production: anthocyanin chemistry, tropical growing, harvest timing, and traditional beverages.', href: 'articles/roselle-hibiscus-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Russian Comfrey (Symphytum x uplandicum)', excerpt: 'Bocking 14: allantoin chemistry, deep taproot nutrient mining, biomass production, and permaculture integration.', href: 'articles/russian-comfrey-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'San Pedro Cactus (Echinopsis pachanoi)', excerpt: 'Mescaline-bearing cactus: alkaloid chemistry, international research landscape, and traditional ceremonial context.', href: 'articles/san-pedro-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'San Saba Pecan (Carya illinoinensis)', excerpt: 'Heritage pecan: rootstock selection, soil management, nut quality optimization, and post-harvest processing.', href: 'articles/san-saba-pecan-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Santa Rosa Plum (Prunus salicina)', excerpt: 'Luther Burbank plum: chill hour requirements, rootstock selection, pruning, and stone fruit handling.', href: 'articles/santa-rosa-plum-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Saw Palmetto (Serenoa repens)', excerpt: 'Fatty acid chemistry, propagation from seed, subtropical requirements, and prostate health research.', href: 'articles/saw-palmetto-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Shiitake Mushroom (Lentinula edodes)', excerpt: 'Lentinan polysaccharide chemistry, log inoculation, fruiting management, and culinary preparation.', href: 'articles/shiitake-mushroom-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Sideoats Grama (Bouteloua curtipendula)', excerpt: 'Texas state grass: drought resilience, rangeland restoration, seed establishment, and livestock forage.', href: 'articles/sideoats-grama-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Skullcap (Scutellaria lateriflora)', excerpt: 'Baicalin chemistry, woodland cultivation, division propagation, and anxiolytic research.', href: 'articles/skullcap-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Stevia (Stevia rebaudiana)', excerpt: 'Stevioside chemistry, propagation from cuttings, container cultivation, and natural sweetener processing.', href: 'articles/stevia-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: "St. John's Wort (Hypericum perforatum)", excerpt: 'Hypericin chemistry, direct-seeding, sun requirements, and antidepressant research overview.', href: 'articles/st-johns-wort-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Subterranean Clover (Trifolium subterraneum)', excerpt: 'Self-burying legume: nitrogen fixation, Mediterranean adaptation, and regenerative agriculture applications.', href: 'articles/subterranean-clover-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Switchgrass (Panicum virgatum)', excerpt: 'Native warm-season grass: biomass yield, prairie restoration, bioenergy research, and seed establishment.', href: 'articles/switchgrass-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Texas Persimmon (Diospyros texana)', excerpt: 'Native ebony-family fruit tree: soil adaptation, propagation, harvest timing, and culinary use.', href: 'articles/texas-persimmon-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Thai Mint (Mentha cordifolia)', excerpt: 'Southeast Asian culinary mint: essential oil chemistry, propagation, containment, and Thai cuisine integration.', href: 'articles/thai-mint-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Tongkat Ali (Eurycoma longifolia)', excerpt: 'Malaysian rainforest tree: eurycomanone chemistry, tropical cultivation, and testosterone research.', href: 'articles/tongkat-ali-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Tribulus (Tribulus terrestris)', excerpt: 'Protodioscin chemistry, arid-climate cultivation, seed propagation, and athletic performance research.', href: 'articles/tribulus-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Tropea Red Onion (Allium cepa)', excerpt: 'Italian heirloom onion: quercetin chemistry, long-day growing, and traditional Calabrian culinary methods.', href: 'articles/tropea-onion-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Turkey Tail Mushroom (Trametes versicolor)', excerpt: 'PSK and PSP polysaccharide chemistry, log cultivation, wild identification, and immunotherapy research.', href: 'articles/turkey-tail-mushroom-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Turmeric (Curcuma longa)', excerpt: 'Curcuminoid chemistry, rhizome propagation, tropical requirements, and bioavailability enhancement research.', href: 'articles/turmeric-cultivation-guide.html', category: 'plants', time: '20 min' },
    { title: 'Valerian (Valeriana officinalis)', excerpt: 'Valerenic acid chemistry, moist woodland cultivation, root harvest timing, and sleep research.', href: 'articles/valerian-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Vetiver (Chrysopogon zizanioides)', excerpt: 'Deep-rooted grass: vetiverol chemistry, erosion control, propagation from slips, and essential oil distillation.', href: 'articles/vetiver-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Yarrow (Achillea millefolium)', excerpt: 'Chamazulene chemistry, drought-tolerant cultivation, seed propagation, and wound-healing ethnobotany.', href: 'articles/yarrow-cultivation-guide.html', category: 'plants', time: '18 min' },
    { title: 'Yaupon Holly (Ilex vomitoria)', excerpt: 'North America\'s only native caffeinated plant: theobromine chemistry, propagation, and traditional preparation.', href: 'articles/yaupon-holly-cultivation-guide.html', category: 'plants', time: '20 min' },

    // ── GARDEN DESIGN ────────────────────────────────────
    { title: 'Gardening in the Ground', excerpt: 'Traditional in-ground gardening methods, soil preparation, bed layout, and crop rotation strategies for productive gardens.', href: 'articles/gardening-in-the-ground.html', category: 'garden-design', time: '15 min' },
    { title: 'Raised Bed Gardening', excerpt: 'Design, construction, and soil-mix formulation for raised bed systems, including material selection and drainage planning.', href: 'articles/raised-bed-gardening.html', category: 'garden-design', time: '15 min' },
    { title: 'Greenhouse Gardening', excerpt: 'Greenhouse structure selection, climate control, ventilation, heating, and season-extension strategies for year-round production.', href: 'articles/greenhouse-gardening.html', category: 'garden-design', time: '18 min' },
    { title: 'Terracing Outdoor Hills', excerpt: 'Hillside terrace construction, retaining wall design, erosion control, and water management for sloped garden sites.', href: 'articles/terracing-outdoor-hills.html', category: 'garden-design', time: '15 min' },
    { title: 'Container Gardening', excerpt: 'Pot selection, potting media, watering schedules, and plant-specific container strategies for patios, balconies, and small spaces.', href: 'articles/container-gardening.html', category: 'garden-design', time: '15 min' },
    { title: 'Indoor Gardening', excerpt: 'Grow-light selection, humidity control, soil-vs-hydroponic methods, and plant recommendations for indoor cultivation.', href: 'articles/indoor-gardening.html', category: 'garden-design', time: '15 min' },

    // ── COMPOUNDS (compound guides & nootropics) ─────────
    { title: 'Adaptogens Compounds Overview', excerpt: 'Comprehensive overview of adaptogenic compounds, their mechanisms of action, and evidence-based applications for stress modulation.', href: 'articles/adaptogens-compounds-guide.html', category: 'compounds', time: '20 min' },
    { title: 'Amino Acids: Essential Guide', excerpt: 'Essential and non-essential amino acids, branched-chain amino acids, and their roles in neurotransmitter synthesis and muscle biology.', href: 'articles/amino-acids-essential-guide.html', category: 'compounds', time: '18 min' },
    { title: 'Aporphine Alkaloids', excerpt: 'Chemistry, biosynthesis, and pharmacology of aporphine alkaloids found in blue lotus and related plants.', href: 'articles/aporphine-alkaloids-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Bacopasides (Bacopa monnieri)', excerpt: 'Bacopaside chemistry, cognitive enhancement mechanisms, bioavailability, and evidence-based dosing research.', href: 'articles/bacopasides-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Beta-Glucans', excerpt: 'Fungal and plant beta-glucan structures, immunomodulatory mechanisms, and evidence from mushroom-derived compounds.', href: 'articles/beta-glucans-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Curcuminoids (Turmeric)', excerpt: 'Curcumin, demethoxycurcumin, and bisdemethoxycurcumin chemistry, bioavailability enhancement, and anti-inflammatory research.', href: 'articles/curcuminoids-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Ginsenosides (Panax ginseng)', excerpt: 'Dammarane-type saponin chemistry, Rg1/Rb1 pharmacology, adaptogenic mechanisms, and cognitive research.', href: 'articles/ginsenosides-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Kavalactones', excerpt: 'Six major kavalactone chemistry, GABA-ergic mechanisms, chemotype variation, and anxiolytic research.', href: 'articles/kavalactones-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: "Lion's Mane Hericenones & Erinacines", excerpt: 'Nerve growth factor-stimulating compounds from Hericium erinaceus: chemistry, mechanisms, and neuroprotective research.', href: 'articles/lions-mane-hericenones-guide.html', category: 'compounds', time: '15 min' },
    { title: 'L-Theanine', excerpt: 'Green tea amino acid: glutamate analog chemistry, alpha-wave enhancement, synergy with caffeine, and cognitive research.', href: 'articles/l-theanine-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Mesembrenone (Kanna)', excerpt: 'Serotonin reuptake inhibition, structural chemistry, fermentation-dependent concentrations, and mood modulation research.', href: 'articles/mesembrenone-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Mesembrine (Kanna)', excerpt: 'Primary Sceletium alkaloid: SRI activity, structural chemistry, dose-response profiles, and anxiolytic research.', href: 'articles/mesembrine-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Nootropics Overview', excerpt: 'Comprehensive guide to natural nootropic compounds, cognitive enhancement mechanisms, and evidence-based stacking strategies.', href: 'articles/nootropics-overview-guide.html', category: 'compounds', time: '20 min' },
    { title: 'Nuciferine (Blue Lotus)', excerpt: 'Dopamine receptor modulation, aporphine alkaloid chemistry, pharmacokinetics, and blue lotus bioactivity research.', href: 'articles/nuciferine-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Peptides: Bioactive Guide', excerpt: 'Bioactive peptides from plant and fungal sources: antimicrobial, antioxidant, and immunomodulatory mechanisms.', href: 'articles/peptides-bioactive-guide.html', category: 'compounds', time: '18 min' },
    { title: 'Psilocybin', excerpt: 'Tryptamine chemistry, serotonin receptor pharmacology, clinical trial findings, and regulatory landscape overview.', href: 'articles/psilocybin-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Rosmarinic Acid', excerpt: 'Polyphenol chemistry found in mint family plants: antioxidant mechanisms, bioavailability, and neuroprotective research.', href: 'articles/rosmarinic-acid-compound-guide.html', category: 'compounds', time: '15 min' },
    { title: 'Withanolides (Ashwagandha)', excerpt: 'Steroidal lactone chemistry, withaferin A pharmacology, adaptogenic mechanisms, and cortisol modulation research.', href: 'articles/withanolides-compound-guide.html', category: 'compounds', time: '15 min' },

    // ── EXTRACTION ───────────────────────────────────────
    { title: 'Extraction Methods Overview', excerpt: 'Comprehensive comparison of all major extraction techniques: CO2, ethanol, water, steam distillation, and more.', href: 'articles/extraction-methods.html', category: 'extraction', time: '15 min' },
    { title: 'CO2 Supercritical Extraction', excerpt: 'Supercritical carbon dioxide extraction: pressure-temperature parameters, equipment design, and selective compound isolation.', href: 'articles/extraction-co2-supercritical.html', category: 'extraction', time: '15 min' },
    { title: 'Cold Press Extraction', excerpt: 'Mechanical cold-press methods for oils and juices: equipment, yield optimization, and compound preservation.', href: 'articles/extraction-cold-press.html', category: 'extraction', time: '12 min' },
    { title: 'Enzymatic Extraction', excerpt: 'Enzyme-assisted extraction: cellulase and pectinase applications, temperature control, and bioactive compound recovery.', href: 'articles/extraction-enzymatic.html', category: 'extraction', time: '12 min' },
    { title: 'Ethanol Extraction', excerpt: 'Ethanol-based extraction: polarity considerations, solvent ratios, winterization, and safety protocols.', href: 'articles/extraction-ethanol.html', category: 'extraction', time: '15 min' },
    { title: 'Microwave-Assisted Extraction', excerpt: 'Microwave extraction methods: rapid heating mechanisms, solvent selection, and compound yield comparisons.', href: 'articles/extraction-microwave.html', category: 'extraction', time: '12 min' },
    { title: 'Pressurized Hot Water Extraction', excerpt: 'Subcritical water extraction: temperature-pressure profiles, polarity tuning, and green chemistry applications.', href: 'articles/extraction-pressurized-hot-water.html', category: 'extraction', time: '12 min' },
    { title: 'Steam Distillation', excerpt: 'Essential oil distillation: apparatus design, temperature control, hydrosol collection, and yield factors.', href: 'articles/extraction-steam-distillation.html', category: 'extraction', time: '12 min' },
    { title: 'Ultrasonic Extraction', excerpt: 'Ultrasound-assisted extraction: cavitation mechanisms, frequency parameters, and enhanced compound recovery.', href: 'articles/extraction-ultrasonic.html', category: 'extraction', time: '12 min' },
    { title: 'Water Extraction', excerpt: 'Traditional water-based extraction: decoctions, infusions, temperature gradients, and polysaccharide recovery.', href: 'articles/extraction-water.html', category: 'extraction', time: '12 min' },

    // ── STUDIES ───────────────────────────────────────────
    { title: 'Studies & Research Index', excerpt: 'Central index of published research, clinical trials, and peer-reviewed studies related to our botanical catalog.', href: 'articles/studies-index.html', category: 'studies', time: '10 min' },

    // ── SCIENCE ──────────────────────────────────────────
    { title: 'How Adaptogens Work: The Science of Stress Response', excerpt: 'Understanding how adaptogenic botanicals help the body maintain homeostasis through HPA axis modulation and stress pathways.', href: 'articles/adaptogens-science.html', category: 'science', time: '12 min' },
    { title: 'Apomorphine and Nuciferine: Active Compounds in Blue Lotus', excerpt: 'Understanding the alkaloids responsible for blue lotus\'s unique properties, receptor binding, and pharmacology.', href: 'articles/blue-lotus-compounds.html', category: 'science', time: '8 min' },
    { title: 'Kavalactones Explained: The Science Behind Kava\'s Calm', excerpt: 'How the six major kavalactones work together to create kava\'s unique relaxation effects via GABA modulation.', href: 'articles/kavalactones-explained.html', category: 'science', time: '10 min' },
    { title: 'Pomegranate: A Complete Botanical Monograph', excerpt: 'Comprehensive monograph covering botanical identity, phytochemistry, cultivation, and agricultural integration.', href: 'articles/pomegranate-monograph.html', category: 'science', time: '25 min' },
    { title: 'Responsible Dosing: Start Low, Go Slow', excerpt: 'Best practices for trying any new botanical product safely and effectively, including titration protocols.', href: 'articles/responsible-dosing.html', category: 'science', time: '7 min' },
    { title: 'How to Read a Certificate of Analysis (COA)', excerpt: 'Understanding lab test results and what to look for in quality botanical products and third-party testing.', href: 'articles/how-to-read-coa.html', category: 'science', time: '5 min' },
    { title: 'Blue Lotus in Ancient Egypt: Sacred Flower of the Nile', excerpt: 'Historical and spiritual significance of Nymphaea caerulea in Egyptian culture, art, and ritual practice.', href: 'articles/blue-lotus-ancient-egypt.html', category: 'science', time: '9 min' },
    { title: 'Traditional Kava Preparation: Pacific Island to Cup', excerpt: 'Ancient art of kava preparation and how modern extraction methods compare to traditional Pacific methods.', href: 'articles/traditional-kava-preparation.html', category: 'science', time: '7 min' }
];

/* ──────────────────────────────────────────────────────────
   CATEGORY DISPLAY NAMES
   ────────────────────────────────────────────────────────── */
var CATEGORY_LABELS = {
    'plants': 'Plants',
    'garden-design': 'Garden Design',
    'compounds': 'Compounds',
    'extraction': 'Extraction',
    'studies': 'Studies',
    'science': 'Science'
};

/* ──────────────────────────────────────────────────────────
   PAGINATION
   ────────────────────────────────────────────────────────── */
var ARTICLES_PER_PAGE = 24;
var currentPage = 1;
var currentCategory = 'all';
var currentSearch = '';

/* ──────────────────────────────────────────────────────────
   INITIALIZATION
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    renderArticles();
    initBlogCategories();
    initBlogSearch();
    initBlogNewsletter();
    initLoadMore();

    // Handle URL params on load
    var urlParams = new URLSearchParams(window.location.search);
    var categoryParam = urlParams.get('category');
    if (categoryParam) {
        var targetTab = document.querySelector('.category-tab[data-category="' + categoryParam + '"]');
        if (targetTab) {
            targetTab.click();
        }
    }
});

/* ──────────────────────────────────────────────────────────
   RENDER ARTICLES INTO GRID
   ────────────────────────────────────────────────────────── */
function getFilteredArticles() {
    var filtered = ARTICLES;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(function(a) { return a.category === currentCategory; });
    }
    if (currentSearch) {
        var q = currentSearch.toLowerCase();
        filtered = filtered.filter(function(a) {
            return a.title.toLowerCase().indexOf(q) !== -1 ||
                   a.excerpt.toLowerCase().indexOf(q) !== -1 ||
                   (CATEGORY_LABELS[a.category] || '').toLowerCase().indexOf(q) !== -1;
        });
    }
    return filtered;
}

function renderArticles() {
    var grid = document.getElementById('blogGrid');
    if (!grid) return;

    var filtered = getFilteredArticles();
    var shown = filtered.slice(0, currentPage * ARTICLES_PER_PAGE);

    // Build HTML
    var html = '';
    shown.forEach(function(article, idx) {
        var catLabel = CATEGORY_LABELS[article.category] || article.category;
        html += '<article class="blog-card" data-category="' + article.category + '">' +
            '<div class="blog-card-image">' +
                '<div class="card-illustration">' +
                    getCategoryIcon(article.category) +
                '</div>' +
            '</div>' +
            '<div class="blog-card-content">' +
                '<div class="article-meta">' +
                    '<span class="article-category">' + catLabel + '</span>' +
                    '<span class="article-read-time">' + article.time + '</span>' +
                '</div>' +
                '<h3 class="blog-card-title">' + article.title + '</h3>' +
                '<p class="blog-card-excerpt">' + article.excerpt + '</p>' +
                '<a href="' + article.href + '" class="blog-card-link">Read More &rarr;</a>' +
            '</div>' +
        '</article>';
    });

    grid.innerHTML = html;

    // Update article count
    var countEl = document.getElementById('articleCount');
    if (countEl) {
        if (currentSearch || currentCategory !== 'all') {
            countEl.textContent = 'Showing ' + shown.length + ' of ' + filtered.length + ' articles';
        } else {
            countEl.textContent = 'Showing ' + shown.length + ' of ' + filtered.length + ' articles';
        }
    }

    // Update load-more button
    var loadMoreWrap = document.getElementById('loadMoreWrap');
    if (loadMoreWrap) {
        loadMoreWrap.style.display = (shown.length < filtered.length) ? '' : 'none';
    }

    // Update featured card visibility
    var featuredCard = document.querySelector('.featured-card');
    if (featuredCard) {
        var featuredCategory = featuredCard.dataset.category;
        var showFeatured = (currentCategory === 'all' || featuredCategory === currentCategory) && !currentSearch;
        featuredCard.closest('.featured-article').style.display = showFeatured ? '' : 'none';
    }

    // Animate cards in
    requestAnimationFrame(function() {
        var cards = grid.querySelectorAll('.blog-card');
        cards.forEach(function(card, i) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition = 'opacity 0.4s ease ' + (i * 0.03) + 's, transform 0.4s ease ' + (i * 0.03) + 's';
            requestAnimationFrame(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
    });

    // No results message
    updateNoResultsMessage(shown.length, currentSearch || (currentCategory !== 'all' ? currentCategory : ''));
}

/* ──────────────────────────────────────────────────────────
   CATEGORY ICONS (SVG per category)
   ────────────────────────────────────────────────────────── */
function getCategoryIcon(category) {
    var icons = {
        'plants': '<svg viewBox="0 0 200 150" fill="var(--color-primary)" opacity="0.5"><path d="M100 130 L100 70" stroke="var(--color-primary)" stroke-width="3" fill="none"/><path d="M100 70 C70 50 60 30 80 20 C90 30 95 50 100 70Z"/><path d="M100 70 C130 50 140 30 120 20 C110 30 105 50 100 70Z"/><path d="M100 90 C75 75 65 60 80 50 C88 58 95 72 100 90Z" opacity="0.7"/><path d="M100 90 C125 75 135 60 120 50 C112 58 105 72 100 90Z" opacity="0.7"/></svg>',
        'garden-design': '<svg viewBox="0 0 200 150" fill="var(--color-primary)" opacity="0.5"><rect x="30" y="80" width="140" height="40" rx="3" fill="none" stroke="var(--color-primary)" stroke-width="2"/><rect x="40" y="60" width="120" height="25" rx="3" fill="none" stroke="var(--color-primary)" stroke-width="2" opacity="0.6"/><path d="M70 60 L70 40 C70 35 80 25 85 30 L85 60" fill="var(--color-primary)" opacity="0.4"/><path d="M115 60 L115 35 C115 28 125 22 128 28 L128 60" fill="var(--color-primary)" opacity="0.4"/><line x1="30" y1="130" x2="170" y2="130" stroke="var(--color-primary)" stroke-width="2" opacity="0.3"/></svg>',
        'compounds': '<svg viewBox="0 0 200 150" fill="var(--color-accent)" opacity="0.5"><circle cx="70" cy="75" r="15"/><circle cx="130" cy="75" r="15"/><circle cx="100" cy="45" r="15"/><circle cx="100" cy="105" r="15"/><line x1="70" y1="75" x2="100" y2="45" stroke="var(--color-accent)" stroke-width="3"/><line x1="130" y1="75" x2="100" y2="45" stroke="var(--color-accent)" stroke-width="3"/><line x1="70" y1="75" x2="100" y2="105" stroke="var(--color-accent)" stroke-width="3"/><line x1="130" y1="75" x2="100" y2="105" stroke="var(--color-accent)" stroke-width="3"/></svg>',
        'extraction': '<svg viewBox="0 0 200 150" fill="var(--color-primary)" opacity="0.5"><path d="M80 30 L80 70 L60 120 L140 120 L120 70 L120 30 Z"/><ellipse cx="100" cy="30" rx="20" ry="5"/><circle cx="90" cy="100" r="5"/><circle cx="110" cy="90" r="3"/><circle cx="100" cy="105" r="4"/></svg>',
        'studies': '<svg viewBox="0 0 200 150" fill="var(--color-primary)" opacity="0.5"><rect x="60" y="30" width="80" height="100" rx="5"/><line x1="75" y1="50" x2="125" y2="50" stroke="var(--color-bg)" stroke-width="3"/><line x1="75" y1="70" x2="125" y2="70" stroke="var(--color-bg)" stroke-width="3"/><line x1="75" y1="90" x2="110" y2="90" stroke="var(--color-bg)" stroke-width="3"/></svg>',
        'science': '<svg viewBox="0 0 200 150" fill="var(--color-primary)" opacity="0.5"><path d="M80 30 L80 70 L60 120 L140 120 L120 70 L120 30 Z" fill="none" stroke="var(--color-primary)" stroke-width="2"/><ellipse cx="100" cy="30" rx="20" ry="5" fill="none" stroke="var(--color-primary)" stroke-width="2"/><circle cx="90" cy="100" r="5"/><circle cx="110" cy="90" r="4"/><circle cx="100" cy="108" r="3"/></svg>'
    };
    return icons[category] || icons['plants'];
}

/* ──────────────────────────────────────────────────────────
   CATEGORY TAB FILTERING
   ────────────────────────────────────────────────────────── */
function initBlogCategories() {
    var categoryTabs = document.querySelectorAll('.category-tab');
    if (!categoryTabs.length) return;

    categoryTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            currentCategory = tab.dataset.category;
            currentPage = 1;

            // Update active state
            categoryTabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');

            // Clear search
            var searchInput = document.getElementById('blogSearch');
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
            }

            // Re-render
            renderArticles();

            // Update URL
            updateURL(currentCategory);
        });
    });
}

/* ──────────────────────────────────────────────────────────
   SEARCH
   ────────────────────────────────────────────────────────── */
function initBlogSearch() {
    var searchInput = document.getElementById('blogSearch');
    if (!searchInput) return;

    var searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            currentSearch = e.target.value.trim();
            currentPage = 1;
            renderArticles();
        }, 300);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            currentSearch = '';
            currentPage = 1;
            renderArticles();
        }
    });
}

/* ──────────────────────────────────────────────────────────
   LOAD MORE
   ────────────────────────────────────────────────────────── */
function initLoadMore() {
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        renderArticles();

        // Scroll to the first new card
        var grid = document.getElementById('blogGrid');
        if (grid) {
            var cards = grid.querySelectorAll('.blog-card');
            var firstNew = cards[(currentPage - 1) * ARTICLES_PER_PAGE];
            if (firstNew) {
                setTimeout(function() {
                    firstNew.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    });
}

/* ──────────────────────────────────────────────────────────
   URL MANAGEMENT
   ────────────────────────────────────────────────────────── */
function updateURL(category) {
    var url = new URL(window.location);
    if (category === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', category);
    }
    history.pushState({}, '', url);
}

/* ──────────────────────────────────────────────────────────
   NO RESULTS MESSAGE
   ────────────────────────────────────────────────────────── */
function updateNoResultsMessage(visibleCount, query) {
    var noResults = document.getElementById('noResultsMessage');

    if (visibleCount === 0 && query) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noResultsMessage';
            noResults.className = 'no-results-message';
            noResults.innerHTML = '<div class="no-results-content">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
                '<h3>No articles found</h3>' +
                '<p>Try adjusting your search or browse by category</p>' +
                '</div>';
            noResults.style.cssText = 'text-align:center;padding:3rem 1rem;color:var(--color-text-muted);';

            var grid = document.getElementById('blogGrid');
            if (grid) {
                grid.parentNode.insertBefore(noResults, grid.nextSibling);
            }
        }
        noResults.style.display = 'block';
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

/* ──────────────────────────────────────────────────────────
   NEWSLETTER
   ────────────────────────────────────────────────────────── */
function initBlogNewsletter() {
    var form = document.getElementById('blogNewsletterForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var emailInput = form.querySelector('input[type="email"]');
        var button = form.querySelector('button');
        var originalText = button.innerHTML;
        var email = emailInput.value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.style.borderColor = '#ef4444';
            return;
        }

        button.innerHTML = '<span>Subscribing...</span>';
        button.disabled = true;

        setTimeout(function() {
            button.innerHTML = '<span>Subscribed!</span>';
            form.reset();
            setTimeout(function() {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);
        }, 1500);
    });
}
