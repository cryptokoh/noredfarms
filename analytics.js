/**
 * Nored Farms - Custom Analytics Event Tracking
 * Requires GA4 Measurement ID to be set in the gtag snippet on each page.
 *
 * SETUP: Replace 'G-050E36TGR9' in the GA4 snippet across all HTML pages
 * with your actual Measurement ID from https://analytics.google.com
 */

(function() {
    'use strict';

    // Only run if gtag is loaded
    if (typeof gtag !== 'function') return;

    /**
     * Track CTA button clicks
     */
    function trackCTAClicks() {
        // Waitlist / signup buttons
        document.querySelectorAll('.btn-waitlist, .final-cta-btn, .modal-btn, [class*="cta"]').forEach(btn => {
            btn.addEventListener('click', function() {
                gtag('event', 'cta_click', {
                    event_category: 'engagement',
                    event_label: this.textContent.trim().substring(0, 50),
                    link_url: this.href || 'button'
                });
            });
        });

        // Navigation links
        document.querySelectorAll('.nav-link-cta').forEach(link => {
            link.addEventListener('click', function() {
                gtag('event', 'nav_cta_click', {
                    event_category: 'navigation',
                    event_label: this.textContent.trim()
                });
            });
        });
    }

    /**
     * Track form submissions
     */
    function trackFormSubmissions() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function() {
                const subject = document.getElementById('contactSubject');
                gtag('event', 'form_submit', {
                    event_category: 'contact',
                    event_label: subject ? subject.value : 'unknown',
                    form_name: 'contact'
                });
            });
        }

        // Signup/waitlist form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', function() {
                gtag('event', 'form_submit', {
                    event_category: 'signup',
                    event_label: 'waitlist',
                    form_name: 'waitlist'
                });
            });
        }
    }

    /**
     * Track scroll depth (25%, 50%, 75%, 100%)
     */
    function trackScrollDepth() {
        const thresholds = [25, 50, 75, 100];
        const fired = new Set();

        function checkScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;

            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !fired.has(threshold)) {
                    fired.add(threshold);
                    gtag('event', 'scroll_depth', {
                        event_category: 'engagement',
                        event_label: threshold + '%',
                        value: threshold
                    });
                }
            });
        }

        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(checkScroll, 150);
        }, { passive: true });
    }

    /**
     * Track outbound link clicks
     */
    function trackOutboundLinks() {
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', function() {
                gtag('event', 'outbound_click', {
                    event_category: 'contact',
                    event_label: this.href,
                    transport_type: 'beacon'
                });
            });
        });
    }

    /**
     * Track page-specific context
     */
    function trackPageContext() {
        // Track which theme is active
        const theme = 'seedgreen';
        gtag('event', 'page_context', {
            event_category: 'site',
            event_label: 'theme_' + theme
        });
    }

    /**
     * Track classroom and research engagement
     */
    function trackEducationEngagement() {
        // Classroom hub card clicks
        document.querySelectorAll('.hub-btn-primary').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.hub-card');
                const title = card ? card.querySelector('.hub-title')?.textContent : 'unknown';
                gtag('event', 'classroom_enter', {
                    event_category: 'education',
                    event_label: title
                });
            });
        });

        // Research tab clicks
        document.querySelectorAll('.research-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                gtag('event', 'research_filter', {
                    event_category: 'education',
                    event_label: this.dataset.category || this.textContent.trim()
                });
            });
        });

        // Article clicks
        document.querySelectorAll('.track-article, .research-article, .blog-card').forEach(link => {
            link.addEventListener('click', function() {
                const title = this.querySelector('.article-title, .research-article-title, .blog-card-title')?.textContent || 'unknown';
                gtag('event', 'article_click', {
                    event_category: 'education',
                    event_label: title.trim().substring(0, 80)
                });
            });
        });
    }

    // Initialize all tracking
    document.addEventListener('DOMContentLoaded', function() {
        trackCTAClicks();
        trackFormSubmissions();
        trackScrollDepth();
        trackOutboundLinks();
        trackPageContext();
        trackEducationEngagement();
    });
})();
