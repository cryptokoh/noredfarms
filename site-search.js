/* ============================================
   Nored Farms - Global Site Search
   Inline nav search bar + dropdown + overlay fallback
   ============================================ */

(function() {
    'use strict';

    // Detect if we're in a subdirectory
    var path = window.location.pathname;
    var prefix = '';
    if (path.indexOf('/articles/') !== -1 || path.indexOf('/products/') !== -1 || path.indexOf('/classroom/') !== -1) {
        prefix = '../';
    }

    // Search index with keywords for richer matching
    var PAGES = [
        { title: "Ancient Ruins Garden Lab", url: "ancient-lab.html", desc: "Explore the Ancient Ruins Garden Lab - an immersive educational experience where ancient botanical w", cat: "Pages", kw: ["ancient", "botanical", "educational", "experience", "explore", "extraction"] },
        { title: "Botanical Education Classes", url: "classes.html", desc: "Botanical education from home growing to industrial operations. 4 tiers: $100 home systems, $500 adv", cat: "Pages", kw: ["000", "100", "500", "access", "advanced", "botanical"] },
        { title: "Botanical Infrastructure Consulting", url: "consulting.html", desc: "Professional botanical infrastructure design and build services. Greenhouses, irrigation systems, sh", cat: "Pages", kw: ["botanical", "build", "consulting", "container", "design", "experience"] },
        { title: "Contact Us", url: "contact.html", desc: "Get in touch with Nored Farms. Questions about botanicals, wholesale inquiries, or general supp", cat: "Pages", kw: ["botanicals", "contact", "general", "get", "inquiries", "questions"] },
        { title: "Education & Research", url: "blog.html", desc: "Learn about kratom, kava, blue lotus, and botanical wellness. Science-backed articles, dosage guides", cat: "Pages", kw: ["articles", "backed", "blog", "blue", "botanical", "dosage"] },
        { title: "Premium Kratom, Kava & Botanical Extracts", url: "index.html", desc: "Lab-tested kratom, kava, blue lotus & ethnobotanical extracts crafted in Texas Hill Country. 15+ yea", cat: "Pages", kw: ["500", "blue", "botanical", "compliant", "country", "crafted"] },
        { title: "Project Details", url: "roadmap.html", desc: "Development progress, milestones, and roadmap for Nored Farms website.", cat: "Pages", kw: ["details", "development", "milestones", "progress", "project", "roadmap"] },
        { title: "Nored Farms | Laboratory", url: "lab-2d.html", desc: "Nored Farms | Laboratory", cat: "Pages", kw: ["lab", "laboratory"] },
        { title: "Nored Farms | Laboratory-Grade Botanical Science", url: "lab.html", desc: "Experience botanical science in our virtual laboratory. Premium kratom, kava, and blue lotus extract", cat: "Pages", kw: ["blue", "botanical", "crafted", "experience", "kava", "kratom"] },
        { title: "Research Library", url: "research.html", desc: "Comprehensive research library covering botanical infrastructure, growing techniques, extraction met", cat: "Pages", kw: ["body", "botanical", "comprehensive", "covering", "effects", "extraction"] },
        { title: "The Classroom - Learn About Kratom, Kava & Botanical Science", url: "classroom.html", desc: "Free educational portal on kratom alkaloids, kava kavalactones, blue lotus compounds & extraction me", cat: "Pages", kw: ["alkaloids", "blue", "botanical", "classroom", "compounds", "dosing"] },
        { title: "Welcome to the Community", url: "welcome.html", desc: "Welcome to Nored Farms. Explore our educational resources and learn about botanical wellness.", cat: "Pages", kw: ["botanical", "community", "educational", "explore", "learn", "our"] },
        { title: "Botanical Gummies", url: "products/gummies.html", desc: "Premium botanical gummies crafted with lab-tested kratom, kava, and ethnobotanical extracts. Coming ", cat: "Products", kw: ["botanical", "coming", "crafted", "ethnobotanical", "gummies", "kava"] },
        { title: "Botanical Tinctures", url: "products/tinctures.html", desc: "Premium botanical tinctures with precise alkaloid profiles. Lab-tested kratom, kava, and ethnobotani", cat: "Products", kw: ["alkaloid", "botanical", "coming", "ethnobotanical", "kava", "kratom"] },
        { title: "Live Botanical Plants", url: "products/live-plants.html", desc: "Live kratom, kava, and ethnobotanical plants grown in Texas Hill Country. Healthy rooted specimens f", cat: "Products", kw: ["botanical", "coming", "country", "ethnobotanical", "grown", "healthy"] },
        { title: "Pure Botanical Extracts", url: "products/extracts.html", desc: "Concentrated botanical extracts crafted from 30+ years of extraction research. Lab-tested kratom, ka", cat: "Products", kw: ["blue", "botanical", "concentrated", "crafted", "ethnobotanical", "extraction"] },
        { title: "Building Infrastructure & Equipment - The Classroom", url: "classroom/infrastructure.html", desc: "Learn to build growing infrastructure from outdoor rows and irrigation to greenhouses, aquaponics, a", cat: "Classroom", kw: ["aeroponics", "aquaponics", "build", "building", "classroom", "cloning"] },
        { title: "Effects on the Human Body - Botanical Science", url: "classroom/effects.html", desc: "Learn how botanical compounds interact with the human body. Explore neurotransmitter pathways, organ", cat: "Classroom", kw: ["body", "botanical", "chronic", "compounds", "conditions", "effects"] },
        { title: "Extracting Plants & Making Products | The Classroom", url: "classroom/extraction.html", desc: "Comprehensive guide to botanical extraction methods: solventless, water-based, ethanol, CO2, chromat", cat: "Classroom", kw: ["based", "behind", "botanical", "chromatography", "classroom", "co2"] },
        { title: "Growing & Harvesting Plants - The Botanical Classroom", url: "classroom/growing.html", desc: "Explore every plant type from seed to harvest. Learn about trees, bushes, herbs, grasses, moss, and ", cat: "Classroom", kw: ["botanical", "bushes", "classroom", "content", "educational", "explore"] },
        { title: "Apomorphine and Nuciferine: The Active Compounds in Blue Lotus", url: "articles/blue-lotus-compounds.html", desc: "Understanding the alkaloids responsible for blue lotus", cat: "Blue Lotus", kw: ["active", "alkaloids", "apomorphine", "blue", "compounds", "lotus"] },
        { title: "Blue Lotus in Ancient Egypt: Sacred Flower of the Nile", url: "articles/blue-lotus-ancient-egypt.html", desc: "Exploring the historical and spiritual significance of Nymphaea caerulea in Egyptian culture. The sa", cat: "Blue Lotus", kw: ["ancient", "blue", "caerulea", "culture", "egypt", "egyptian"] },
        { title: "Egyptian Blue Lotus (Nymphaea caerulea): Comprehensive Cultivation, Processing & Use Guide", url: "articles/egyptian-blue-lotus-cultivation-guide.html", desc: "Complete guide to Egyptian blue lotus cultivation covering Nymphaea caerulea growing parameters, aqu", cat: "Blue Lotus", kw: ["alkaloid", "aquatic", "blue", "caerulea", "chemistry", "comprehensive"] },
        { title: "High-CBD Hemp (Cannabis sativa L.): Comprehensive Cultivation, Research & Use Guide", url: "articles/high-cbd-hemp-cultivation-guide.html", desc: "Complete guide to high-CBD hemp cultivation covering Cannabis sativa CBD-dominant chemotypes, growin", cat: "Cannabis", kw: ["cannabis", "cbd", "chemotypes", "comprehensive", "considerations", "covering"] },
        { title: "High-THC Cannabis (Cannabis sativa): Research-Focused Overview, Uses & Safety Context", url: "articles/high-thc-cannabis-research-guide.html", desc: "Research-focused guide to high-THC cannabis covering chemical overview, global clinical research lan", cat: "Cannabis", kw: ["administration", "areas", "cannabis", "chemical", "clinical", "considerations"] },
        { title: "Industrial Hemp (Cannabis sativa L.): Comprehensive Cultivation, Processing & Physical-Use Guide", url: "articles/industrial-hemp-cultivation-guide.html", desc: "Complete guide to industrial hemp cultivation covering fiber and seed chemotypes, growing parameters", cat: "Cannabis", kw: ["biocomposites", "cannabis", "chemotypes", "circular", "comprehensive", "covering"] },
        { title: "Absinthe Wormwood (Artemisia absinthium): Comprehensive Cultivation, Processing & Use Guide", url: "articles/absinthe-wormwood-cultivation-guide.html", desc: "Complete guide to absinthe wormwood cultivation covering Artemisia absinthium, growing parameters, p", cat: "Guides", kw: ["absinthe", "absinthium", "aromatic", "artemisia", "comprehensive", "covering"] },
        { title: "Bacopa Monnieri (Water Hyssop, Brahmi): Comprehensive Cultivation, Processing & Use Guide", url: "articles/bacopa-monnieri-cultivation-guide.html", desc: "Complete guide to Bacopa monnieri cultivation covering aquatic growing systems, bacoside chemistry, ", cat: "Guides", kw: ["aquatic", "bacopa", "bacoside", "brahmi", "chemistry", "comprehensive"] },
        { title: "Blue Java Banana (Musa × paradisiaca): Comprehensive Cultivation, Processing & Use Guide", url: "articles/blue-java-banana-cultivation-guide.html", desc: "Complete guide to Blue Java banana cultivation covering cold-tolerant ABB-type dessert banana growin", cat: "Guides", kw: ["abb", "banana", "blue", "cold", "comprehensive", "covering"] },
        { title: "Dandelion (Taraxacum officinale): Full Guide to Cultivation, Uses, Nutrition & Research", url: "articles/dandelion-cultivation-guide.html", desc: "Complete guide to dandelion cultivation covering Taraxacum officinale botany, climate adaptation, so", cat: "Guides", kw: ["adaptation", "botany", "climate", "covering", "culinary", "current"] },
        { title: "Deep Purple Carrot (Daucus carota): Comprehensive Cultivation, Processing & Use Guide", url: "articles/deep-purple-carrot-cultivation-guide.html", desc: "Complete guide to deep purple carrot cultivation covering anthocyanin-rich landraces, growing parame", cat: "Guides", kw: ["anthocyanin", "carota", "carrot", "comprehensive", "covering", "daucus"] },
        { title: "Detroit Red Beet (Beta vulgaris): Comprehensive Cultivation, Processing & Use Guide", url: "articles/detroit-red-beet-cultivation-guide.html", desc: "Complete guide to Detroit Dark Red beet cultivation covering growing parameters, soil requirements, ", cat: "Guides", kw: ["beet", "beta", "betalain", "comprehensive", "covering", "dark"] },
        { title: "Dragon Fruit (Hylocereus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/dragon-fruit-cultivation-guide.html", desc: "Complete guide to dragon fruit cultivation covering Hylocereus and Selenicereus species, climate req", cat: "Guides", kw: ["betalain", "climate", "compounds", "comprehensive", "covering", "cuttings"] },
        { title: "Duckweed (Lemna, Wolffia, Spirodela): Comprehensive Cultivation, Processing & Use Guide", url: "articles/duckweed-cultivation-guide.html", desc: "Complete guide to duckweed cultivation covering Lemna, Wolffia, and Spirodela species, water chemist", cat: "Guides", kw: ["chemistry", "comprehensive", "content", "covering", "duckweed", "feed"] },
        { title: "Elderberry (Sambucus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/elderberry-cultivation-guide.html", desc: "Complete guide to elderberry cultivation covering Sambucus nigra and canadensis, growing parameters,", cat: "Guides", kw: ["anthocyanin", "canadensis", "comprehensive", "covering", "elderberry", "extraction"] },
        { title: "Ginger (Zingiber officinale): Comprehensive Cultivation, Processing & Use Guide", url: "articles/ginger-cultivation-guide.html", desc: "Complete guide to ginger cultivation covering Zingiber officinale growing parameters, rhizome propag", cat: "Guides", kw: ["comprehensive", "covering", "curing", "extraction", "ginger", "gingerol"] },
        { title: "Hawaiian Baby Woodrose (Argyreia nervosa): Comprehensive Cultivation, History & Use Guide", url: "articles/hawaiian-baby-woodrose-guide.html", desc: "Complete guide to Hawaiian baby woodrose covering Argyreia nervosa cultivation, tropical climate req", cat: "Guides", kw: ["alkaloid", "argyreia", "baby", "boundaries", "chemistry", "climate"] },
        { title: "Heavenly Blue Morning Glory (Ipomoea tricolor): Comprehensive Cultivation, Processing & Use Guide", url: "articles/heavenly-blue-morning-glory-guide.html", desc: "Complete guide to Heavenly Blue morning glory covering Ipomoea tricolor cultivation, climate adaptat", cat: "Guides", kw: ["adaptation", "alkaloid", "blue", "boundaries", "climate", "comprehensive"] },
        { title: "Heirloom Giant Sugarcane: Comprehensive Cultivation, Processing & Use Guide", url: "articles/heirloom-sugarcane-cultivation-guide.html", desc: "Complete guide to heirloom giant sugarcane cultivation covering Saccharum officinarum landraces, gro", cat: "Guides", kw: ["comprehensive", "covering", "extraction", "giant", "harvest", "heirloom"] },
        { title: "Heirloom Quinoa (Chenopodium quinoa): Comprehensive Cultivation, Processing & Use Guide", url: "articles/heirloom-quinoa-cultivation-guide.html", desc: "Complete guide to heirloom quinoa cultivation covering traditional landrace varieties, Andean growin", cat: "Guides", kw: ["andean", "chenopodium", "comprehensive", "covering", "culinary", "feed"] },
        { title: "Jerusalem Artichoke (Helianthus tuberosus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/jerusalem-artichoke-cultivation-guide.html", desc: "Complete guide to Jerusalem artichoke cultivation covering sunchoke growing parameters, tuber propag", cat: "Guides", kw: ["artichoke", "comprehensive", "content", "covering", "culinary", "harvest"] },
        { title: "Kanna (Sceletium tortuosum): Comprehensive Cultivation, Processing & Use Guide", url: "articles/kanna-cultivation-guide.html", desc: "Complete guide to kanna cultivation covering Sceletium tortuosum botany, mesembrine alkaloids, arid-", cat: "Guides", kw: ["alkaloids", "arid", "botany", "climate", "comprehensive", "context"] },
        { title: "Lion’s Mane Mushroom (Hericium erinaceus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/lions-mane-cultivation-guide.html", desc: "Complete guide to lion", cat: "Guides", kw: ["comprehensive", "erinaceus", "hericium", "lion", "lions", "mane"] },
        { title: "Little Bluestem (Schizachyrium scoparium): Comprehensive Cultivation, Forage & Regenerative Land-Use Guide", url: "articles/little-bluestem-cultivation-guide.html", desc: "Complete guide to little bluestem cultivation covering Schizachyrium scoparium ecology, prairie rest", cat: "Guides", kw: ["bluestem", "carbon", "comprehensive", "covering", "ecology", "fire"] },
        { title: "Moringa (Moringa oleifera): Comprehensive Cultivation, Processing & Use Guide", url: "articles/moringa-cultivation-guide.html", desc: "Complete guide to moringa cultivation covering Moringa oleifera growing parameters, propagation from", cat: "Guides", kw: ["comprehensive", "covering", "culinary", "cuttings", "drying", "extraction"] },
        { title: "Mullein (Verbascum thapsus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/mullein-cultivation-guide.html", desc: "Complete guide to mullein cultivation covering Verbascum thapsus botany, climate adaptation, soil pr", cat: "Guides", kw: ["adaptation", "botany", "climate", "comprehensive", "context", "covering"] },
        { title: "Nemaguard Peach Rootstock (Prunus persica): Comprehensive Cultivation, Sap Harvest & Rootstock Guide", url: "articles/nemaguard-peach-rootstock-guide.html", desc: "Complete guide to Nemaguard peach rootstock covering Prunus persica seedling selection, nematode res", cat: "Guides", kw: ["compatibility", "comprehensive", "covering", "dynamics", "flow", "grafting"] },
        { title: "Passionflower & Passionfruit (Passiflora): Comprehensive Cultivation, Processing & Use Guide", url: "articles/passionflower-cultivation-guide.html", desc: "Complete guide to passionflower and passionfruit cultivation covering Passiflora edulis and incarnat", cat: "Guides", kw: ["comprehensive", "covering", "edulis", "extraction", "harvest", "incarnata"] },
        { title: "Pomegranate: Advanced Cultivation, Processing & Use Guide", url: "articles/pomegranate-cultivation-guide.html", desc: "Advanced guide to pomegranate cultivation covering precise growing parameters, propagation from cutt", cat: "Guides", kw: ["advanced", "covering", "cuttings", "extraction", "harvest", "home"] },
        { title: "Purple Sweet Potato (Ipomoea batatas): Comprehensive Cultivation, Processing & Use Guide", url: "articles/purple-sweet-potato-cultivation-guide.html", desc: "Complete guide to purple sweet potato cultivation covering Ipomoea batatas purple-fleshed cultivars,", cat: "Guides", kw: ["anthocyanin", "batatas", "comprehensive", "covering", "culinary", "cultivars"] },
        { title: "Red Spanish Pineapple (Ananas comosus): Comprehensive Cultivation, Processing & Use Guide", url: "articles/red-spanish-pineapple-cultivation-guide.html", desc: "Complete guide to Red Spanish pineapple cultivation covering Ananas comosus Spanish group, growing p", cat: "Guides", kw: ["ananas", "bromelain", "comosus", "comprehensive", "covering", "extraction"] },
        { title: "Redbor Kale (Brassica oleracea var. acephala): Comprehensive Cultivation, Processing & Use Guide", url: "articles/redbor-kale-cultivation-guide.html", desc: "Complete guide to Redbor kale cultivation covering climate requirements, soil management, planting s", cat: "Guides", kw: ["acephala", "anthocyanin", "brassica", "climate", "comprehensive", "covering"] },
        { title: "Roselle Hibiscus (Hibiscus sabdariffa): Comprehensive Cultivation, Processing & Use Guide", url: "articles/roselle-hibiscus-cultivation-guide.html", desc: "Complete guide to roselle hibiscus cultivation covering Hibiscus sabdariffa, growing parameters, pla", cat: "Guides", kw: ["anthocyanin", "calyx", "comprehensive", "covering", "culinary", "extraction"] },
        { title: "Russian Comfrey (Symphytum × uplandicum): Comprehensive Cultivation, Processing & Topical Use Guide", url: "articles/russian-comfrey-cultivation-guide.html", desc: "Complete guide to Russian comfrey cultivation covering Symphytum uplandicum hybridization, growing p", cat: "Guides", kw: ["allantoin", "boundaries", "comfrey", "comprehensive", "covering", "extraction"] },
        { title: "San Pedro Cactus (Echinopsis pachanoi): Comprehensive Cultivation, History & Use Guide", url: "articles/san-pedro-cultivation-guide.html", desc: "Complete guide to San Pedro cactus cultivation covering Echinopsis pachanoi botany, Andean cultural ", cat: "Guides", kw: ["adaptation", "andean", "botany", "cactus", "climate", "comprehensive"] },
        { title: "San Saba Pecan (Carya illinoinensis): Comprehensive Cultivation, Processing & Use Guide", url: "articles/san-saba-pecan-cultivation-guide.html", desc: "Complete guide to San Saba pecan cultivation covering Carya illinoinensis, Texas heritage, growing p", cat: "Guides", kw: ["carya", "comprehensive", "covering", "culinary", "drying", "grafting"] },
        { title: "Santa Rosa Plum (Prunus salicina): Cultivation & Fruit Profile Guide", url: "articles/santa-rosa-plum-cultivation-guide.html", desc: "Guide to Santa Rosa plum cultivation covering Prunus salicina botany, fruit characteristics, growing", cat: "Guides", kw: ["adaptation", "botany", "characteristics", "climate", "considerations", "covering"] },
        { title: "Sideoats Grama (Bouteloua curtipendula): Comprehensive Cultivation, Forage & Soil-Restoration Guide", url: "articles/sideoats-grama-cultivation-guide.html", desc: "Complete guide to sideoats grama cultivation covering Bouteloua curtipendula, climate adaptation, se", cat: "Guides", kw: ["adaptation", "bouteloua", "climate", "comprehensive", "covering", "curtipendula"] },
        { title: "Subterranean Clover (Trifolium subterraneum): Comprehensive Cultivation, Livestock & Soil-Regeneration Guide", url: "articles/subterranean-clover-cultivation-guide.html", desc: "Complete guide to subterranean clover cultivation covering Trifolium subterraneum growth parameters,", cat: "Guides", kw: ["clover", "comprehensive", "covering", "fixation", "forage", "grazing"] },
        { title: "Switchgrass (Panicum virgatum): Comprehensive Cultivation, Processing & Use Guide", url: "articles/switchgrass-cultivation-guide.html", desc: "Complete guide to switchgrass cultivation covering Panicum virgatum ecotypes, C4 photosynthesis, bio", cat: "Guides", kw: ["biomass", "carbon", "comprehensive", "covering", "ecotypes", "land"] },
        { title: "Thai Mint (Mentha cordifolia): Comprehensive Cultivation & Use Guide", url: "articles/thai-mint-cultivation-guide.html", desc: "Complete guide to Thai mint cultivation covering Mentha cordifolia botany, growing parameters, propa", cat: "Guides", kw: ["botany", "chemistry", "comprehensive", "cordifolia", "covering", "culinary"] },
        { title: "Tropea Onion (Cipolla Rossa di Tropea): Comprehensive Cultivation, Processing & Use Guide", url: "articles/tropea-onion-cultivation-guide.html", desc: "Complete guide to Tropea onion cultivation covering Allium cepa landrace characteristics, climate ad", cat: "Guides", kw: ["adaptation", "allium", "cepa", "characteristics", "cipolla", "climate"] },
        { title: "Kava (Piper methysticum): Comprehensive Cultivation, Processing & Use Guide", url: "articles/kava-cultivation-guide.html", desc: "Complete guide to kava cultivation covering Piper methysticum, kavalactone chemistry, tropical growi", cat: "Kava", kw: ["chemistry", "clonal", "comprehensive", "context", "covering", "drying"] },
        { title: "Kavalactones Explained: The Science Behind Kava's Calm", url: "articles/kavalactones-explained.html", desc: "How the six major kavalactones work together to create kava", cat: "Kava", kw: ["behind", "calm", "create", "explained", "kava", "kavalactones"] },
        { title: "Traditional Kava Preparation: From Pacific Island to Your Cup", url: "articles/traditional-kava-preparation.html", desc: "The ancient art of kava preparation and how modern extraction methods compare. Learn traditional and", cat: "Kava", kw: ["ancient", "art", "compare", "contemporary", "cup", "extraction"] },
        { title: "Red, Green, White: Understanding Kratom Vein Colors", url: "articles/kratom-vein-colors.html", desc: "What do the different kratom vein colors mean, and how do they affect the alkaloid profile? A compre", cat: "Kratom", kw: ["affect", "alkaloid", "colors", "comprehensive", "different", "green"] },
        { title: "The Complete Guide to Kratom", url: "articles/complete-kratom-guide.html", desc: "Everything you need to know about Mitragyna speciosa - from its traditional use in Southeast Asia to", cat: "Kratom", kw: ["alkaloids", "asia", "everything", "know", "kratom", "mitragyna"] },
        { title: "Understanding Kratom Alkaloids: Mitragynine vs 7-Hydroxymitragynine", url: "articles/kratom-alkaloids.html", desc: "A deep dive into the two primary alkaloids in kratom - mitragynine and 7-hydroxymitragynine - and ho", cat: "Kratom", kw: ["7hydroxymitragynine", "affect", "alkaloids", "body", "deep", "differently"] },
        { title: "Extraction Methods: CO2 vs Ethanol vs Water", url: "articles/extraction-methods.html", desc: "Comparing different extraction techniques and their impact on alkaloid profiles. Understanding how e", cat: "Science", kw: ["affect", "alkaloid", "botanical", "co2", "comparing", "different"] },
        { title: "How Adaptogens Work: The Science of Stress Response", url: "articles/adaptogens-science.html", desc: "Understanding how adaptogenic botanicals help the body maintain homeostasis. The science behind adap", cat: "Science", kw: ["adaptogenic", "adaptogens", "behind", "body", "botanicals", "help"] },
        { title: "How to Read a Certificate of Analysis (COA)", url: "articles/how-to-read-coa.html", desc: "A beginner", cat: "Science", kw: ["analysis", "beginner", "certificate", "coa", "read"] },
        { title: "Pomegranate (Punica granatum): A Complete Botanical Monograph", url: "articles/pomegranate-monograph.html", desc: "Comprehensive monograph on pomegranate covering botanical identity, phytochemistry, cultivation, pro", cat: "Science", kw: ["agricultural", "botanical", "comprehensive", "covering", "extraction", "granatum"] },
        { title: "Responsible Dosing: Start Low, Go Slow", url: "articles/responsible-dosing.html", desc: "Best practices for trying any new botanical product safely and effectively. Learn the fundamentals o", cat: "Science", kw: ["any", "best", "botanical", "dosing", "effectively", "fundamentals"] },
        { title: "Agarita (Mahonia trifoliolata): Comprehensive Cultivation, Processing & Use Guide", url: "articles/agarita-cultivation-guide.html", desc: "Complete guide to agarita cultivation covering Mahonia trifoliolata, growing parameters, propagation", cat: "Texas Natives", kw: ["agarita", "alkaloids", "berberine", "comprehensive", "country", "covering"] },
        { title: "Davis Mountains Yucca (Yucca pallida): Comprehensive Cultivation, Processing & Surfactant-Use Guide", url: "articles/davis-mountain-yucca-cultivation-guide.html", desc: "Complete guide to Davis Mountains yucca cultivation covering Yucca pallida botany, steroidal saponin", cat: "Texas Natives", kw: ["adaptation", "botany", "chemistry", "climate", "comprehensive", "context"] },
        { title: "Prickly Pear (Opuntia spp.): Comprehensive Cultivation, Processing & Use Guide", url: "articles/prickly-pear-cultivation-guide.html", desc: "Complete guide to prickly pear cultivation covering Opuntia species, growing parameters, pad propaga", cat: "Texas Natives", kw: ["betalain", "comprehensive", "covering", "culinary", "glochid", "harvest"] },
        { title: "Texas Persimmon (Diospyros texana): Comprehensive Cultivation, Processing & Use Guide", url: "articles/texas-persimmon-cultivation-guide.html", desc: "Complete guide to Texas persimmon cultivation covering Diospyros texana botany, climate adaptation, ", cat: "Texas Natives", kw: ["adaptation", "agroecology", "botany", "climate", "comprehensive", "covering"] },
        { title: "Yaupon Holly (Ilex vomitoria): Comprehensive Cultivation, Processing & Use Guide", url: "articles/yaupon-holly-cultivation-guide.html", desc: "Complete guide to yaupon holly cultivation covering Ilex vomitoria growing parameters, caffeine chem", cat: "Texas Natives", kw: ["america", "caffeine", "chemistry", "comprehensive", "covering", "harvest"] }
    ];

    // Category colors
    var CAT_COLORS = {
        'Pages': '#6b7280', 'Products': '#1c3a13', 'Kratom': '#16a34a',
        'Kava': '#7c3aed', 'Blue Lotus': '#2563eb', 'Science': '#dc2626',
        'Guides': '#059669', 'Texas Natives': '#b45309', 'Cannabis': '#65a30d',
        'Classroom': '#8b5cf6'
    };

    // ============================================
    // Build & inject overlay HTML
    // ============================================
    var overlayHTML = '<div class="site-search-overlay" id="siteSearchOverlay">' +
        '<div class="site-search-container">' +
        '<div class="site-search-header">' +
        '<div class="site-search-input-wrap">' +
        '<svg class="site-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<input type="text" class="site-search-input" id="siteSearchInput" placeholder="Search articles, guides, products..." autocomplete="off">' +
        '<button class="site-search-close" id="siteSearchClose" aria-label="Close search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button></div></div>' +
        '<div class="site-search-results" id="siteSearchResults">' +
        '<div class="site-search-empty">Type to search across all pages and articles</div>' +
        '</div></div></div>';

    var overlayContainer = document.createElement('div');
    overlayContainer.innerHTML = overlayHTML;
    document.body.appendChild(overlayContainer.firstChild);

    // ============================================
    // Inject inline search bar into nav (desktop)
    // and search icon trigger (mobile)
    // ============================================
    var navContainer = document.querySelector('.nav-container');
    var navSearchBar = null;
    var navDropdown = null;
    var navInput = null;
    var selectedIdx = -1;

    if (navContainer) {
        // -- Inline search bar (desktop) --
        var barWrap = document.createElement('div');
        barWrap.className = 'nav-search-bar';
        barWrap.innerHTML =
            '<svg class="nav-search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input type="text" class="nav-search-bar-input" placeholder="Search..." autocomplete="off" aria-label="Search site">' +
            '<kbd class="nav-search-bar-kbd">Ctrl K</kbd>';

        // -- Dropdown panel --
        var dropdown = document.createElement('div');
        dropdown.className = 'nav-search-dropdown';
        dropdown.id = 'navSearchDropdown';
        barWrap.appendChild(dropdown);

        // -- Classroom icon (desktop) --
        var classroomIcon = document.createElement('a');
        classroomIcon.className = 'nav-classroom-icon';
        classroomIcon.href = prefix + 'classroom.html';
        classroomIcon.setAttribute('aria-label', 'Botanical Classroom');
        classroomIcon.setAttribute('title', 'Botanical Classroom');
        classroomIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

        // -- Mobile trigger icon --
        var trigger = document.createElement('button');
        trigger.className = 'site-search-trigger';
        trigger.setAttribute('aria-label', 'Search site');
        trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

        // Insert before mobile toggle
        var mobileToggle = navContainer.querySelector('.nav-mobile-toggle');
        if (mobileToggle) {
            navContainer.insertBefore(barWrap, mobileToggle);
            navContainer.insertBefore(classroomIcon, mobileToggle);
            navContainer.insertBefore(trigger, mobileToggle);
        } else {
            navContainer.appendChild(barWrap);
            navContainer.appendChild(classroomIcon);
            navContainer.appendChild(trigger);
        }

        navSearchBar = barWrap;
        navDropdown = dropdown;
        navInput = barWrap.querySelector('.nav-search-bar-input');

        // Mobile trigger opens overlay
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            openOverlay();
        });

        // -- Inline search events --
        var navDebounce;
        navInput.addEventListener('input', function() {
            clearTimeout(navDebounce);
            navDebounce = setTimeout(function() {
                var q = navInput.value.trim();
                if (q.length < 2) {
                    if (document.activeElement === navInput) {
                        showSuggestions();
                    } else {
                        closeDropdown();
                    }
                    return;
                }
                var results = search(q, 8);
                renderDropdown(results, q);
            }, 120);
        });

        navInput.addEventListener('focus', function() {
            var q = navInput.value.trim();
            if (q.length >= 2) {
                var results = search(q, 8);
                renderDropdown(results, q);
            } else {
                showSuggestions();
            }
        });

        navInput.addEventListener('keydown', function(e) {
            if (!navDropdown.classList.contains('active')) {
                if (e.key === 'Enter') {
                    // Open overlay with current query
                    e.preventDefault();
                    openOverlay(navInput.value.trim());
                }
                return;
            }

            var items = navDropdown.querySelectorAll('.nav-search-result');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIdx = Math.max(selectedIdx - 1, -1);
                updateSelection(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIdx >= 0 && items[selectedIdx]) {
                    items[selectedIdx].click();
                } else {
                    openOverlay(navInput.value.trim());
                }
            } else if (e.key === 'Escape') {
                closeDropdown();
                navInput.blur();
            }
        });

        // Close dropdown on outside click
        document.addEventListener('click', function(e) {
            if (navSearchBar && !navSearchBar.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    function updateSelection(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('selected', i === selectedIdx);
        }
        if (selectedIdx >= 0 && items[selectedIdx]) {
            items[selectedIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    function renderDropdown(results, query) {
        if (!navDropdown) return;
        selectedIdx = -1;

        if (results.length === 0) {
            navDropdown.innerHTML = '<div class="nav-search-empty">No results for "' + escapeHtml(query) + '"</div>';
            navDropdown.classList.add('active');
            return;
        }

        var html = '';
        for (var i = 0; i < results.length; i++) {
            var p = results[i].page;
            var url = prefix + p.url;
            var color = CAT_COLORS[p.cat] || '#6b7280';
            html += '<a href="' + url + '" class="nav-search-result">' +
                '<div class="nav-search-result-top">' +
                '<span class="nav-search-result-title">' + highlight(p.title, query) + '</span>' +
                '<span class="nav-search-cat-badge" style="background:' + color + '">' + escapeHtml(p.cat) + '</span>' +
                '</div>' +
                '<p class="nav-search-result-desc">' + highlight(p.desc, query) + '</p>' +
                '</a>';
        }

        navDropdown.innerHTML = html;
        navDropdown.classList.add('active');
    }

    // Suggested topics shown on empty focus
    var SUGGESTIONS = [
        { label: 'Kratom', query: 'kratom' },
        { label: 'Kava', query: 'kava' },
        { label: 'Blue Lotus', query: 'blue lotus' },
        { label: 'Cultivation Guides', query: 'cultivation' },
        { label: 'Extracts', query: 'extract' },
        { label: 'Texas Natives', query: 'texas native' },
        { label: 'Cannabis', query: 'cannabis' },
        { label: 'Lab & Science', query: 'science' }
    ];

    function showSuggestions() {
        if (!navDropdown) return;
        selectedIdx = -1;

        var html = '<div class="nav-search-suggestions">' +
            '<div class="nav-search-suggestions-label">Popular Topics</div>' +
            '<div class="nav-search-suggestions-grid">';

        for (var i = 0; i < SUGGESTIONS.length; i++) {
            html += '<button class="nav-search-suggestion" data-query="' +
                escapeHtml(SUGGESTIONS[i].query) + '">' +
                escapeHtml(SUGGESTIONS[i].label) + '</button>';
        }

        html += '</div></div>';
        navDropdown.innerHTML = html;
        navDropdown.classList.add('active');

        // Attach click handlers to suggestion pills
        var pills = navDropdown.querySelectorAll('.nav-search-suggestion');
        for (var j = 0; j < pills.length; j++) {
            pills[j].addEventListener('click', function(e) {
                var q = this.getAttribute('data-query');
                navInput.value = q;
                var results = search(q, 8);
                renderDropdown(results, q);
                navInput.focus();
            });
        }
    }

    function closeDropdown() {
        if (navDropdown) {
            navDropdown.classList.remove('active');
            selectedIdx = -1;
        }
    }

    // ============================================
    // Overlay logic
    // ============================================
    var overlay = document.getElementById('siteSearchOverlay');
    var overlayInput = document.getElementById('siteSearchInput');
    var overlayResults = document.getElementById('siteSearchResults');
    var closeBtn = document.getElementById('siteSearchClose');
    var overlaySelectedIdx = -1;

    function openOverlay(initialQuery) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeDropdown();
        setTimeout(function() {
            overlayInput.focus();
            if (initialQuery) {
                overlayInput.value = initialQuery;
                searchOverlay(initialQuery);
            }
        }, 100);
    }

    function closeOverlay() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        overlayInput.value = '';
        overlayResults.innerHTML = '<div class="site-search-empty">Type to search across all pages and articles</div>';
        overlaySelectedIdx = -1;
    }

    closeBtn.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeOverlay();
    });

    // ============================================
    // Global keyboard shortcuts
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Escape closes overlay
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
            return;
        }
        // Ctrl+K / Cmd+K toggles overlay
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('active')) {
                closeOverlay();
            } else {
                openOverlay(navInput ? navInput.value.trim() : '');
            }
        }
    });

    // Overlay keyboard navigation
    overlayInput.addEventListener('keydown', function(e) {
        var items = overlayResults.querySelectorAll('.site-search-result');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            overlaySelectedIdx = Math.min(overlaySelectedIdx + 1, items.length - 1);
            updateOverlaySelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            overlaySelectedIdx = Math.max(overlaySelectedIdx - 1, -1);
            updateOverlaySelection(items);
        } else if (e.key === 'Enter' && overlaySelectedIdx >= 0 && items[overlaySelectedIdx]) {
            e.preventDefault();
            items[overlaySelectedIdx].click();
        }
    });

    function updateOverlaySelection(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('selected', i === overlaySelectedIdx);
        }
        if (overlaySelectedIdx >= 0 && items[overlaySelectedIdx]) {
            items[overlaySelectedIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    // ============================================
    // Search engine with fuzzy matching
    // ============================================
    function search(query, limit) {
        if (!query || query.length < 2) return [];

        var q = query.toLowerCase();
        var words = q.split(/\s+/).filter(function(w) { return w.length >= 2; });
        var scored = [];

        for (var i = 0; i < PAGES.length; i++) {
            var page = PAGES[i];
            var score = 0;
            var titleLower = page.title.toLowerCase();
            var descLower = page.desc.toLowerCase();
            var catLower = page.cat.toLowerCase();
            var kws = page.kw || [];

            // Exact title match
            if (titleLower === q) score += 100;
            // Title starts with query
            else if (titleLower.indexOf(q) === 0) score += 80;
            // Title contains query
            else if (titleLower.indexOf(q) !== -1) score += 60;

            // Category match
            if (catLower.indexOf(q) !== -1) score += 30;

            // Description match
            if (descLower.indexOf(q) !== -1) score += 20;

            // Keyword match
            for (var k = 0; k < kws.length; k++) {
                if (kws[k].indexOf(q) !== -1) { score += 40; break; }
                if (q.indexOf(kws[k]) !== -1) { score += 25; break; }
            }

            // Word-level matching
            for (var w = 0; w < words.length; w++) {
                var word = words[w];
                if (titleLower.indexOf(word) !== -1) score += 15;
                if (descLower.indexOf(word) !== -1) score += 8;
                if (catLower.indexOf(word) !== -1) score += 10;
                for (var k2 = 0; k2 < kws.length; k2++) {
                    if (kws[k2].indexOf(word) !== -1) { score += 12; break; }
                }
            }

            // Fuzzy matching (1-char typo tolerance) for no-score situations
            if (score === 0 && q.length >= 3) {
                if (fuzzyMatch(titleLower, q)) score += 25;
                else if (fuzzyMatch(descLower, q)) score += 10;
                else {
                    for (var k3 = 0; k3 < kws.length; k3++) {
                        if (fuzzyMatch(kws[k3], q)) { score += 15; break; }
                    }
                }
            }

            if (score > 0) {
                scored.push({ page: page, score: score });
            }
        }

        scored.sort(function(a, b) { return b.score - a.score; });
        return scored.slice(0, limit || 10);
    }

    // Simple fuzzy: check if any word in text is within edit distance 1 of query
    function fuzzyMatch(text, query) {
        var textWords = text.split(/[\s,\-]+/);
        for (var i = 0; i < textWords.length; i++) {
            if (editDistance1(textWords[i], query)) return true;
        }
        return false;
    }

    function editDistance1(a, b) {
        if (Math.abs(a.length - b.length) > 1) return false;
        if (a === b) return true;

        var diffs = 0;
        if (a.length === b.length) {
            // Substitution check
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) diffs++;
                if (diffs > 1) return false;
            }
            return diffs === 1;
        }

        // Insertion/deletion check
        var longer = a.length > b.length ? a : b;
        var shorter = a.length > b.length ? b : a;
        var j = 0;
        for (var i2 = 0; i2 < longer.length; i2++) {
            if (longer[i2] !== shorter[j]) {
                diffs++;
                if (diffs > 1) return false;
            } else {
                j++;
            }
        }
        return true;
    }

    // ============================================
    // Overlay search (uses same engine)
    // ============================================
    function searchOverlay(query) {
        if (!query || query.length < 2) {
            overlayResults.innerHTML = '<div class="site-search-empty">Type to search across all pages and articles</div>';
            return;
        }

        var results = search(query, 10);
        overlaySelectedIdx = -1;

        if (results.length === 0) {
            overlayResults.innerHTML = '<div class="site-search-empty">No results found for "' + escapeHtml(query) + '"</div>';
            return;
        }

        var html = '';
        for (var j = 0; j < results.length; j++) {
            var p = results[j].page;
            var url = prefix + p.url;
            var color = CAT_COLORS[p.cat] || '#6b7280';
            var highlightedTitle = highlight(p.title, query);
            var highlightedDesc = highlight(p.desc, query);

            html += '<a href="' + url + '" class="site-search-result">' +
                '<div class="site-search-result-header">' +
                '<span class="site-search-result-title">' + highlightedTitle + '</span>' +
                '<span class="site-search-cat-badge" style="background:' + color + '">' + escapeHtml(p.cat) + '</span>' +
                '</div>' +
                '<p class="site-search-result-desc">' + highlightedDesc + '</p>' +
                '</a>';
        }

        overlayResults.innerHTML = html;
    }

    var overlayDebounce;
    overlayInput.addEventListener('input', function() {
        clearTimeout(overlayDebounce);
        overlayDebounce = setTimeout(function() {
            searchOverlay(overlayInput.value.trim());
        }, 150);
    });

    // ============================================
    // Helpers
    // ============================================
    function highlight(text, query) {
        var escaped = escapeHtml(text);
        var q = query.toLowerCase();
        var words = q.split(/\s+/).filter(function(w) { return w.length >= 2; });

        // Try full query match first
        var idx = text.toLowerCase().indexOf(q);
        if (idx !== -1) {
            var before = escapeHtml(text.substring(0, idx));
            var match = escapeHtml(text.substring(idx, idx + query.length));
            var after = escapeHtml(text.substring(idx + query.length));
            return before + '<mark>' + match + '</mark>' + after;
        }

        // Fall back to word-level highlighting
        if (words.length > 1) {
            var result = escaped;
            for (var w = 0; w < words.length; w++) {
                var word = words[w];
                var regex = new RegExp('(' + escapeRegex(escapeHtml(word)) + ')', 'gi');
                result = result.replace(regex, '<mark>$1</mark>');
            }
            return result;
        }

        return escaped;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
