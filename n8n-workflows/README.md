# Nored Farms - n8n Workflow Collection

Complete automation system for social media, SEO monitoring, and content distribution.

## Overview

This collection provides 6 core workflows that handle:
1. **Multi-Platform Social Posting** (via Blotato)
2. **Blog-to-Social Content Pipeline**
3. **SEO Rank Tracking & Reporting**
4. **AI Content Generation**
5. **Engagement Monitoring**
6. **Weekly Content Calendar Prep**

## Prerequisites

### Required Services
- n8n self-hosted instance (v1.0+)
- [Blotato](https://blotato.com) account (for multi-platform posting)
- Supabase project
- OpenAI or Anthropic API key
- SerpAPI key (for SEO tracking)

### Environment Variables
Set these in your n8n instance:

```bash
# Social Media
BLOTATO_API_KEY=your_blotato_key

# AI
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# SEO
SERPAPI_KEY=your_serpapi_key

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Notifications
DISCORD_WEBHOOK_URL=your_webhook_url
# OR
SLACK_WEBHOOK_URL=your_webhook_url
```

## Workflow Files

### 1. `social-multi-platform-post.json`
**Purpose**: Post content to all platforms simultaneously
**Trigger**: Manual or Webhook
**Platforms**: Instagram, Facebook, TikTok, YouTube, X, LinkedIn

### 2. `blog-to-social-pipeline.json`
**Purpose**: Automatically distribute new blog posts
**Trigger**: Supabase webhook (new blog_posts)
**Features**: AI content transformation, compliance check, scheduled posting

### 3. `seo-rank-tracker.json`
**Purpose**: Weekly keyword ranking report
**Trigger**: Cron (Mondays 7am)
**Features**: Rank tracking, competitor analysis, trend reporting

### 4. `ai-content-generator.json`
**Purpose**: Generate platform-specific content from topics
**Trigger**: Manual
**Features**: Multi-format output, compliance filtering, brand voice

### 5. `engagement-monitor.json`
**Purpose**: Track and respond to social engagement
**Trigger**: Cron (3x daily)
**Features**: Mention tracking, sentiment analysis, response drafts

### 6. `content-calendar-prep.json`
**Purpose**: Weekly content planning automation
**Trigger**: Cron (Sundays 6am)
**Features**: Gap analysis, trend research, draft generation

## Installation

1. Import each workflow JSON into n8n
2. Configure credentials for each service
3. Activate workflows
4. Test with manual triggers first

## Blotato Setup

Blotato provides unified posting to:
- Instagram (Feed, Stories, Reels)
- Facebook (Page, Groups)
- TikTok
- YouTube (Videos, Shorts)
- X (Twitter)
- LinkedIn
- Pinterest
- Threads

### Connect Accounts in Blotato:
1. Create account at [blotato.com](https://blotato.com)
2. Connect each social platform
3. Get API key from Settings
4. Add API key to n8n credentials

## Platform-Specific Notes

### Instagram
- Requires Business/Creator account
- Images: 1080x1080 (square), 1080x1350 (portrait)
- Reels: 1080x1920, 15-90 seconds
- Carousel: Up to 10 images

### Facebook
- Page posting only (not personal)
- Groups require manual posting or admin access
- Videos: Up to 240 minutes

### TikTok
- Videos: 1080x1920, 15-180 seconds
- Add captions always
- Hashtag limit: 100 characters total

### YouTube
- Shorts: Under 60 seconds, 1080x1920
- Long-form: Any length, 1920x1080
- Requires title, description, tags

### X (Twitter)
- Character limit: 280 (posts), 25,000 (threads)
- Images: Up to 4 per post
- Videos: Up to 2:20

## Compliance Integration

All workflows include compliance checking:
- Prohibited term detection
- Health claim filtering
- Age-gate requirement flagging
- Platform-specific rule validation

See `seo-agent-config.md` for full compliance guidelines.

## Monitoring & Alerts

Workflows send notifications via:
- Discord webhooks
- Slack webhooks
- Email (via SMTP node)

Configure your preferred notification channel in each workflow.

## Troubleshooting

### Common Issues

**Blotato API errors**
- Check API key is valid
- Verify account has connected platforms
- Check rate limits (varies by plan)

**Supabase connection failed**
- Verify URL and service key
- Check RLS policies allow access
- Ensure tables exist

**AI generation timeout**
- Reduce token limits
- Use faster model (gpt-3.5-turbo vs gpt-4)
- Add retry logic

### Support

- n8n Community: [community.n8n.io](https://community.n8n.io)
- Blotato Support: [blotato.com/support](https://blotato.com/support)
- This repo: Create an issue

---

*Part of Nored Farms automation system*
