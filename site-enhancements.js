/**
 * Nored Farms - Site Enhancements
 * Self-injecting widget script for:
 * 1. Back-to-Top Button
 * 2. Breadcrumbs (article pages)
 * 3. Reading Progress Bar (article pages)
 * 4. External Link Handler
 * 5. Smooth Scroll for Anchor Links
 *
 * No external dependencies. Drop in via <script src="site-enhancements.js"></script>
 */

(function () {
    'use strict';

    /** Detect if current page is an article page */
    function isArticlePage() {
        return window.location.pathname.indexOf('/articles/') !== -1;
    }

    /** Get computed nav height for scroll offset */
    function getNavOffset() {
        var navHeight = getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height');
        if (navHeight) {
            return parseInt(navHeight, 10) || 70;
        }
        var nav = document.querySelector('.nav, nav');
        return nav ? nav.offsetHeight : 70;
    }

    // =========================================
    // 1. Back-to-Top Button
    // =========================================

    function initBackToTop() {
        var btn = document.createElement('button');
        btn.id = 'pe-back-to-top';
        btn.setAttribute('aria-label', 'Scroll back to top');
        btn.setAttribute('title', 'Back to top');
        btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="18 15 12 9 6 15"></polyline>' +
            '</svg>';

        document.body.appendChild(btn);

        var scrollThreshold = 400;
        var isVisible = false;
        var ticking = false;

        function updateVisibility() {
            var shouldShow = window.pageYOffset > scrollThreshold;
            if (shouldShow !== isVisible) {
                isVisible = shouldShow;
                if (shouldShow) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =========================================
    // 2. Breadcrumbs (article pages only)
    // =========================================

    function initBreadcrumbs() {
        if (!isArticlePage()) return;

        // Extract article title from h1 or <title> tag
        var h1 = document.querySelector('.article-title, article h1, h1');
        var articleTitle = '';
        if (h1) {
            articleTitle = h1.textContent.trim();
        } else {
            var titleTag = document.querySelector('title');
            if (titleTag) {
                // Strip site name suffix like " | Nored Farms"
                articleTitle = titleTag.textContent.split('|')[0].trim();
            }
        }

        if (!articleTitle) return;

        // Truncate very long titles for breadcrumb display
        var displayTitle = articleTitle.length > 60
            ? articleTitle.substring(0, 57) + '...'
            : articleTitle;

        // Determine correct relative paths based on page depth
        var homePath = '../index.html';
        var blogPath = '../blog.html';

        // Build breadcrumb element
        var nav = document.createElement('nav');
        nav.id = 'pe-breadcrumbs';
        nav.setAttribute('aria-label', 'Breadcrumb');

        nav.innerHTML =
            '<a href="' + homePath + '" class="pe-breadcrumb-link">Home</a>' +
            '<span class="pe-breadcrumb-separator" aria-hidden="true">&#8250;</span>' +
            '<a href="' + blogPath + '" class="pe-breadcrumb-link">Plant Library</a>' +
            '<span class="pe-breadcrumb-separator" aria-hidden="true">&#8250;</span>' +
            '<span class="pe-breadcrumb-current">' + escapeHtml(displayTitle) + '</span>';

        // Insert after <nav> (site navigation) and before article content
        var articlePage = document.querySelector('.article-page');
        if (articlePage) {
            articlePage.insertBefore(nav, articlePage.firstChild);
        } else {
            // Fallback: insert after site nav
            var siteNav = document.querySelector('nav.nav, #nav');
            if (siteNav && siteNav.nextSibling) {
                siteNav.parentNode.insertBefore(nav, siteNav.nextSibling);
            }
        }
    }

    // =========================================
    // 3. Reading Progress Bar (article pages)
    // =========================================

    function initReadingProgress() {
        if (!isArticlePage()) return;

        var bar = document.createElement('div');
        bar.id = 'pe-reading-progress';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-label', 'Reading progress');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-valuenow', '0');
        document.body.appendChild(bar);

        var articleContent = document.querySelector('.article-content, article');
        if (!articleContent) return;

        var ticking = false;

        function updateProgress() {
            var contentRect = articleContent.getBoundingClientRect();
            var contentTop = contentRect.top + window.pageYOffset;
            var contentHeight = articleContent.offsetHeight;
            var viewportHeight = window.innerHeight;

            // Calculate how far through the article the user has scrolled
            var scrolled = window.pageYOffset - contentTop;
            var total = contentHeight - viewportHeight;

            var progress = 0;
            if (total > 0) {
                progress = Math.min(Math.max((scrolled / total) * 100, 0), 100);
            }

            bar.style.width = progress + '%';
            bar.setAttribute('aria-valuenow', Math.round(progress));
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        // Initial calculation
        updateProgress();
    }

    // =========================================
    // 4. External Link Handler
    // =========================================

    function initExternalLinks() {
        var currentHost = window.location.hostname;
        var links = document.querySelectorAll('a[href]');

        var externalIconSVG =
            '<svg class="pe-external-link-icon" xmlns="http://www.w3.org/2000/svg" ' +
            'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' +
            '<polyline points="15 3 21 3 21 9"></polyline>' +
            '<line x1="10" y1="14" x2="21" y2="3"></line>' +
            '</svg>';

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var href = link.getAttribute('href');

            // Skip non-http links, anchors, and same-domain links
            if (!href ||
                href.startsWith('#') ||
                href.startsWith('/') ||
                href.startsWith('.') ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                continue;
            }

            try {
                var url = new URL(href, window.location.origin);
                if (url.hostname && url.hostname !== currentHost) {
                    // Mark as external
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');

                    // Add external icon if link contains text (not just images)
                    if (link.textContent.trim().length > 0 &&
                        !link.querySelector('.pe-external-link-icon')) {
                        link.insertAdjacentHTML('beforeend', externalIconSVG);
                    }
                }
            } catch (e) {
                // Invalid URL, skip
            }
        }
    }

    // =========================================
    // 5. Smooth Scroll for Anchor Links
    // =========================================

    function initSmoothScroll() {
        document.addEventListener('click', function (e) {
            // Find the closest anchor element from click target
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            var targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            var offset = getNavOffset();
            var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL hash without jumping
            if (history.pushState) {
                history.pushState(null, '', targetId);
            }
        });
    }

    // =========================================
    // Utility: Escape HTML entities
    // =========================================

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // =========================================
    // Initialize all enhancements
    // =========================================

    function init() {
        initBackToTop();
        initBreadcrumbs();
        initReadingProgress();
        initExternalLinks();
        initSmoothScroll();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
