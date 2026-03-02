# Nored Farms - SEO Implementation Checklist

## Completed

### Meta Tags (index.html)
- [x] Title tag optimized with keywords
- [x] Meta description with keywords + CTA
- [x] Keywords meta tag
- [x] Author meta tag
- [x] Robots meta tag (index, follow)
- [x] Canonical URL
- [x] Theme color meta tags
- [x] Geographic meta tags (Texas)

### Open Graph (Social Sharing)
- [x] og:title
- [x] og:description
- [x] og:image (referenced, needs file)
- [x] og:url
- [x] og:type
- [x] og:site_name
- [x] og:locale

### Twitter Cards
- [x] twitter:card
- [x] twitter:title
- [x] twitter:description
- [x] twitter:image (referenced, needs file)

### Structured Data (JSON-LD)
- [x] Organization schema
- [x] LocalBusiness schema
- [x] WebSite schema
- [x] WebPage schema
- [x] Product schemas (Kratom, Kava, Blue Lotus)
- [x] FAQPage schema
- [x] BreadcrumbList schema

### Technical SEO
- [x] robots.txt configured
- [x] sitemap.xml updated with all pages
- [x] Canonical URLs on all pages
- [x] site.webmanifest created
- [x] favicon.svg created

### Page-Level SEO
- [x] index.html - Full SEO
- [x] classroom.html - Full SEO
- [x] blog.html - Already had SEO (URLs fixed)

---

## Action Required

### High Priority - Create Images
1. **og-image.jpg** (1200x630) - Main social share image
2. **logo.png** (512x512) - For structured data
3. **Favicon set** - Generate from favicon.svg

### Medium Priority - Additional Pages
Add SEO tags to remaining pages:
- [ ] lab-2d.html
- [ ] ancient-lab.html
- [ ] lab.html
- [ ] roadmap.html
- [ ] welcome.html

### After Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics 4
- [ ] Create Google Business Profile (for local SEO)
- [ ] Monitor Core Web Vitals
- [ ] Build backlinks from botanical/health sites

---

## SEO Testing Tools

### Before Launch
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Schema Markup Validator**: https://validator.schema.org/

### After Launch
- **Google Search Console**: Monitor indexing & performance
- **Google PageSpeed Insights**: Check Core Web Vitals
- **Screaming Frog**: Full site audit
- **Ahrefs/SEMrush**: Keyword rankings

---

## Keyword Targets

### Primary Keywords
| Keyword | Search Volume | Difficulty | Target Page |
|---------|--------------|------------|-------------|
| kratom extract | Medium | Medium | Homepage |
| kava extract | Medium | Low | Homepage |
| blue lotus extract | Low | Low | Homepage |
| botanical extracts texas | Low | Low | Homepage |
| kratom texas | Medium | Medium | Homepage |

### Educational Keywords
| Keyword | Target Page |
|---------|-------------|
| kratom alkaloids | Classroom |
| kavalactones benefits | Classroom |
| kratom dosing guide | Blog |
| kava effects | Blog |
| blue lotus tea benefits | Blog |

### Long-Tail Opportunities
- "lab tested kratom texas"
- "premium kava extract online"
- "blue lotus extract for sleep"
- "ethnobotanical supplier usa"
- "GMP certified kratom"

---

## Content Recommendations

### Blog Topics for SEO
1. "Complete Guide to Kratom Alkaloids" (target: kratom education)
2. "Kava vs Kratom: Understanding the Difference" (comparison traffic)
3. "Blue Lotus: History, Benefits & Modern Uses" (low competition)
4. "How to Read Kratom Lab Results" (trust building)
5. "Texas Kratom Laws 2025" (local SEO)

### FAQ Expansion
Add more FAQs to capture "People Also Ask" snippets:
- "Is kratom legal in Texas?"
- "How long does kava last?"
- "What is blue lotus used for?"
- "How to take kratom extract?"

---

## Local SEO (Texas Hill Country)

### Google Business Profile
- Create profile when ready for local queries
- Add photos, hours, products
- Encourage reviews post-launch

### Local Citations
- Yelp (if applicable)
- Texas business directories
- Botanical/herb supplier directories

### Content with Local Focus
- "Botanical Extracts Crafted in Texas Hill Country"
- "From Austin to Your Door"
- References to Texas throughout site

---

## Technical Notes

### Page Load Speed
Current setup is good (static HTML), but:
- Optimize images when added (use WebP with JPG fallback)
- Consider lazy loading for below-fold images
- Minify CSS for production

### Mobile SEO
- Site is responsive (good)
- Test on Google Mobile-Friendly Test
- Ensure tap targets are 48px+

### Indexing
Hash fragments (#about, #products) are NOT separately indexed.
If these become important, consider:
- Separate pages (/about, /products)
- Using proper internal links
