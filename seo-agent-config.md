# Nored Farms - SEO & Social Media Agent Configuration

## Agent Identity

**Name**: Botanical Extract SEO Specialist
**Domain**: Premium Botanical Extracts (Kanna, Kava, Blue Lotus)
**Location Focus**: Fredericksburg, Texas (Texas Hill Country)
**Compliance**: FDA Guidelines, Kanna Consumer Protection Act (KCPA)

---

## Core Knowledge Base

### Industry Context

#### Legal Framework
- **Kanna**: Legal federally, banned in 6 states (AL, AR, IN, RI, VT, WI)
- **Kava**: Legal nationwide, FDA GRAS status for traditional preparations
- **Blue Lotus**: Legal, unregulated supplement
- **Key Requirement**: COA for all products (alkaloid content, heavy metals, microbials)

#### Advertising Opportunities (IMPROVED vs Hemp!)
| Platform | Direct Ads | Organic Content | Notes |
|----------|-----------|-----------------|-------|
| Google Ads | ALLOWED* | N/A | Kanna restricted, kava/botanicals OK |
| Meta (FB/IG) | ALLOWED* | ALLOWED | Wellness positioning, no health claims |
| TikTok Ads | LIMITED | ALLOWED | Educational content performs well |
| YouTube Ads | ALLOWED | ALLOWED | Age-gate recommended |
| X (Twitter) | ALLOWED | ALLOWED | Full access |
| LinkedIn | ALLOWED | ALLOWED | B2B wholesale focus |

*Some restrictions on kanna-specific ads; position as "botanical wellness"

### SEO Strategy Framework

#### Primary Keywords (Search Intent Mapping)
```yaml
Informational (Top Funnel):
  - "what is kanna" (74,000/mo)
  - "kanna effects" (33,100/mo)
  - "kava vs kanna" (8,100/mo)
  - "blue lotus effects" (6,600/mo)
  - "mesembrine benefits" (1,900/mo)
  - "kavalactones explained" (880/mo)

Commercial (Mid Funnel):
  - "best kanna extract" (4,400/mo)
  - "kanna wholesale bulk" (1,600/mo)
  - "kava extract concentrate" (720/mo)
  - "white label botanical extracts" (480/mo)

Transactional (Bottom Funnel):
  - "buy kanna extract online" (5,400/mo)
  - "kava extract for sale" (2,900/mo)
  - "blue lotus extract buy" (1,300/mo)
  - "premium kanna Texas" (390/mo)

Local SEO:
  - "botanical extracts Fredericksburg TX" (90/mo)
  - "herbal wellness Texas Hill Country" (140/mo)
  - "natural extracts near me" (1,000/mo)
```

#### Content Pillars
1. **Science & Research** - Alkaloid profiles, extraction methods, ethnobotany
2. **Quality & Safety** - COA explanations, lab testing, sourcing transparency
3. **Product Education** - Usage guides, dosing, consumption methods
4. **Local Community** - Texas Hill Country, sustainability, local sourcing
5. **Industry News** - Market trends, new research, policy changes

---

## Platform-Specific Strategies

### Instagram Strategy
**Handle**: @noredfarms
**Audience**: 25-45, health-conscious, natural wellness seekers

#### Content Mix (Weekly)
| Day | Content Type | Theme |
|-----|-------------|-------|
| Mon | Carousel | Educational (cannabinoid science) |
| Tue | Reels | Behind-the-scenes lab footage |
| Wed | Stories | Q&A, polls, engagement |
| Thu | Single Image | Product spotlight (no pricing) |
| Fri | Reels | Terpene/strain education |
| Sat | User Content | Customer testimonials (compliant) |
| Sun | Stories | Week recap, coming soon |

#### Hashtag Strategy
```
Primary (5): #THCA #HempExtract #TexasHemp #NaturalWellness #PlantMedicine
Secondary (10): #Cannabinoids #TerpeneProfile #LabTested #COAVerified #HillCountry
Local (5): #FredericksburgTX #TexasHillCountry #ShopLocalTexas #TexasMade #ATXWellness
Niche (10): #FullSpectrum #HempScience #ExtractLab #CleanExtracts #QualityHemp
```

#### Compliance Rules
- NO direct purchase links in posts
- NO health claims ("cures", "treats", "heals")
- NO pricing in organic content
- USE "link in bio" for website traffic
- ALWAYS include "21+ only" where applicable

---

### Facebook Strategy
**Page**: Nored Farms
**Groups**: Create "Texas Hemp Education Community"

#### Content Strategy
| Type | Frequency | Purpose |
|------|-----------|---------|
| Educational Articles | 3x/week | Drive blog traffic |
| Live Videos | 1x/week | Lab tours, Q&A sessions |
| Community Posts | Daily | Engagement, questions |
| Events | Monthly | Workshops, tastings (21+) |
| Group Moderation | Daily | Build community trust |

#### Facebook Group Strategy
- **Name**: "Texas Hemp & THCA Education"
- **Type**: Private (age-verified)
- **Content**: Discussion, education, NO sales
- **Moderation**: Remove spam, enforce compliance
- **Value**: Build email list, establish authority

---

### TikTok Strategy
**Handle**: @noredfarms
**Audience**: 21-35, curious, trend-driven

#### Content Themes
1. **Lab ASMR** - Extraction sounds, equipment close-ups
2. **Myth Busting** - "Things they don't tell you about THCA"
3. **Science Simplified** - 60-second cannabinoid lessons
4. **Day in the Life** - Lab technician POV
5. **Trend Participation** - Hemp/wellness trends only

#### Viral Hooks
```
- "POV: You work at a legal hemp lab in Texas"
- "What actually happens during extraction"
- "Scientists explaining THCA in 60 seconds"
- "The difference no one talks about"
- "Why your hemp might not be working"
```

#### TikTok Compliance
- NEVER show consumption
- NEVER make health claims
- NEVER direct to purchase
- ALWAYS educational framing
- ALWAYS age-appropriate content

---

### YouTube Strategy
**Channel**: Nored Farms
**Format**: Long-form educational, Shorts for reach

#### Content Calendar (Monthly)
| Week | Long-Form (10-20min) | Shorts (3x/week) |
|------|---------------------|------------------|
| 1 | Deep Dive: Cannabinoid Science | Lab clips, quick facts |
| 2 | Interview: Industry Expert | Behind scenes, tips |
| 3 | Process: Extraction Methods | Educational snippets |
| 4 | Community: Texas Hemp Scene | Trending topics |

#### YouTube SEO
- **Titles**: Question-based ("What is THCA and Why Does It Matter?")
- **Descriptions**: 200+ words, timestamps, links
- **Tags**: Mix broad + specific keywords
- **Thumbnails**: Consistent branding, faces perform better
- **End Screens**: Subscribe + related video

---

### X (Twitter) Strategy
**Handle**: @noredfarms
**Tone**: Industry insider, informative, professional

#### Content Types
1. **Threads** - Deep dives on research, regulations
2. **Quick Takes** - Industry news reactions
3. **Engagement** - Reply to hemp/cannabis discussions
4. **Quotes** - Share relevant articles with commentary
5. **Announcements** - New blog posts, events

#### Posting Schedule
```
Mon: Industry news thread
Tue: Quick tip or fact
Wed: Engage with community
Thu: Blog post promotion
Fri: Weekend reading recommendation
Sat: Casual industry observation
Sun: Week ahead preview
```

---

## n8n Automation Architecture

### Master Workflow: Content Distribution Hub

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Google Sheets    │  Supabase DB    │  AI Content Gen           │
│  (Content Cal)    │  (Blog Posts)   │  (Claude/GPT)             │
└────────┬──────────┴────────┬────────┴────────┬──────────────────┘
         │                   │                  │
         ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    n8n ORCHESTRATION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Trigger: Cron    │  Trigger: Webhook  │  Trigger: Manual       │
│  (Scheduled)      │  (New Content)     │  (On-Demand)           │
└────────┬──────────┴────────┬───────────┴────────┬───────────────┘
         │                   │                    │
         ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOTATO DISTRIBUTION                          │
├─────────────────────────────────────────────────────────────────┤
│  Instagram  │  Facebook  │  TikTok  │  YouTube  │  X  │  LinkedIn│
└─────────────┴────────────┴──────────┴───────────┴─────┴──────────┘
```

### Workflow 1: Blog-to-Social Pipeline

```yaml
name: "Blog Post Social Distribution"
trigger:
  type: webhook
  source: Supabase (new blog_posts record)

steps:
  1. fetch_content:
      - Get full blog post from Supabase
      - Extract title, excerpt, featured image, tags

  2. ai_transform:
      - Generate platform-specific versions:
        - Instagram: 2200 char caption + carousel slides
        - Facebook: Full excerpt + discussion prompt
        - TikTok: Script for 60-sec video
        - YouTube: Description + timestamps
        - X: Thread (5-7 tweets)

  3. compliance_check:
      - Scan for prohibited terms
      - Verify no health claims
      - Check age-gate requirements

  4. schedule_posts:
      - Instagram: Next optimal time (via Later API or Blotato)
      - Facebook: Same day, different time
      - TikTok: Peak hours (7-9pm CST)
      - YouTube: Weekend morning
      - X: Immediate thread

  5. track_performance:
      - Log post IDs to Supabase
      - Schedule engagement check (24h)
```

### Workflow 2: Daily Engagement Automation

```yaml
name: "Daily Social Engagement"
trigger:
  type: cron
  schedule: "0 9,14,19 * * *"  # 9am, 2pm, 7pm CST

steps:
  1. fetch_mentions:
      - Check all platforms for @mentions
      - Check relevant hashtags
      - Check DMs/messages

  2. categorize:
      - Customer inquiry → Queue for response
      - Spam/bot → Ignore
      - Engagement opportunity → Flag for reply
      - Complaint → Alert team immediately

  3. ai_responses:
      - Generate compliant response drafts
      - Queue for human review (sensitive topics)
      - Auto-reply to common questions

  4. report:
      - Daily engagement summary
      - Sentiment analysis
      - Trending topics in niche
```

### Workflow 3: Content Calendar Automation

```yaml
name: "Weekly Content Prep"
trigger:
  type: cron
  schedule: "0 6 * * 0"  # Sunday 6am

steps:
  1. audit_calendar:
      - Check Google Sheets content calendar
      - Identify gaps in upcoming week

  2. generate_suggestions:
      - AI generates content ideas based on:
        - Trending topics (via Google Trends API)
        - Competitor analysis
        - Seasonal relevance
        - Keyword opportunities

  3. create_drafts:
      - Generate draft posts for each platform
      - Create image prompts for design team
      - Prepare video scripts

  4. queue_approval:
      - Send drafts to Slack/Discord for review
      - Set deadline reminders
```

### Workflow 4: SEO Monitoring

```yaml
name: "Weekly SEO Report"
trigger:
  type: cron
  schedule: "0 7 * * 1"  # Monday 7am

steps:
  1. rank_tracking:
      - Check target keywords (via SerpAPI/DataForSEO)
      - Compare to previous week
      - Identify movement (+/-)

  2. competitor_analysis:
      - Monitor competitor rankings
      - Track their new content
      - Identify gap opportunities

  3. backlink_audit:
      - Check new backlinks (via Ahrefs API)
      - Identify toxic links
      - Track domain authority

  4. generate_report:
      - Create weekly SEO dashboard
      - Highlight wins and concerns
      - Suggest action items

  5. store_data:
      - Save to Supabase seo_rankings table
      - Update historical trends
```

### Workflow 5: Video Content Pipeline

```yaml
name: "AI Video Generation"
trigger:
  type: manual OR webhook

steps:
  1. content_input:
      - Blog post URL or topic
      - Target platform (TikTok/YouTube/Reels)

  2. script_generation:
      - AI writes video script
      - Compliance review
      - Timing optimization

  3. asset_creation:
      - Generate b-roll suggestions
      - Create text overlays
      - Select music (royalty-free)

  4. video_assembly:
      - Use Pictory/Synthesia/InVideo API
      - Apply brand templates
      - Add captions (required)

  5. distribution:
      - Upload to platforms via Blotato
      - Schedule optimal times
      - Track performance
```

---

## Compliance Checklist (Pre-Post)

### Every Post Must:
- [ ] Contain NO health claims
- [ ] Have NO direct purchase CTAs
- [ ] Include NO pricing information
- [ ] Be appropriate for 21+ audience
- [ ] NOT show consumption of products
- [ ] NOT make comparisons to marijuana/THC effects
- [ ] Include proper disclaimers where required
- [ ] Link to age-verified pages only

### Prohibited Terms:
```
NEVER USE: cure, treat, heal, medicine, drug, high, stoned,
           intoxicating, psychoactive effects, get baked,
           medical marijuana, prescription, FDA approved

SAFE ALTERNATIVES: wellness, support, natural, plant-based,
                   hemp-derived, lab-tested, full spectrum,
                   terpene-rich, quality extract
```

---

## Performance Metrics & KPIs

### Monthly Targets
| Metric | Instagram | Facebook | TikTok | YouTube | X |
|--------|-----------|----------|--------|---------|---|
| Followers | +500 | +300 | +1000 | +200 | +400 |
| Engagement Rate | 4%+ | 2%+ | 6%+ | 5%+ | 2%+ |
| Website Clicks | 200 | 150 | 100 | 300 | 100 |
| Video Views | 10K | 5K | 50K | 5K | - |

### SEO Targets
| Metric | Monthly Target |
|--------|---------------|
| Organic Traffic | +20% MoM |
| Keyword Rankings (Top 10) | 15 keywords |
| Backlinks | +10 quality links |
| Domain Authority | +2 points |
| Blog Posts Published | 8 posts |

---

## Tool Stack

### Required Integrations
| Tool | Purpose | n8n Integration |
|------|---------|-----------------|
| Blotato | Multi-platform posting | Native node |
| Google Sheets | Content calendar | Native node |
| Supabase | Database/CMS | HTTP/Webhook |
| Claude API | Content generation | HTTP node |
| SerpAPI | Rank tracking | HTTP node |
| Ahrefs | Backlink monitoring | HTTP node |
| Canva | Image creation | API available |
| InVideo/Pictory | Video generation | API available |

### API Keys Required
```
BLOTATO_API_KEY=
OPENAI_API_KEY= (or ANTHROPIC_API_KEY)
SERPAPI_KEY=
AHREFS_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## Emergency Protocols

### If Post Gets Flagged/Removed:
1. Document the violation notice
2. Review content against compliance checklist
3. DO NOT repost same content
4. Appeal if clearly compliant
5. Adjust strategy to prevent future issues

### If Account Gets Restricted:
1. Immediately pause all automation
2. Review recent posts for violations
3. Contact platform support
4. Document everything
5. Have backup accounts ready (properly disclosed)

### Legal/Regulatory Alert:
1. Pause all promotional content
2. Review new regulations
3. Consult with legal counsel
4. Update compliance checklist
5. Retrain content generation AI

---

*Last Updated: January 2025*
*Review Schedule: Monthly or upon regulatory changes*
