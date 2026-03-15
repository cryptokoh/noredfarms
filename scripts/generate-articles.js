#!/usr/bin/env node
// Generate cultivation guide articles from plant data
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

// ─── PLANT DATA ────────────────────────────────────────────────────────
const plants = [

// ── 1. RHODIOLA ────────────────────────────────────────
{
  slug: 'rhodiola',
  title: 'Rhodiola rosea: Full Guide to Cultivation, Adaptogenic Science &amp; Uses',
  metaDesc: 'Complete rhodiola cultivation guide covering arctic-alpine growing, roseroot propagation, salidroside and rosavin chemistry, Viking history, and clinical research on fatigue and mental performance.',
  keywords: 'rhodiola cultivation, Rhodiola rosea, roseroot, salidroside, rosavin, adaptogen growing, arctic herbs, rhodiola fatigue',
  date: 'February 24, 2026',
  readTime: '14',
  h1: 'Rhodiola (Rhodiola rosea): The Arctic Adaptogen That Vikings Used to Survive the North',
  excerpt: 'A grower&rsquo;s guide to one of the most challenging medicinal plants to cultivate outside its native tundra, why its golden root smells like roses, the salidroside and rosavin compounds that drive clinical interest, and what decades of Soviet and Western research reveal about combating fatigue.',
  body: `
                <h2>Botanical Description</h2>
                <p>Rhodiola (<em>Rhodiola rosea</em>), also called roseroot, golden root, or arctic root, is a succulent perennial in the Crassulaceae family native to high-altitude and arctic regions of Europe, Asia, and North America. The plant forms compact rosettes of fleshy, blue-green leaves on short stems rising from a thick, knotted rhizome. When cut or scraped, the rhizome releases a distinctive rose-like fragrance&mdash;the source of both the species name <em>rosea</em> and the common name roseroot.</p>

                <p>Plants are typically dioecious (separate male and female plants), with small yellow-to-greenish flowers clustered at stem tips. The entire plant rarely exceeds 12&ndash;16 inches in height, an adaptation to the extreme wind, cold, and UV exposure of its native high-altitude and arctic habitats. Rhodiola is found growing wild on sea cliffs in Scandinavia, alpine scree slopes in the Alps, and rocky tundra across Siberia and northern Canada.</p>

                <div class="info-box">
                    <h4>A Genuinely Difficult Crop</h4>
                    <p>Unlike most herbs in this guide, rhodiola presents real cultivation challenges for lowland growers. The plant evolved in environments with long winter dormancy, cool summers, intense UV, thin rocky soil, and excellent drainage. Replicating these conditions in Texas or the Southeast is possible but requires deliberate effort. Container culture in a gritty, mineral-rich substrate with winter cold exposure is the most reliable approach for warm-climate growers.</p>
                </div>

                <h2>Origin and Traditional Use</h2>
                <p>Rhodiola has a documented history spanning at least 2,000 years across multiple cultures that independently discovered its energizing properties. Greek physician Dioscorides described <em>rodia riza</em> in 77 CE. Vikings consumed rhodiola to enhance physical endurance during long voyages and raids. Siberian shamans used it as a tonic and offered it as a wedding gift to promote fertility and resilience.</p>

                <p>The modern scientific interest in rhodiola emerged from Soviet military and space program research during the Cold War. Soviet scientists classified it as an adaptogen&mdash;a substance that increases non-specific resistance to stress&mdash;and studied it extensively for improving performance of soldiers, athletes, and cosmonauts. Much of this research remained classified or published only in Russian until the 1990s.</p>

                <h2>Climate and Growing Requirements</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>1&ndash;7 (native); struggles in zones 8+</td></tr>
                        <tr><td>Light</td><td>Full sun (required); tolerates extreme UV</td></tr>
                        <tr><td>Moisture</td><td>Low to moderate; excellent drainage essential</td></tr>
                        <tr><td>Temperature</td><td>Optimal growth at 50&ndash;65&deg;F; heat above 80&deg;F stresses plants</td></tr>
                        <tr><td>Frost Tolerance</td><td>Exceptional; survives -50&deg;F and below</td></tr>
                        <tr><td>Winter Requirement</td><td>Mandatory cold dormancy period of 12&ndash;16 weeks below 40&deg;F</td></tr>
                    </tbody>
                </table>

                <h2>Soil and Cultivation</h2>
                <table class="spec-table">
                    <thead><tr><th>Factor</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>Soil Type</td><td>Rocky, mineral-rich, fast-draining; 70% mineral (gravel, perlite, pumice), 30% organic</td></tr>
                        <tr><td>pH</td><td>5.5&ndash;7.0</td></tr>
                        <tr><td>Propagation</td><td>Seed (cold stratify 4&ndash;6 weeks; slow germination), division of mature rhizomes</td></tr>
                        <tr><td>Spacing</td><td>8&ndash;12 inches; slow-growing</td></tr>
                        <tr><td>Time to Harvest</td><td>5&ndash;7 years from seed to harvestable rhizome</td></tr>
                        <tr><td>Fertilization</td><td>None to minimal; lean growing increases compound concentration</td></tr>
                    </tbody>
                </table>

                <p>The 5&ndash;7 year timeline from seed to harvest is the single largest barrier to rhodiola cultivation. The plant grows extremely slowly, particularly in its first 2&ndash;3 years. Commercial rhodiola farming in Scandinavia and Alberta, Canada uses field-scale operations with multi-year crop rotations. Home growers should view rhodiola as a long-term perennial investment rather than an annual crop.</p>

                <h2>Phytochemical Profile</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Phenylpropanoids</td><td>Rosavin, rosin, rosarin (unique to R. rosea)</td></tr>
                        <tr><td>Phenylethanoids</td><td>Salidroside (tyrosol glycoside; shared with other Rhodiola species)</td></tr>
                        <tr><td>Flavonoids</td><td>Rhodiolin, rhodionin, rhodiosin, acetylrodalgin</td></tr>
                        <tr><td>Monoterpenes</td><td>Rosiridol, rosaridin</td></tr>
                        <tr><td>Organic Acids</td><td>Gallic acid, caffeic acid, chlorogenic acid</td></tr>
                    </tbody>
                </table>

                <p>Commercial rhodiola extracts are typically standardized to contain a minimum 3% rosavins and 1% salidroside, reflecting the naturally occurring ratio in high-quality root material. This standardization is important because different Rhodiola species (there are over 90) contain varying profiles, and only <em>R. rosea</em> contains the rosavin family of compounds.</p>

                <h2>Clinical Research</h2>
                <div class="info-box">
                    <h4>Research Quality Note</h4>
                    <p>Rhodiola has a strong clinical evidence base by adaptogen standards, with multiple well-designed RCTs conducted in Scandinavia, Russia, and the UK. However, the Soviet-era research (which forms the historical foundation) was often published without the methodological transparency expected by modern standards. Post-2000 Western trials have generally confirmed earlier findings on fatigue and mental performance.</p>
                </div>

                <ul>
                    <li><strong>Mental fatigue:</strong> Multiple RCTs demonstrate significant improvements in cognitive function, attention, and mental work capacity under stressful conditions including sleep deprivation, academic examinations, and military training.</li>
                    <li><strong>Physical endurance:</strong> Evidence for improved exercise capacity and reduced perceived exertion, though effect sizes are modest and some studies show null results.</li>
                    <li><strong>Stress-related fatigue:</strong> The strongest clinical domain, with several trials showing significant improvements in burnout symptoms, fatigue scores, and quality of life measures in chronically stressed adults.</li>
                    <li><strong>Mild-to-moderate depression:</strong> Preliminary clinical evidence suggests antidepressant effects, with one notable trial comparing rhodiola favorably to sertraline with fewer side effects.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Stimulating nature:</strong> Rhodiola is energizing rather than calming. Take in the morning; evening doses may interfere with sleep.</li>
                    <li><strong>Bipolar disorder:</strong> May trigger manic episodes in susceptible individuals due to stimulating properties.</li>
                    <li><strong>Autoimmune conditions:</strong> Immunomodulatory effects warrant caution in autoimmune disorders.</li>
                    <li><strong>Blood pressure:</strong> May lower blood pressure; caution with antihypertensive medications.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Panossian et al., <em>Phytomedicine</em> (2010) &mdash; systematic review of rhodiola clinical trials</li>
                    <li>Mao et al., <em>Journal of Clinical Psychiatry</em> (2015) &mdash; rhodiola vs. sertraline for depression</li>
                    <li>Darbinyan et al., <em>Phytomedicine</em> (2000) &mdash; mental fatigue RCT</li>
                    <li>Olsson et al., <em>Planta Medica</em> (2009) &mdash; stress-related fatigue</li>
                    <li>European Medicines Agency, Herbal Monograph on Rhodiola rosea</li>
                    <li>Galambosi, <em>Medicinal and Aromatic Plants</em> &mdash; rhodiola cultivation in Finland</li>
                </ol>`
},

// ── 2. SKULLCAP ────────────────────────────────────────
{
  slug: 'skullcap',
  title: 'Skullcap (Scutellaria lateriflora): Full Guide to Cultivation &amp; Nervine Science',
  metaDesc: 'Complete skullcap cultivation guide covering American skullcap botany, wetland growing, baicalin chemistry, traditional nervine use, anxiety research, and the adulteration problem in the supplement market.',
  keywords: 'skullcap cultivation, Scutellaria lateriflora, American skullcap, baicalin, nervine herbs, skullcap anxiety, skullcap growing guide',
  date: 'February 26, 2026',
  readTime: '12',
  h1: 'Skullcap (Scutellaria lateriflora): The Quiet Nervine That Outperforms Its Reputation',
  excerpt: 'A guide to growing American skullcap in moist garden conditions, its long history as a nervine tonic, why the supplement market is plagued by germander adulteration, and the emerging clinical evidence for anxiety relief without sedation.',
  body: `
                <h2>Botanical Description</h2>
                <p>American skullcap (<em>Scutellaria lateriflora</em>) is a slender, branching perennial in the mint family (Lamiaceae) native to moist habitats across North America, from stream banks and wet meadows to woodland edges and marshes. The plant grows 12&ndash;30 inches tall with opposite, toothed leaves and distinctive small blue-to-violet flowers arranged in one-sided racemes along the upper stems.</p>

                <p>The common name &ldquo;skullcap&rdquo; refers to the calyx&mdash;the cup-shaped structure at the base of each flower that resembles a miniature medieval helmet or skull cap. After flowering, the calyx closes and develops a distinctive crest on the upper lip, a feature diagnostic of the genus <em>Scutellaria</em>.</p>

                <div class="info-box">
                    <h4>Two Very Different Skullcaps</h4>
                    <p>American skullcap (<em>S. lateriflora</em>) and Chinese skullcap (<em>S. baicalensis</em>) are frequently confused in commerce and literature despite being different species with different phytochemical profiles and traditional uses. American skullcap is the Western nervine herb; Chinese skullcap (huang qin) is an anti-inflammatory and antimicrobial herb in Traditional Chinese Medicine. Both contain flavonoids, but in different proportions and with different clinical applications. This article covers the American species exclusively.</p>
                </div>

                <h2>Habitat and Growing Requirements</h2>
                <p>Skullcap is a moisture-loving plant that thrives in conditions most herbs would find intolerable. It naturally inhabits stream margins, flood plains, and damp woodland clearings where the soil stays consistently moist through the growing season.</p>

                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>3&ndash;8</td></tr>
                        <tr><td>Light</td><td>Partial shade to full sun (with moisture); dappled woodland light ideal</td></tr>
                        <tr><td>Moisture</td><td>High; consistently moist soil required; tolerates periodic flooding</td></tr>
                        <tr><td>Soil</td><td>Rich, organic, slightly acidic; pH 5.5&ndash;7.0</td></tr>
                        <tr><td>Frost Tolerance</td><td>Excellent; winter-hardy throughout its range</td></tr>
                        <tr><td>Heat Tolerance</td><td>Moderate; requires shade and irrigation in hot climates</td></tr>
                    </tbody>
                </table>

                <h2>Cultivation and Propagation</h2>
                <table class="spec-table">
                    <thead><tr><th>Factor</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>Propagation</td><td>Seed (cold stratify 2 weeks), stem cuttings, or division</td></tr>
                        <tr><td>Germination</td><td>14&ndash;28 days; erratic without stratification</td></tr>
                        <tr><td>Spacing</td><td>10&ndash;15 inches; spreads by underground runners</td></tr>
                        <tr><td>Companion Plants</td><td>Pairs well with other moisture-lovers: bee balm, boneset, Joe Pye weed</td></tr>
                        <tr><td>Harvest Timing</td><td>Aerial parts during peak flowering; second-year plants preferred</td></tr>
                    </tbody>
                </table>

                <p>In Texas, skullcap benefits from placement in a rain garden, along a drip line, or in a consistently irrigated shade bed. It will not survive the dry, exposed conditions that suit rosemary or lavender. Container culture in a self-watering pot placed in partial shade is a practical alternative for arid-climate growers.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Flavonoids</td><td>Baicalin, baicalein, scutellarein, wogonin, chrysin, oroxylin A</td></tr>
                        <tr><td>Iridoids</td><td>Catalpol (minor component)</td></tr>
                        <tr><td>Amino Acids</td><td>GABA (present in fresh leaf tissue)</td></tr>
                        <tr><td>Volatile Terpenoids</td><td>Minor volatile oil fraction</td></tr>
                    </tbody>
                </table>

                <p>Baicalin and its aglycone baicalein are the primary flavonoids of interest. Research suggests these compounds modulate GABA-A receptors similarly to benzodiazepines but with greater selectivity, potentially explaining the anxiolytic effects without significant sedation that traditional herbalists have long observed.</p>

                <h2>The Adulteration Problem</h2>
                <div class="info-box">
                    <h4>Buyer Beware</h4>
                    <p>American skullcap is one of the most frequently adulterated herbs in commerce. Cheaper germander (<em>Teucrium</em> species) has been substituted for skullcap in supplements, and germander is hepatotoxic&mdash;it can cause serious liver damage. Several cases of &ldquo;skullcap hepatotoxicity&rdquo; in the medical literature are now believed to have been caused by germander contamination rather than genuine skullcap. Growing your own or purchasing from verified sources with identity-tested material is strongly recommended.</p>
                </div>

                <h2>Traditional and Functional Uses</h2>
                <ul>
                    <li><strong>Nervous system support:</strong> The primary traditional use. Classified as a &ldquo;nervine tonic&rdquo;&mdash;an herb that calms and nourishes the nervous system without significant sedation.</li>
                    <li><strong>Anxiety and tension:</strong> Used for nervous tension, worry, circular thinking, and the inability to &ldquo;switch off&rdquo; at the end of the day.</li>
                    <li><strong>Sleep onset:</strong> Taken before bed as a tea or tincture to ease the transition into sleep, particularly when racing thoughts are the barrier.</li>
                    <li><strong>Muscle tension:</strong> Included in formulas for tension headaches and stress-related muscle tightness.</li>
                </ul>

                <h2>Clinical Research</h2>
                <ul>
                    <li><strong>Anxiety:</strong> A notable 2003 double-blind crossover study reported that skullcap significantly reduced anxiety in healthy volunteers without causing sedation. A 2014 pilot study confirmed anxiolytic effects and called for larger confirmatory trials.</li>
                    <li><strong>Safety:</strong> When genuine <em>S. lateriflora</em> is used (verified by authentication testing), clinical trials consistently report no significant adverse effects and no liver enzyme elevations.</li>
                    <li><strong>GABAergic mechanism:</strong> In vitro studies confirm positive allosteric modulation of GABA-A receptors by skullcap flavonoids, providing a plausible mechanism for the traditional anxiolytic use.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Source verification:</strong> Only use authenticated <em>S. lateriflora</em> to avoid germander substitution.</li>
                    <li><strong>Pregnancy:</strong> Insufficient safety data; traditionally avoided during pregnancy.</li>
                    <li><strong>Sedative interactions:</strong> May potentiate prescription anxiolytics and sedatives.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Wolfson &amp; Hoffmann, <em>Alternative Therapies</em> (2003) &mdash; anxiolytic RCT</li>
                    <li>Brock et al., <em>Phytotherapy Research</em> (2014) &mdash; anxiolytic pilot study</li>
                    <li>Liao et al., <em>Phytomedicine</em> &mdash; GABA receptor modulation studies</li>
                    <li>Awad et al., <em>Phytomedicine</em> &mdash; adulteration and hepatotoxicity review</li>
                    <li>American Herbal Pharmacopoeia, Monograph on Scutellaria lateriflora</li>
                </ol>`
},

// ── 3. CHAMOMILE ────────────────────────────────────────
{
  slug: 'chamomile',
  title: 'Chamomile (Matricaria chamomilla): Full Guide to Cultivation, Tea Science &amp; Research',
  metaDesc: 'Complete chamomile cultivation guide covering German chamomile botany, self-seeding strategies, apigenin and bisabolol chemistry, the world\'s most popular herbal tea, and clinical evidence for anxiety and sleep.',
  keywords: 'chamomile cultivation, Matricaria chamomilla, German chamomile, apigenin, chamomile tea, chamomile growing, chamomile anxiety, chamomile sleep',
  date: 'February 28, 2026',
  readTime: '11',
  h1: 'Chamomile (Matricaria chamomilla): Why the World&rsquo;s Most Popular Herbal Tea Deserves Its Reputation',
  excerpt: 'A complete growing guide for German chamomile covering self-seeding garden naturalization, the sweet apple-scented chemistry behind its calming effects, why apigenin is the compound getting clinical attention, and how this humble daisy-like flower holds up under rigorous scientific scrutiny.',
  body: `
                <h2>Botanical Description</h2>
                <p>German chamomile (<em>Matricaria chamomilla</em>, syn. <em>M. recutita</em>) is a delicate, aromatic annual in the Asteraceae (daisy) family, native to Europe and Western Asia but now naturalized worldwide. Plants grow 12&ndash;24 inches tall with finely divided, feathery leaves and iconic white-petaled, yellow-centered flower heads that emit a distinctive sweet, apple-like fragrance&mdash;the name &ldquo;chamomile&rdquo; derives from the Greek <em>chamaimelon</em>, meaning &ldquo;earth apple.&rdquo;</p>

                <p>German chamomile should be distinguished from Roman chamomile (<em>Chamaemelum nobile</em>), a creeping perennial with a somewhat different phytochemical profile. German chamomile is the species used in most clinical research and the source of the characteristic blue essential oil containing chamazulene.</p>

                <div class="info-box">
                    <h4>The Self-Seeding Strategy</h4>
                    <p>Chamomile is one of the most effective self-seeding herbs you can grow. A single planting that is allowed to set seed will produce volunteer chamomile for years, creating a naturalized patch that returns reliably each spring. In mild climates, fall-sown chamomile overwinters as rosettes and flowers earlier than spring-sown plants. The key is simply to stop deadheading late in the season and let the final flush of flowers go to seed.</p>
                </div>

                <h2>Climate and Cultivation</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>2&ndash;9 (annual; self-seeds in all zones)</td></tr>
                        <tr><td>Light</td><td>Full sun to light shade</td></tr>
                        <tr><td>Soil</td><td>Average to poor; well-drained; pH 5.6&ndash;7.5</td></tr>
                        <tr><td>Moisture</td><td>Low to moderate; drought-tolerant once established</td></tr>
                        <tr><td>Spacing</td><td>6&ndash;8 inches; creates a lovely ground-cover effect when dense</td></tr>
                        <tr><td>Germination</td><td>7&ndash;14 days; surface sow (needs light); tiny seeds</td></tr>
                    </tbody>
                </table>

                <p>Chamomile thrives in lean, well-drained soil and actually produces more essential oil under slightly stressed conditions. Rich, heavily fertilized soil produces tall, leggy plants with fewer flowers and less aromatic potency. This makes chamomile ideal for poor garden spots, pathways, and dry, sunny areas where other plants struggle.</p>

                <h2>Harvesting</h2>
                <p>Harvest flower heads when petals are fully open and horizontal (not yet reflexed backward). Morning harvest after dew dries captures peak essential oil content. Chamomile flowers open progressively over several weeks, so regular harvesting (every 2&ndash;3 days at peak bloom) is necessary to capture flowers at their best.</p>

                <p>A chamomile rake or comb&mdash;a simple fork-toothed tool dragged through the plant&mdash;dramatically speeds harvest of the tiny flower heads. Hand-picking is meditative but slow. Dry flowers immediately at low temperatures (95&ndash;105&deg;F) in single layers. Properly dried chamomile retains its apple-like aroma and maintains potency for 1&ndash;2 years.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Flavonoids</td><td>Apigenin (primary bioactive), apigenin-7-glucoside, luteolin, quercetin</td></tr>
                        <tr><td>Terpenoids</td><td>Alpha-bisabolol, bisabolol oxides, chamazulene (blue; forms during distillation)</td></tr>
                        <tr><td>Coumarins</td><td>Herniarin, umbelliferone</td></tr>
                        <tr><td>Phenolic Acids</td><td>Caffeic acid, chlorogenic acid, ferulic acid</td></tr>
                    </tbody>
                </table>

                <p>Apigenin is the compound drawing the most clinical attention. It binds to benzodiazepine receptors on GABA-A channels but acts as a partial agonist rather than a full agonist like pharmaceutical benzodiazepines. This may explain why chamomile produces anxiolytic effects without the sedation, dependence risk, or cognitive impairment associated with benzodiazepine drugs.</p>

                <h2>Traditional and Culinary Uses</h2>
                <ul>
                    <li><strong>Tea:</strong> The most consumed herbal tea globally. An estimated one million cups of chamomile tea are consumed daily worldwide. Traditional preparation uses 1 tablespoon of dried flowers per cup, steeped covered for 5&ndash;10 minutes.</li>
                    <li><strong>Digestive comfort:</strong> Traditional European &ldquo;after-dinner&rdquo; tea for bloating, gas, and mild stomach upset. Included in the German Commission E list for gastrointestinal spasms.</li>
                    <li><strong>Children&rsquo;s herb:</strong> One of the gentlest medicinal herbs, traditionally considered safe for infants and children for teething pain, colic, and restless sleep.</li>
                    <li><strong>Topical:</strong> Used in skin creams, eye compresses, and bath preparations for irritation and inflammation.</li>
                </ul>

                <h2>Clinical Research</h2>
                <div class="info-box">
                    <h4>Solid Clinical Foundation</h4>
                    <p>Chamomile benefits from an unusually strong clinical evidence base for an herbal medicine, including several large, well-designed RCTs at major academic medical centers, including a pivotal University of Pennsylvania trial on generalized anxiety disorder.</p>
                </div>

                <ul>
                    <li><strong>Generalized anxiety disorder:</strong> A landmark 2009 RCT at the University of Pennsylvania found chamomile extract significantly reduced anxiety scores in patients with mild-to-moderate GAD compared to placebo. A 2016 follow-up demonstrated sustained benefit over 8 weeks with good tolerability.</li>
                    <li><strong>Sleep quality:</strong> Multiple trials report improvements in subjective sleep quality, particularly in elderly and postpartum populations.</li>
                    <li><strong>Anti-inflammatory (topical):</strong> Clinical evidence supports topical chamomile for mild skin inflammation, eczema, and wound healing.</li>
                    <li><strong>Gastrointestinal:</strong> Evidence supports use for functional dyspepsia and mild digestive discomfort.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Asteraceae allergy:</strong> Cross-reactivity with ragweed, chrysanthemums, and other daisy-family plants. Allergic reactions are uncommon but documented.</li>
                    <li><strong>Blood thinners:</strong> Coumarin content may theoretically interact with anticoagulants, though clinical significance at tea-drinking doses is uncertain.</li>
                    <li><strong>Pregnancy:</strong> Culinary tea amounts are generally considered safe; concentrated extracts lack sufficient safety data.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Amsterdam et al., <em>Journal of Clinical Psychopharmacology</em> (2009) &mdash; GAD RCT</li>
                    <li>Mao et al., <em>Phytomedicine</em> (2016) &mdash; long-term chamomile for GAD</li>
                    <li>Srivastava et al., <em>Molecular Medicine Reports</em> (2010) &mdash; chamomile review</li>
                    <li>German Commission E Monograph &mdash; Matricaria flowers</li>
                    <li>Singh et al., <em>Journal of Advanced Nursing</em> &mdash; chamomile and sleep quality</li>
                    <li>WHO Monographs on Selected Medicinal Plants &mdash; chamomile</li>
                </ol>`
},

// ── 4. ECHINACEA ────────────────────────────────────────
{
  slug: 'echinacea',
  title: 'Echinacea (Echinacea purpurea): Full Guide to Cultivation, Immune Science &amp; Prairie Ecology',
  metaDesc: 'Complete echinacea cultivation guide covering purple coneflower botany, prairie restoration planting, alkamide and polysaccharide chemistry, immune-stimulating research, and the cold remedy debate.',
  keywords: 'echinacea cultivation, Echinacea purpurea, purple coneflower, coneflower growing, echinacea immune, alkamides, echinacea cold remedy, prairie plants',
  date: 'March 2, 2026',
  readTime: '13',
  h1: 'Echinacea (Echinacea purpurea): Prairie Icon, Pollinator Magnet, and the Most Debated Immune Herb in History',
  excerpt: 'A dual-purpose guide to echinacea as both a stunning native prairie plant for pollinator gardens and a medicinal herb with one of the most contentious research histories in herbal medicine&mdash;covering why clinical trials have produced wildly inconsistent results and what the best evidence actually shows.',
  body: `
                <h2>Botanical Description</h2>
                <p>Echinacea (<em>Echinacea purpurea</em>) is a robust, long-lived perennial in the Asteraceae family, native to the tallgrass prairies and open woodlands of eastern and central North America. Plants grow 2&ndash;4 feet tall with coarse, dark green leaves and large, showy flower heads featuring drooping pink-to-purple ray petals surrounding a distinctive raised, spiny central cone that gives the genus its name (from the Greek <em>echinos</em>, meaning hedgehog).</p>

                <p>Nine species of <em>Echinacea</em> are recognized, all native to North America. Three are used medicinally: <em>E. purpurea</em> (the most commonly cultivated and studied), <em>E. angustifolia</em> (narrow-leaf coneflower, preferred by many herbalists), and <em>E. pallida</em> (pale purple coneflower). Each species has a somewhat different phytochemical profile, which complicates research interpretation considerably.</p>

                <h2>Ecological and Garden Value</h2>
                <div class="info-box">
                    <h4>Pollinator Powerhouse</h4>
                    <p>Before discussing echinacea&rsquo;s medicinal controversy, it&rsquo;s worth emphasizing its exceptional ecological value. Echinacea is one of the top 10 pollinator-attracting native plants in North America. The flowers provide nectar for butterflies (especially monarchs and swallowtails), native bees, and hummingbirds. The spiny seed heads feed goldfinches through winter. A patch of echinacea in bloom is a living insectary that benefits the entire garden ecosystem.</p>
                </div>

                <h2>Climate and Growing Requirements</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>3&ndash;9</td></tr>
                        <tr><td>Light</td><td>Full sun (6+ hours); tolerates light shade</td></tr>
                        <tr><td>Soil</td><td>Well-drained; tolerates poor, rocky, and clay soils; pH 6.0&ndash;8.0</td></tr>
                        <tr><td>Moisture</td><td>Low to moderate; drought-tolerant once established</td></tr>
                        <tr><td>Frost Tolerance</td><td>Excellent; deep taproot system ensures winter survival</td></tr>
                        <tr><td>Heat Tolerance</td><td>Excellent; native to hot prairie environments</td></tr>
                    </tbody>
                </table>

                <p>Echinacea is superbly adapted to Texas growing conditions. It handles heat, drought, poor soil, and full sun with ease. In fact, it is native to the southern Great Plains and may already be growing wild in your area. The primary challenge is establishment in the first year&mdash;once the deep taproot develops, plants are essentially indestructible and will persist for 10+ years.</p>

                <h2>Cultivation</h2>
                <table class="spec-table">
                    <thead><tr><th>Factor</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>Propagation</td><td>Seed (cold stratify 4&ndash;6 weeks for best germination), division, or root cuttings</td></tr>
                        <tr><td>Germination</td><td>10&ndash;21 days at 65&ndash;70&deg;F after stratification</td></tr>
                        <tr><td>Spacing</td><td>18&ndash;24 inches; plants form substantial clumps over time</td></tr>
                        <tr><td>Establishment</td><td>First-year plants focus on root development; expect minimal flowering</td></tr>
                        <tr><td>Fertilization</td><td>None needed; excess fertility produces weak, floppy growth</td></tr>
                    </tbody>
                </table>

                <h2>Harvesting for Medicinal Use</h2>
                <h3>Aerial Parts</h3>
                <p>Harvest leaves, stems, and flowers during peak bloom in the second year or later. Cut stems back to 6&ndash;8 inches above ground. Multiple harvests per season are possible.</p>

                <h3>Roots</h3>
                <p>Root harvest is typically done in fall of the third or fourth year, when the taproot has developed substantial mass. The roots contain the highest concentration of alkamides and produce the characteristic tingling sensation on the tongue that herbalists use as a quality indicator.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound Class</th><th>Key Members</th></tr></thead>
                    <tbody>
                        <tr><td>Alkamides (Alkylamides)</td><td>Isobutylamides (cause tongue tingling); primary in E. purpurea and E. angustifolia roots</td></tr>
                        <tr><td>Caffeic Acid Derivatives</td><td>Cichoric acid (E. purpurea), echinacoside (E. angustifolia, E. pallida)</td></tr>
                        <tr><td>Polysaccharides</td><td>Arabinogalactans, fucogalactoxyloglucans (immune-active)</td></tr>
                        <tr><td>Glycoproteins</td><td>Immunostimulatory glycoproteins</td></tr>
                    </tbody>
                </table>

                <h2>The Clinical Controversy</h2>
                <div class="info-box">
                    <h4>Why Studies Disagree</h4>
                    <p>Echinacea research has produced famously inconsistent results, with some trials showing significant cold prevention and others showing no benefit. The primary explanation is that studies have used different species, different plant parts, different extraction methods, different doses, and different outcome measures. Comparing an aerial-part tea of <em>E. purpurea</em> with a root extract of <em>E. angustifolia</em> is essentially comparing two different herbal medicines. The best-designed trials using well-characterized extracts tend to show modest positive effects.</p>
                </div>

                <ul>
                    <li><strong>Cold prevention:</strong> A comprehensive 2014 Cochrane review concluded that some echinacea products may offer modest benefits for preventing colds, but no single product has been convincingly demonstrated to be effective. The heterogeneity of products tested was the primary limitation.</li>
                    <li><strong>Cold duration and severity:</strong> Better evidence exists for reducing the duration and severity of colds when echinacea is started at the first sign of symptoms, with several trials showing 1&ndash;2 day reductions in cold duration.</li>
                    <li><strong>Immune markers:</strong> Well-designed studies consistently show that echinacea preparations increase markers of innate immune activity (natural killer cell activity, phagocytosis), providing mechanistic plausibility for the traditional use.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Autoimmune conditions:</strong> Due to immunostimulatory properties, echinacea is traditionally contraindicated in autoimmune disorders, though clinical evidence for this concern is limited.</li>
                    <li><strong>Duration of use:</strong> Traditional Western herbalism recommends limiting continuous echinacea use to 8&ndash;10 weeks, followed by a rest period. German Commission E recommends no more than 8 weeks of continuous use.</li>
                    <li><strong>Asteraceae allergy:</strong> Rare allergic reactions reported, primarily in individuals with ragweed or other daisy-family allergies.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Karsch-V&ouml;lk et al., <em>Cochrane Database of Systematic Reviews</em> (2014) &mdash; echinacea for preventing colds</li>
                    <li>Shah et al., <em>The Lancet Infectious Diseases</em> (2007) &mdash; meta-analysis of echinacea for colds</li>
                    <li>Barrett, <em>Phytomedicine</em> (2003) &mdash; clinical trial review</li>
                    <li>German Commission E Monograph &mdash; Echinacea purpurea herb and root</li>
                    <li>Kindscher, <em>Echinacea: Herbal Medicine with a Wild History</em> (University Press of Kansas)</li>
                    <li>USDA PLANTS Database &mdash; native range and distribution data</li>
                </ol>`
},

// ── 5. LAVENDER ────────────────────────────────────────
{
  slug: 'lavender',
  title: 'Lavender (Lavandula angustifolia): Full Guide to Cultivation, Aromatherapy &amp; Research',
  metaDesc: 'Complete lavender cultivation guide covering English lavender botany, Mediterranean growing conditions, linalool and linalyl acetate chemistry, essential oil distillation, aromatherapy evidence, and Texas Hill Country growing tips.',
  keywords: 'lavender cultivation, Lavandula angustifolia, English lavender, linalool, lavender essential oil, lavender growing Texas, lavender aromatherapy, lavender anxiety',
  date: 'March 4, 2026',
  readTime: '13',
  h1: 'Lavender (Lavandula angustifolia): Mediterranean Royalty That Thrives in Texas Limestone',
  excerpt: 'A cultivation guide for English lavender in challenging warm climates, the chemistry that makes it the most studied essential oil in aromatherapy research, why humidity is the real enemy (not heat), distillation basics, and what clinical trials reveal about its effects on anxiety, sleep, and pain.',
  body: `
                <h2>Botanical Description</h2>
                <p>English lavender (<em>Lavandula angustifolia</em>, syn. <em>L. officinalis</em>, <em>L. vera</em>) is a compact, woody-based perennial sub-shrub in the Lamiaceae family, native to the western Mediterranean region. Plants form dense, silvery-green mounds 1&ndash;3 feet tall and wide, topped with iconic spikes of purple-blue flowers on long, slender stems. The entire plant&mdash;leaves, stems, and flowers&mdash;is intensely aromatic.</p>

                <p>English lavender is the species valued for the highest-quality essential oil, distinguished from the larger but more camphoraceous spike lavender (<em>L. latifolia</em>) and the vigorous hybrid lavandin (<em>L. x intermedia</em>) commonly grown for commercial oil production. True English lavender essential oil commands premium prices due to its superior linalool-to-camphor ratio and more refined, floral aroma.</p>

                <div class="info-box">
                    <h4>Humidity, Not Heat, Is the Killer</h4>
                    <p>The most common misconception about lavender is that it cannot tolerate Texas summers. In reality, lavender handles heat up to 110&deg;F with ease&mdash;its native Mediterranean habitat regularly exceeds 100&deg;F. The real killer is humidity and wet soil, which cause root rot and fungal crown disease. Texas Hill Country limestone soils with their excellent drainage actually provide near-ideal conditions. The key is raised beds or slopes, excellent air circulation, and zero supplemental irrigation once established.</p>
                </div>

                <h2>Growing Requirements</h2>
                <table class="spec-table">
                    <thead><tr><th>Parameter</th><th>Range / Tolerance</th></tr></thead>
                    <tbody>
                        <tr><td>USDA Hardiness Zones</td><td>5&ndash;9 (cultivar dependent)</td></tr>
                        <tr><td>Light</td><td>Full sun mandatory (8+ hours)</td></tr>
                        <tr><td>Soil</td><td>Alkaline, rocky, fast-draining; pH 6.5&ndash;8.5; limestone-based ideal</td></tr>
                        <tr><td>Moisture</td><td>Very low; drought-tolerant; overwatering is the primary cause of death</td></tr>
                        <tr><td>Humidity Tolerance</td><td>Low; requires excellent air circulation; susceptible to fungal diseases in humid climates</td></tr>
                        <tr><td>Frost Tolerance</td><td>Moderate to good; most cultivars survive to 10&ndash;15&deg;F</td></tr>
                    </tbody>
                </table>

                <h2>Texas-Adapted Cultivars</h2>
                <ul>
                    <li><strong>&lsquo;Phenomenal&rsquo;:</strong> A lavandin hybrid with exceptional heat and humidity tolerance. The single best choice for Texas growers who want reliable lavender.</li>
                    <li><strong>&lsquo;Provence&rsquo;:</strong> Another lavandin hybrid with good heat tolerance and prolific flowering.</li>
                    <li><strong>&lsquo;Hidcote&rsquo;:</strong> True English lavender, compact, with deep purple flowers. Performs well in Hill Country with good drainage.</li>
                    <li><strong>&lsquo;Munstead&rsquo;:</strong> Cold-hardy English lavender that also tolerates mild humidity better than most cultivars.</li>
                </ul>

                <h2>Cultivation</h2>
                <table class="spec-table">
                    <thead><tr><th>Factor</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>Propagation</td><td>Stem cuttings (preferred; maintains cultivar traits) or seed (slow; variable results)</td></tr>
                        <tr><td>Spacing</td><td>18&ndash;24 inches for hedging; 24&ndash;36 inches for specimen plants</td></tr>
                        <tr><td>Soil Amendment</td><td>Add crushed limestone, gravel, or perlite to heavy soils; never add compost to established beds</td></tr>
                        <tr><td>Pruning</td><td>Essential: prune by 1/3 annually in spring after new growth appears; never cut into old wood</td></tr>
                        <tr><td>Mulch</td><td>Light-colored gravel or crushed stone only; never organic mulch against stems</td></tr>
                        <tr><td>Watering</td><td>Deep soak at transplanting; then minimal to none once established</td></tr>
                    </tbody>
                </table>

                <h2>Harvesting and Distillation</h2>
                <p>Harvest lavender when approximately half the flowers on each spike have opened&mdash;the window between tight bud and full bloom captures peak essential oil content. Cut stems long and bundle for drying, or process immediately for distillation.</p>

                <p>Steam distillation of lavender is one of the most accessible essential oil extraction methods for small-scale growers. A simple copper still and 10&ndash;15 pounds of fresh flowering stems yield approximately 1&ndash;2 ounces of essential oil. The distillation byproduct&mdash;lavender hydrosol (floral water)&mdash;is itself a valuable product for skin care and room sprays.</p>

                <h2>Phytochemistry</h2>
                <table class="spec-table">
                    <thead><tr><th>Compound</th><th>Proportion in Essential Oil</th></tr></thead>
                    <tbody>
                        <tr><td>Linalool</td><td>25&ndash;45% (the primary calming compound)</td></tr>
                        <tr><td>Linalyl acetate</td><td>25&ndash;47% (floral, sweet character)</td></tr>
                        <tr><td>Camphor</td><td>Less than 0.5% in true English lavender</td></tr>
                        <tr><td>1,8-Cineole (Eucalyptol)</td><td>Less than 2.5%</td></tr>
                        <tr><td>Beta-caryophyllene</td><td>2&ndash;8%</td></tr>
                        <tr><td>Terpinen-4-ol</td><td>1&ndash;5%</td></tr>
                    </tbody>
                </table>

                <h2>Clinical Research</h2>
                <ul>
                    <li><strong>Anxiety (oral):</strong> Silexan (a standardized lavender oil capsule) has demonstrated anxiolytic effects comparable to lorazepam (Ativan) in multiple large RCTs for generalized anxiety disorder, without sedation, dependence, or withdrawal effects. This is arguably the strongest clinical evidence for any aromatherapy herb.</li>
                    <li><strong>Anxiety (inhalation):</strong> Numerous trials support inhalation of lavender essential oil for reducing pre-procedural anxiety in dental and surgical settings.</li>
                    <li><strong>Sleep quality:</strong> Consistent evidence for modest improvements in sleep quality from lavender inhalation, particularly in elderly, postpartum, and ICU populations.</li>
                    <li><strong>Pain (topical):</strong> Some evidence for topical lavender reducing pain in conditions including labor, osteoarthritis, and post-operative recovery.</li>
                </ul>

                <h2>Precautions</h2>
                <ul>
                    <li><strong>Hormonal effects:</strong> Lavender essential oil has been associated with prepubertal gynecomastia in case reports, though a causal link remains debated. The concern relates to potential estrogenic and anti-androgenic activity of certain lavender compounds <em>in vitro</em>.</li>
                    <li><strong>Skin sensitivity:</strong> Undiluted essential oil can cause skin irritation or allergic contact dermatitis. Always dilute in a carrier oil for topical use.</li>
                    <li><strong>Sedative interactions:</strong> May enhance effects of CNS depressants.</li>
                    <li><strong>Ingestion:</strong> Essential oil ingestion should only be done with pharmaceutical-grade preparations (like Silexan) under guidance. Neat essential oil ingestion can cause GI irritation.</li>
                </ul>

                <h2>References</h2>
                <ol class="ref-list">
                    <li>Kasper et al., <em>European Neuropsychopharmacology</em> (2010) &mdash; Silexan vs. lorazepam RCT</li>
                    <li>Woelk &amp; Schl&auml;fke, <em>Phytomedicine</em> (2010) &mdash; Silexan for GAD</li>
                    <li>Koulivand et al., <em>Evidence-Based Complementary and Alternative Medicine</em> (2013) &mdash; lavender and the nervous system</li>
                    <li>Lillehei &amp; Halcon, <em>Journal of Alternative and Complementary Medicine</em> (2014) &mdash; lavender inhalation and sleep</li>
                    <li>ISO 3515:2002 &mdash; lavender essential oil quality standards</li>
                    <li>Texas A&amp;M AgriLife Extension &mdash; lavender production in Texas</li>
                </ol>`
},

];

// Generate all articles
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
