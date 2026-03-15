#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

function generateArticle(plant) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <script src="/dev-console-filter.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-050E36TGR9"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-050E36TGR9");</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plant.title} | Nored Farms</title>
    <meta name="description" content="${plant.metaDesc}">
    <meta name="keywords" content="${plant.keywords}">
    <link rel="canonical" href="https://noredfarms.netlify.app/articles/${plant.slug}-cultivation-guide.html">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@350;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="../age-verification.css">
    <style>
        .article-page { padding-top: 100px; }
        .article-header { max-width: 800px; margin: 0 auto 3rem; padding: 0 1.5rem; }
        .article-meta-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
        .article-category-tag { background: var(--color-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
        .article-date, .article-read-time { color: var(--color-text-muted); font-size: 0.875rem; }
        .article-title { font-family: var(--font-display, 'Inter', sans-serif); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.2; margin-bottom: 1.5rem; }
        .article-excerpt { font-size: 1.25rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 2rem; }
        .article-content { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }
        .article-content h2 { font-family: var(--font-display, 'Inter', sans-serif); font-size: 1.75rem; margin: 2.5rem 0 1rem; }
        .article-content h3 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
        .article-content p { line-height: 1.8; margin-bottom: 1.5rem; }
        .article-content ul, .article-content ol { margin: 1rem 0 1.5rem 1.5rem; line-height: 1.8; }
        .article-content li { margin-bottom: 0.5rem; }
        .info-box { background: var(--color-surface); border-left: 4px solid var(--color-primary); padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0; }
        .info-box h4 { margin: 0 0 0.5rem; color: var(--color-primary); font-weight: 500; }
        .spec-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .spec-table th, .spec-table td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); }
        .spec-table th { font-weight: 500; color: var(--color-primary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em; }
        .spec-table td { font-size: 0.9375rem; }
        .ref-list { font-size: 0.875rem; color: var(--color-text-muted); }
        .ref-list li { margin-bottom: 0.25rem; }
        .article-footer { max-width: 800px; margin: 3rem auto; padding: 2rem 1.5rem; border-top: 1px solid var(--color-border); }
        .back-to-blog { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--color-primary); text-decoration: none; font-weight: 500; }
        .back-to-blog:hover { text-decoration: underline; }
    </style>
    <link rel="stylesheet" href="../chat-widget.css">
    <link rel="stylesheet" href="../shipping-estimator.css">
    <link rel="stylesheet" href="../site-enhancements.css">
    <link rel="stylesheet" href="../site-search.css">
    <link rel="stylesheet" href="../visual-enhancements.css">
</head>
<body>
    <nav class="nav" id="nav">
        <a href="../index.html" class="nav-logo"><img src="../images/logo-nf.svg" alt="Nored Farms" style="height:24px;width:auto;vertical-align:middle;margin-right:4px;">Nored Farms<span class="dot"></span></a>
        <div class="nav-links" id="navLinks"><a href="../index.html#products">Products</a><a href="../blog.html">Articles</a><a href="../classes.html">Classes</a><a href="../about-us.html">Company</a><a href="../courses/login.html">Login</a><a href="../contact.html" class="nav-cta">Get Started</a></div>
        <button class="hamburger" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </nav>
    <main class="article-page">
        <article>
            <header class="article-header">
                <div class="article-meta-header">
                    <span class="article-category-tag">Guides</span>
                    <span class="article-date">${plant.date}</span>
                    <span class="article-read-time">${plant.readTime} min read</span>
                </div>
                <h1 class="article-title">${plant.h1}</h1>
                <p class="article-excerpt">${plant.excerpt}</p>
            </header>
            <div class="article-content">
${plant.body}
            </div>
            <footer class="article-footer">
                <a href="../blog.html" class="back-to-blog"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg> Back to All Articles</a>
            </footer>
        </article>
    </main>
    <footer class="seed-footer"><div class="seed-footer-inner"><div class="seed-footer-top"><div class="seed-footer-mission"><h3>Pioneering botanical science for human wellness since 2010.</h3><p>Precision extraction. Full transparency. Crafted in Texas Hill Country for those who demand evidence over marketing.</p></div><div class="seed-footer-signup"><p>Science with Nored &mdash; research updates for your inbox.</p><div class="seed-footer-email-row"><input type="email" placeholder="Your email" class="seed-footer-email"><button class="seed-footer-email-btn">Subscribe</button></div></div></div><div class="seed-footer-links"><div class="seed-footer-col"><h4>Products</h4><ul><li><a href="../products/extracts.html">Botanical Extracts</a></li><li><a href="../products/tinctures.html">Tinctures</a></li><li><a href="../products/gummies.html">Gummies</a></li><li><a href="../products/live-plants.html">Live Plants</a></li></ul></div><div class="seed-footer-col"><h4>Learn</h4><ul><li><a href="../blog.html">Education</a></li><li><a href="../classes.html">Classes</a></li><li><a href="../classroom.html">Classroom</a></li><li><a href="../research.html">Research Library</a></li></ul></div><div class="seed-footer-col"><h4>Science</h4><ul><li><a href="../articles/extraction-methods.html">Extraction 101</a></li><li><a href="../articles/adaptogens-science.html">Adaptogens Science</a></li><li><a href="../articles/kavalactones-explained.html">Kava Science</a></li><li><a href="../articles/blue-lotus-compounds.html">Blue Lotus</a></li></ul></div><div class="seed-footer-col"><h4>Help</h4><ul><li><a href="../contact.html">Contact</a></li><li><a href="../consulting.html">Consulting</a></li><li><a href="../courses/login.html">Course Login</a></li><li><a href="../roadmap.html">Roadmap</a></li></ul></div><div class="seed-footer-col"><h4>Company</h4><ul><li><a href="../index.html">Home</a></li><li><a href="../seo.html">Transparency</a></li><li><a href="../welcome.html">Welcome</a></li></ul></div><div class="seed-footer-col"><h4>Legal</h4><ul><li><a href="../contact.html">Terms of Service</a></li><li><a href="../contact.html">Privacy Policy</a></li></ul></div></div><div class="seed-footer-disclaimer">*These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use. Must be 21+ to purchase. Not for sale where prohibited by law. Nored Farms products are manufactured in a GMP-compliant facility and tested by independent third-party laboratories.</div><div class="seed-footer-social"><span style="font-size: 13px; color: var(--color--olivegreen); margin-right: 8px;">Follow us</span><div class="social-follow"><a href="https://instagram.com/noredfarms" target="_blank" rel="noopener" aria-label="Follow on Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a><a href="https://tiktok.com/@noredfarms" target="_blank" rel="noopener" aria-label="Follow on TikTok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a></div></div><div class="seed-footer-bottom"><span>&copy; 2026 Nored Farms. All rights reserved.</span><span>Crafted in Texas Hill Country</span></div></div></footer>
    <script src="../script.js"></script>
    <script src="../age-verification.js"></script>
    <script src="../chat-widget.js"></script>
    <script src="../shipping-estimator.js"></script>
    <script src="../site-enhancements.js"></script>
    <script src="../site-search.js"></script>
    <script src="../visual-enhancements.js"></script>
</body>
</html>`;
}

const plants = [

{
  slug: 'feverfew', date: 'March 30, 2026', readTime: '11',
  title: 'Feverfew (Tanacetum parthenium): Full Guide to Cultivation, Migraine Prevention &amp; Research',
  metaDesc: 'Complete feverfew cultivation guide covering Tanacetum parthenium daisy-like botany, easy garden growing, parthenolide chemistry, centuries of migraine folk remedy use, and the clinical evidence for headache prevention.',
  keywords: 'feverfew cultivation, Tanacetum parthenium, feverfew migraine, parthenolide, feverfew growing, migraine prevention herb, headache herbs',
  h1: 'Feverfew (Tanacetum parthenium): The Medieval Migraine Remedy That Clinical Science Took Seriously',
  excerpt: 'A growing guide for the cheerful daisy-like herb that British migraine sufferers have chewed raw since the Middle Ages, why parthenolide is the compound that reduces migraine frequency and severity, and what happened when rigorous clinical trials tested 700 years of folk wisdom.',
  body: `
                <h2>Botanical Description</h2>
                <p>Feverfew (<em>Tanacetum parthenium</em>, syn. <em>Chrysanthemum parthenium</em>) is a bushy, aromatic perennial in the Asteraceae family, native to southeastern Europe and now naturalized across the temperate world. Plants grow 12&ndash;24 inches tall with deeply lobed, bright yellowish-green leaves that have a distinctive bitter, citrus-like aroma. Small, daisy-like flower heads with white ray petals and raised yellow centers appear in profuse clusters throughout summer.</p>

                <p>The plant self-seeds freely and can become a persistent garden volunteer&mdash;an attribute that has made it a fixture of cottage gardens and herb borders for centuries. Its strong aroma and bitter taste deter most herbivorous insects, making it one of the most pest-free herbs in cultivation.</p>

                <div class="info-box">
                    <h4>The Raw Leaf Tradition</h4>
                    <p>The traditional method of using feverfew for migraines is remarkably simple and has persisted unchanged for centuries: chew 1&ndash;3 fresh leaves daily as a preventive measure. The practice was popularized in the 1970s when a Welsh doctor&rsquo;s wife, a chronic migraine sufferer, began chewing feverfew leaves on the advice of a coal miner who had used the same remedy. Her dramatic improvement caught the attention of the medical community and triggered the first clinical investigations.</p>
                </div>

                <h2>Growing Requirements</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>5&ndash;10</td></tr>
                        <tr><td>Light</td><td>Full sun to partial shade</td></tr>
                        <tr><td>Soil</td><td>Average, well-drained; tolerates poor soil; pH 6.0&ndash;6.7</td></tr>
                        <tr><td>Moisture</td><td>Low to moderate; drought-tolerant once established</td></tr>
                        <tr><td>Propagation</td><td>Seed (easy; surface sow), cuttings, or division</td></tr>
                        <tr><td>Spacing</td><td>12&ndash;15 inches</td></tr>
                    </tbody>
                </table>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Sesquiterpene Lactones</td><td>Parthenolide (primary active; 0.2&ndash;0.5% of dry leaf weight)</td></tr>
                        <tr><td>Flavonoids</td><td>Tanetin (lipophilic flavonol; anti-inflammatory)</td></tr>
                        <tr><td>Volatile Oil</td><td>Camphor, chrysanthenyl acetate, borneol</td></tr>
                        <tr><td>Melatonin</td><td>Present in significant quantities; may contribute to migraine prophylaxis</td></tr>
                    </tbody>
                </table>

                <p>Parthenolide is thought to prevent migraines through multiple mechanisms: inhibiting serotonin release from platelets, reducing prostaglandin synthesis, blocking NF-kB inflammatory pathways, and preventing smooth muscle spasms in cerebral blood vessels. This multi-target approach may explain why feverfew is more effective as a prophylactic (preventive) than as an acute treatment.</p>

                <h2>Clinical Research</h2>
                <ul>
                    <li><strong>Migraine prevention:</strong> A landmark 1988 RCT in <em>The Lancet</em> demonstrated a 24% reduction in migraine frequency and significantly reduced nausea and vomiting in feverfew-treated patients compared to placebo. Subsequent trials have produced mixed but generally supportive results.</li>
                    <li><strong>Cochrane review:</strong> The 2015 Cochrane analysis concluded that feverfew is &ldquo;likely to be effective&rdquo; for migraine prevention based on available evidence, while noting study heterogeneity and the need for larger, more standardized trials.</li>
                    <li><strong>Dose-response:</strong> Clinical benefit appears to require a minimum of 0.2% parthenolide content in the dried leaf, taken consistently for at least 4&ndash;6 weeks before full prophylactic effect is established.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Mouth ulcers:</strong> Chewing fresh leaves can cause mouth sores and lip swelling in ~10% of users. Capsules or dried-leaf preparations avoid this issue.</li>
                    <li><strong>Rebound headaches:</strong> Abrupt discontinuation after long-term use may trigger rebound migraines. Taper gradually.</li>
                    <li><strong>Pregnancy:</strong> Contraindicated; parthenolide may stimulate uterine contractions.</li>
                    <li><strong>Blood thinning:</strong> May inhibit platelet aggregation; avoid with anticoagulants.</li>
                    <li><strong>Asteraceae allergy:</strong> Cross-reactivity possible.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Murphy et al., <em>The Lancet</em> (1988) &mdash; landmark migraine RCT</li>
                    <li>Pittler &amp; Ernst, <em>Cochrane Database of Systematic Reviews</em> (2004, updated 2015) &mdash; feverfew for migraine</li>
                    <li>Pareek et al., <em>Journal of Ethnopharmacology</em> (2011) &mdash; feverfew comprehensive review</li>
                    <li>European Medicines Agency, Herbal Monograph on Tanacetum parthenium</li>
                    <li>British Herbal Pharmacopoeia &mdash; feverfew monograph</li>
                </ol>`
},

{
  slug: 'maca', date: 'April 1, 2026', readTime: '12',
  title: 'Maca (Lepidium meyenii): Full Guide to Cultivation, Andean Superfood &amp; Endocrine Research',
  metaDesc: 'Complete maca cultivation guide covering Lepidium meyenii extreme-altitude botany, the challenge of lowland growing, glucosinolate and macamide chemistry, Incan warrior food history, and clinical research on libido, fertility, and energy.',
  keywords: 'maca cultivation, Lepidium meyenii, maca root, maca growing, Peruvian maca, maca libido, macamides, Andean superfood',
  h1: 'Maca (Lepidium meyenii): The Andean Root Grown at 14,000 Feet That Conquistadors Fed to Their Horses',
  excerpt: 'A guide to the cruciferous root vegetable that thrives at altitudes where almost nothing else survives, was so valued by the Inca that it served as currency, produces unique macamide compounds found in no other plant, and has accumulated surprisingly strong clinical evidence for effects on libido, fertility, and menopausal symptoms.',
  body: `
                <h2>Botanical Description</h2>
                <p>Maca (<em>Lepidium meyenii</em>) is a compact, low-growing biennial in the Brassicaceae (mustard/crucifer) family, endemic to the high-altitude puna grasslands of the Peruvian and Bolivian Andes at elevations of 11,000&ndash;14,500 feet. The plant forms a rosette of frilly, turnip-like leaves close to the ground, with the prized part being the swollen hypocotyl (storage root) that develops underground&mdash;a bulbous, radish-shaped organ 3&ndash;5 inches across that comes in multiple color ecotypes: cream/yellow, red/pink, purple/black, and mixed.</p>

                <p>Maca occupies one of the most extreme agricultural niches on Earth: the Junin plateau of central Peru, where temperatures fluctuate between 60&deg;F by day and below freezing at night, winds are constant, UV radiation is intense, and oxygen is thin. No other food crop is commercially cultivated at these altitudes, making maca a uniquely adapted organism with biochemistry shaped by extreme environmental stress.</p>

                <div class="info-box">
                    <h4>The Altitude Problem for Growers</h4>
                    <p>Maca&rsquo;s extreme-altitude adaptation makes it one of the most challenging plants in this guide to grow at normal elevations. At sea level or low altitudes, maca tends to bolt prematurely, produce thin roots, and generate fewer bioactive compounds. Success has been reported in cool-climate mountain regions (Appalachian highlands, Pacific Northwest mountains) and in controlled environments with cool temperatures and intense lighting. Most home growers will find it more practical to source maca as a dried powder rather than attempting cultivation.</p>
                </div>

                <h2>Growing Attempts at Low Altitude</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>Native Altitude</td><td>11,000&ndash;14,500 feet elevation</td></tr>
                        <tr><td>Temperature</td><td>Cool: 40&ndash;65&deg;F optimal; stunts in sustained heat above 75&deg;F</td></tr>
                        <tr><td>Light</td><td>Full sun with high UV exposure (native habitat)</td></tr>
                        <tr><td>Soil</td><td>Rocky, mineral-rich, well-drained; volcanic soils ideal; pH 5.0&ndash;7.0</td></tr>
                        <tr><td>Moisture</td><td>Moderate; consistent but not waterlogged</td></tr>
                        <tr><td>Growing Season</td><td>7&ndash;9 months from seed to root harvest</td></tr>
                    </tbody>
                </table>

                <p>For adventurous growers in cool-climate zones (5&ndash;7), fall sowing with winter root development may be possible. Treat it as an experiment. Sow seeds in late summer, allow the rosettes to establish in fall, and let roots develop through a cool winter. Harvest before summer heat arrives.</p>

                <h2>Color Ecotypes</h2>
                <p>Different maca colors are not merely cosmetic&mdash;they contain different ratios of bioactive compounds and are used for different purposes in traditional Andean practice:</p>
                <ul>
                    <li><strong>Yellow/cream:</strong> Most common (~60% of harvest); general energy and vitality; the most studied in clinical trials.</li>
                    <li><strong>Red/pink:</strong> Traditionally used for female hormonal balance, bone density, and prostate health. Higher glucosinolate content.</li>
                    <li><strong>Black/purple:</strong> Rarest and most prized; traditionally used for male fertility, memory, and physical endurance. Highest concentration of macamides.</li>
                </ul>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Macamides</td><td>Unique N-benzylamide compounds found only in maca; structurally similar to endocannabinoids</td></tr>
                        <tr><td>Macaenes</td><td>Unsaturated fatty acids unique to maca</td></tr>
                        <tr><td>Glucosinolates</td><td>Benzyl glucosinolate (primary), similar to those in broccoli and cabbage</td></tr>
                        <tr><td>Alkaloids</td><td>Macaridine, lepidiline A and B (imidazole alkaloids unique to maca)</td></tr>
                        <tr><td>Sterols</td><td>Beta-sitosterol, campesterol, ergosterol</td></tr>
                        <tr><td>Nutrients</td><td>High protein (10&ndash;14%), iron, calcium, copper, zinc, essential amino acids</td></tr>
                    </tbody>
                </table>

                <div class="info-box">
                    <h4>The Macamide Discovery</h4>
                    <p>Macamides are perhaps the most scientifically interesting compounds in maca. These N-benzylated fatty acid amides are structurally similar to the endocannabinoid anandamide and interact with the endocannabinoid system&mdash;a mechanism that could explain maca&rsquo;s effects on mood, energy, and libido without involving hormonal pathways. This discovery has shifted the scientific understanding of how maca works away from the earlier (and incorrect) assumption that it functioned as a phytoestrogen.</p>
                </div>

                <h2>Clinical Research</h2>
                <ul>
                    <li><strong>Sexual desire:</strong> Multiple RCTs demonstrate increased sexual desire in both men and women after 6&ndash;12 weeks of maca supplementation. Notably, these effects occur without changes in serum sex hormone levels, ruling out a direct hormonal mechanism.</li>
                    <li><strong>Male fertility:</strong> Clinical studies show improvements in semen quality (volume, count, motility) in men taking maca for 4&ndash;12 weeks. Black maca shows the strongest effect in comparative studies.</li>
                    <li><strong>Menopausal symptoms:</strong> Several RCTs report reductions in menopausal symptoms (hot flashes, mood disturbances, sleep disruption) without altering estrogen levels&mdash;a significant finding for women who cannot use hormone replacement therapy.</li>
                    <li><strong>Energy and mood:</strong> Clinical evidence for reduced fatigue, improved mood scores, and enhanced well-being, particularly in chronically fatigued and postmenopausal populations.</li>
                </ul>

                <h2>Traditional Processing</h2>
                <p>In Peru, maca roots are traditionally sun-dried for 10&ndash;30 days on the high-altitude plateau, where intense UV and freeze-thaw cycles transform the raw root into a dried, hard product that can be stored for years. The dried root is then reconstituted into porridge (<em>mazamorra</em>), fermented into a mild alcoholic drink (<em>maca chicha</em>), or ground into powder for use in baking, soups, and beverages. Gelatinized maca (pre-cooked to remove starch) is the form preferred in supplements for improved digestibility.</p>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Thyroid:</strong> Glucosinolate content may affect thyroid function in iodine-deficient individuals. Ensure adequate iodine intake if using maca regularly.</li>
                    <li><strong>Hormone-sensitive conditions:</strong> While maca does not appear to directly affect sex hormones, caution is advised in hormone-sensitive cancers until more data is available.</li>
                    <li><strong>Digestive sensitivity:</strong> Raw maca can cause bloating and gas; gelatinized forms are better tolerated.</li>
                    <li><strong>Generally well-tolerated:</strong> Clinical trials consistently report excellent safety profiles at standard doses (1.5&ndash;3g daily).</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Gonzales et al., <em>Evidence-Based Complementary and Alternative Medicine</em> (2012) &mdash; maca ethnobotany and clinical review</li>
                    <li>Shin et al., <em>BMC Complementary and Alternative Medicine</em> (2010) &mdash; sexual desire meta-analysis</li>
                    <li>Gonzales et al., <em>Asian Journal of Andrology</em> (2002) &mdash; semen quality study</li>
                    <li>Meissner et al., <em>International Journal of Biomedical Science</em> (2006) &mdash; menopausal symptoms</li>
                    <li>McCollom et al., <em>Phytochemistry</em> (2005) &mdash; macamide identification and characterization</li>
                </ol>`
},

{
  slug: 'cordyceps-mushroom', date: 'April 3, 2026', readTime: '13',
  title: 'Cordyceps (Cordyceps militaris): Full Guide to Cultivation, Athletic Performance &amp; Energy Research',
  metaDesc: 'Complete cordyceps cultivation guide covering Cordyceps militaris indoor grain substrate growing, cordycepin and adenosine chemistry, the parasitic wild species vs. cultivated forms, Tibetan yak herder origin story, and clinical research on exercise performance and oxygen utilization.',
  keywords: 'cordyceps cultivation, Cordyceps militaris, cordycepin, cordyceps growing, cordyceps athletic, cordyceps energy, medicinal mushroom cultivation, cordyceps oxygen',
  h1: 'Cordyceps (Cordyceps militaris): The &ldquo;Caterpillar Fungus&rdquo; That Athletes Use for Oxygen and You Can Grow in Jars',
  excerpt: 'A practical indoor cultivation guide for the orange club fungus that mimics the famous wild Himalayan caterpillar parasite, why cordycepin is the nucleoside analog attracting pharmaceutical interest, the story of Chinese runners who shattered world records (and were suspected of doping) after taking cordyceps, and what clinical science reveals about exercise performance and cellular energy.',
  body: `
                <h2>Biological Context: Wild vs. Cultivated</h2>
                <p>The cordyceps story begins with one of nature&rsquo;s most dramatic parasitic relationships. Wild <em>Cordyceps sinensis</em> (now <em>Ophiocordyceps sinensis</em>) is an entomopathogenic fungus that infects ghost moth caterpillars in the Tibetan Plateau, gradually consuming the larva from within and eventually sprouting a slender, finger-like fruiting body from the mummified caterpillar&rsquo;s head. This &ldquo;caterpillar fungus&rdquo; has been used in Tibetan and Chinese medicine for at least 500 years and currently commands prices of $20,000&ndash;$50,000+ per kilogram due to extreme scarcity and insatiable demand.</p>

                <p>The species we cultivate&mdash;<em>Cordyceps militaris</em>&mdash;is a different but related species that produces many of the same bioactive compounds (notably cordycepin) and can be grown on grain substrates without any insect host. <em>C. militaris</em> actually produces higher concentrations of cordycepin than wild <em>C. sinensis</em>, making it the superior choice for functional use.</p>

                <div class="info-box">
                    <h4>The 1993 Chinese Olympic Scandal</h4>
                    <p>Cordyceps gained worldwide attention in 1993 when Chinese female distance runners shattered multiple world records at the Chinese National Games by unprecedented margins. When accused of using performance-enhancing drugs, their coach Ma Junren attributed their performance to a training regimen that included cordyceps and turtle blood soup. All athletes passed drug tests. While the claim was viewed skeptically (many athletes from Ma&rsquo;s program later tested positive for EPO), it triggered enormous global interest in cordyceps for athletic performance.</p>
                </div>

                <h2>Indoor Cultivation</h2>
                <p>Cordyceps militaris is one of the few medicinal mushrooms that fruits readily on simple grain substrates in controlled indoor conditions, making it accessible to home cultivators.</p>

                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>Substrate</td><td>Brown rice, millet, or wheat berries supplemented with silkworm pupae powder or nutritional yeast</td></tr>
                        <tr><td>Container</td><td>Wide-mouth glass jars or polypropylene bags with filter patches</td></tr>
                        <tr><td>Sterilization</td><td>Pressure cook substrate at 15 PSI for 90 minutes; strict sterile technique required</td></tr>
                        <tr><td>Temperature (colonization)</td><td>68&ndash;72&deg;F in darkness; 3&ndash;4 weeks</td></tr>
                        <tr><td>Temperature (fruiting)</td><td>60&ndash;65&deg;F with 12-hour light cycle; 4&ndash;8 weeks</td></tr>
                        <tr><td>Light</td><td>Essential for fruiting; indirect natural light or LED grow lights (12/12 cycle)</td></tr>
                        <tr><td>Humidity</td><td>90&ndash;95% during fruiting</td></tr>
                    </tbody>
                </table>

                <p>The fruiting bodies are striking: bright orange to orange-red clubs, 2&ndash;5 inches tall, growing upward from the colonized substrate. Light direction determines growth orientation&mdash;clubs grow toward the light source. A single jar can produce multiple flushes over 2&ndash;3 months before the substrate is exhausted.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound</th><th>Notes</th></tr></thead>
                    <tbody>
                        <tr><td>Cordycepin (3'-deoxyadenosine)</td><td>Nucleoside analog; the primary bioactive; anti-inflammatory, anti-tumor, and anti-viral properties in research models; 2&ndash;8mg/g in C. militaris fruiting bodies</td></tr>
                        <tr><td>Adenosine</td><td>Purine nucleoside; vasodilator; involved in cellular energy (ATP) metabolism</td></tr>
                        <tr><td>Beta-glucans</td><td>Immunomodulatory polysaccharides; 10&ndash;30% of dry weight</td></tr>
                        <tr><td>Ergosterol</td><td>Vitamin D2 precursor; converts to vitamin D when UV-exposed</td></tr>
                        <tr><td>Mannitol (cordycepic acid)</td><td>Sugar alcohol; may support kidney function and reduce oxidative stress</td></tr>
                    </tbody>
                </table>

                <p>Cordycepin is structurally almost identical to adenosine (a building block of ATP, the body&rsquo;s energy currency) but lacks a hydroxyl group at the 3' position. This subtle structural difference allows it to interfere with various cellular processes including RNA synthesis, inflammation cascades, and tumor cell proliferation. It is currently under investigation as a pharmaceutical lead compound for cancer and inflammatory diseases.</p>

                <h2>Clinical Research</h2>
                <ul>
                    <li><strong>Exercise performance:</strong> A 2016 systematic review concluded that cordyceps supplementation may improve VO2 max and time to exhaustion in older adults, but effects in young trained athletes are inconsistent. A well-designed 2020 trial using <em>C. militaris</em> extract showed improved oxygen utilization during high-intensity cycling in recreational athletes.</li>
                    <li><strong>Respiratory function:</strong> Clinical studies in COPD and asthma patients show improvements in oxygen saturation and reduced dyspnea, consistent with the traditional Tibetan use for altitude sickness and breathing difficulties.</li>
                    <li><strong>Fatigue:</strong> Multiple trials demonstrate reduced perceived fatigue and improved energy levels in moderately fatigued adults over 4&ndash;12 week supplementation periods.</li>
                    <li><strong>Kidney function:</strong> Chinese clinical studies (variable quality) report improvements in kidney function markers in patients with chronic kidney disease, a use rooted in traditional Chinese medicine kidney-tonifying theory.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Blood sugar:</strong> May lower blood glucose; monitor if diabetic.</li>
                    <li><strong>Blood thinning:</strong> Cordycepin may inhibit platelet aggregation; caution with anticoagulants.</li>
                    <li><strong>Immunosuppressive drugs:</strong> Immune-modulating properties may interact with immunosuppressants.</li>
                    <li><strong>Autoimmune conditions:</strong> Standard caution for immune-modulating supplements.</li>
                    <li><strong>Wild vs. cultivated:</strong> Wild <em>C. sinensis</em> products are frequently adulterated or counterfeit due to extreme prices. Cultivated <em>C. militaris</em> is more reliable, better characterized, and more affordable.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Hirsch et al., <em>Journal of Dietary Supplements</em> (2017) &mdash; cordyceps and exercise performance systematic review</li>
                    <li>Dudgeon et al., <em>Journal of Strength and Conditioning Research</em> (2020) &mdash; C. militaris cycling performance</li>
                    <li>Tuli et al., <em>3 Biotech</em> (2014) &mdash; cordycepin pharmacology review</li>
                    <li>Zhu et al., <em>Journal of Alternative and Complementary Medicine</em> (1998) &mdash; clinical applications review</li>
                    <li>Shrestha et al., <em>Mycology</em> &mdash; C. militaris cultivation techniques</li>
                </ol>`
},

{
  slug: 'calea-zacatechichi', date: 'April 5, 2026', readTime: '10',
  title: 'Calea Zacatechichi (Dream Herb): Full Guide to Cultivation &amp; Ethnobotanical Context',
  metaDesc: 'Complete Calea zacatechichi cultivation guide covering dream herb botany, Mexican Chontal traditional use for oneirogen (dream-enhancing) purposes, germacranolide chemistry, growing in warm climates, and the limited scientific investigation.',
  keywords: 'Calea zacatechichi cultivation, dream herb, Calea ternifolia, oneirogen, lucid dreaming herb, Mexican dream herb, Chontal medicine',
  h1: 'Calea Zacatechichi (Dream Herb): The Mexican Plant That the Chontal People Use to Navigate Their Dreams',
  excerpt: 'A cultivation and ethnobotanical guide for one of the most unusual plants in the Americas&mdash;the bitter Oaxacan herb that Chontal Zapotec shamans use to induce vivid, prophetic dreams, what limited scientific investigation has found about its effects on sleep architecture, and how to grow it in warm climates.',
  body: `
                <h2>Botanical Description</h2>
                <p>Calea zacatechichi (<em>Calea ternifolia</em> var. <em>ternifolia</em>) is a sprawling, semi-woody shrub in the Asteraceae family, native to the highlands of central Mexico, particularly the states of Oaxaca, Veracruz, and Chiapas. The plant grows 3&ndash;5 feet tall with opposite, ovate, slightly rough-textured leaves and small, white to yellowish composite flowers. The entire plant has an intensely bitter taste that is almost universally described as unpleasant.</p>

                <p>The common name &ldquo;dream herb&rdquo; or &ldquo;leaf of the god&rdquo; (<em>thle-pelakano</em> in Chontal) reflects its unique traditional use as an oneirogen&mdash;a substance used to enhance, clarify, or induce dreams. This places it in a rare ethnobotanical category alongside only a handful of other plants worldwide that are used specifically for dream modification.</p>

                <div class="info-box">
                    <h4>Ethnobotanical Context</h4>
                    <p>The Chontal (Tequistlatec) people of Oaxaca use calea as a divination tool. Before sleep, a tea is prepared from the dried leaves or the leaves are smoked. The resulting dreams are believed to carry messages from the spirit world that can reveal the causes of illness, locate lost objects, or predict future events. This practice was documented by Mexican ethnobotanist Thomas MacDougall in the 1960s and later studied by researchers at the National Autonomous University of Mexico. The use is deeply embedded in Chontal healing practices and should be understood within that cultural framework.</p>
                </div>

                <h2>Growing Requirements</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>9b&ndash;11 (perennial); greenhouse or annual in cooler zones</td></tr>
                        <tr><td>Light</td><td>Full sun to partial shade</td></tr>
                        <tr><td>Soil</td><td>Well-drained, moderately fertile; pH 6.0&ndash;7.5</td></tr>
                        <tr><td>Moisture</td><td>Moderate; does not tolerate waterlogging or extended drought</td></tr>
                        <tr><td>Temperature</td><td>60&ndash;90&deg;F; growth slows below 55&deg;F; frost-sensitive</td></tr>
                        <tr><td>Propagation</td><td>Stem cuttings (easiest), seed (erratic germination), or layering</td></tr>
                    </tbody>
                </table>

                <p>In Central Texas, calea can be grown as a summer annual or maintained in containers that are moved indoors during winter. It grows vigorously in warm conditions and responds well to regular pruning, which promotes bushy growth. The plant is relatively pest-free, likely due to its intense bitterness.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Sesquiterpene Lactones</td><td>Germacranolides (caleicin, caleochromene); responsible for intense bitterness</td></tr>
                        <tr><td>Flavonoids</td><td>Acacetin, hispidulin, salvigenin</td></tr>
                        <tr><td>Chromenes</td><td>Various benzochromene derivatives</td></tr>
                    </tbody>
                </table>

                <p>The specific compound(s) responsible for the reported oneirogenic effects have not been conclusively identified. The germacranolide sesquiterpene lactones are the most studied fraction, but the mechanism of dream enhancement remains unknown. Some researchers have speculated about effects on cholinergic neurotransmission during REM sleep, but this remains unconfirmed.</p>

                <h2>Scientific Investigation</h2>
                <div class="info-box">
                    <h4>Very Limited Research</h4>
                    <p>Calea has received remarkably little scientific attention. The most cited study is a 1986 investigation by Mayagoitia and colleagues that found calea extract increased the number of superficial sleep episodes and hypnagogic imagery in healthy volunteers compared to placebo, providing some objective support for the ethnobotanical claims. No large-scale clinical trials have been conducted.</p>
                </div>

                <ul>
                    <li><strong>Sleep architecture:</strong> The 1986 study reported increased light sleep stages and hypnagogic imagery, consistent with enhanced dream recall.</li>
                    <li><strong>Anti-inflammatory:</strong> Germacranolides demonstrate anti-inflammatory activity in preclinical models.</li>
                    <li><strong>Antimicrobial:</strong> Leaf extracts show broad-spectrum antimicrobial activity in vitro.</li>
                </ul>

                <h2>Preparation and Use</h2>
                <ul>
                    <li><strong>Tea:</strong> Traditional preparation involves steeping 3&ndash;5 grams of dried leaf in hot water. The tea is extremely bitter and is typically consumed quickly rather than sipped.</li>
                    <li><strong>Smoke:</strong> Dried leaves are sometimes smoked before bed in traditional practice. This is the least studied and least recommended route of administration.</li>
                    <li><strong>Timing:</strong> Taken 30&ndash;60 minutes before sleep for reported effects on dream vividness and recall.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Limited safety data:</strong> Very few formal safety studies exist. Use with caution and in moderation.</li>
                    <li><strong>Pregnancy and lactation:</strong> Avoid; no safety data available.</li>
                    <li><strong>Bitter taste:</strong> The extreme bitterness may cause nausea in some individuals.</li>
                    <li><strong>Legal status:</strong> Legal in the United States; restricted in some countries (check local regulations).</li>
                    <li><strong>Set and setting:</strong> As with any psychoactive plant, context, intention, and moderation matter.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Mayagoitia et al., <em>Journal of Ethnopharmacology</em> (1986) &mdash; psychopharmacological study</li>
                    <li>MacDougall, <em>Economic Botany</em> (1968) &mdash; ethnobotanical documentation</li>
                    <li>Schultes &amp; Hofmann, <em>Plants of the Gods</em> &mdash; ethnobotanical context</li>
                    <li>Wu et al., <em>Phytochemistry</em> &mdash; germacranolide characterization</li>
                    <li>Leonti et al., <em>Journal of Ethnopharmacology</em> &mdash; Asteraceae in Mexican traditional medicine</li>
                </ol>`
},

];

let count = 0;
plants.forEach(plant => {
  const filename = `${plant.slug}-cultivation-guide.html`;
  const filepath = path.join(ARTICLES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, generateArticle(plant), 'utf8');
    count++;
    console.log(`Created: ${filename}`);
  } else {
    console.log(`Skipped (exists): ${filename}`);
  }
});
console.log(`\nGenerated ${count} new articles.`);
