/**
 * Nored Farms - Site Interactions
 * Seed green design system
 */

// Prevent browser scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Clear hash on fresh page load (prevents auto-scroll to sections)
// but preserve filter hashes
if (window.location.hash && !window.location.hash.startsWith('#filter-')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
}

document.addEventListener('DOMContentLoaded', () => {
    // Reset scroll position on page load
    window.scrollTo(0, 0);

    // Ensure scroll stays at top after browser processes the page
    setTimeout(() => window.scrollTo(0, 0), 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));

    // Initialize all components
    initNavigation();
    initScrollEffects();
    initForms();
    initAnimations();
    initMobileEnhancements();
    initProductFiltering();
    initFeaturedCarousel();
    initViewAllProducts();

    // Global auth nav state (only runs if Supabase is loaded)
    if (typeof initAuthListener === 'function') {
        initAuthListener();
    }
});

/**
 * Navigation (Seed Style)
 */
function initNavigation() {
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('navToggle');
    if (!nav) return;

    // Wrap nav children in .nav-container for centered max-width layout
    // (also enables site-search.js desktop search bar injection)
    if (!nav.querySelector('.nav-container')) {
        var container = document.createElement('div');
        container.className = 'nav-container';
        while (nav.firstChild) {
            container.appendChild(nav.firstChild);
        }
        nav.appendChild(container);
    }

    var navLinks = nav.querySelector('.nav-links');
    var container = nav.querySelector('.nav-container');
    var hamburgerEl = nav.querySelector('.hamburger');

    // Wrap logo + main links in .nav-left pill (seed.com pattern)
    // On desktop scroll: single glass pill with logo + Shop/Science/Learn
    if (container && navLinks && !nav.querySelector('.nav-left')) {
        var logo = nav.querySelector('.nav-logo');
        var navLeft = document.createElement('div');
        navLeft.className = 'nav-left';

        // Move main links (not Login/Get Started) into nav-left
        var mainLinks = document.createElement('div');
        mainLinks.className = 'nav-main-links';
        var authLinks = document.createElement('div');
        authLinks.className = 'nav-auth-links';

        var allLinks = navLinks.querySelectorAll('a');
        allLinks.forEach(function(a) {
            var text = a.textContent.trim().toLowerCase();
            if (text === 'login' || a.classList.contains('nav-cta')) {
                authLinks.appendChild(a);
            } else {
                mainLinks.appendChild(a);
            }
        });

        // Build: .nav-left > [logo, main-links]
        if (logo) navLeft.appendChild(logo);
        navLeft.appendChild(mainLinks);

        // Replace nav-links with new structure
        container.insertBefore(navLeft, navLinks);
        container.insertBefore(authLinks, hamburgerEl);
        navLinks.remove();
    }

    // Clone Get Started for mobile (direct child of nav-container)
    var cta = container && container.querySelector('.nav-auth-links .nav-cta');
    if (container && cta && hamburgerEl) {
        var mobileCta = cta.cloneNode(true);
        mobileCta.classList.add('nav-cta-mobile');
        container.insertBefore(mobileCta, hamburgerEl);
    }

    // Scroll effect: at top → plain text nav, on first scroll → glass pills appear
    var scrollThreshold = 10; // activate immediately on first scroll

    function updateNavState() {
        var overLight = window.scrollY <= scrollThreshold;
        if (overLight) {
            nav.classList.remove('scrolled');
        } else {
            nav.classList.add('scrolled');
        }
        // Sync collapsed menu tab bar style with bg color
        var menu = document.getElementById('fsMenu');
        if (menu) {
            if (overLight) {
                menu.classList.add('over-light');
            } else {
                menu.classList.remove('over-light');
            }
        }
    }
    window.addEventListener('scroll', updateNavState, { passive: true });
    updateNavState();

    // Smooth scroll for anchor links
    nav.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = nav.offsetHeight + 20;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
                history.pushState(null, '', link.getAttribute('href'));
            }
        });
    });

    // Inject fullscreen mobile menu HTML
    if (hamburger) {
        initFullscreenMenu(hamburger);
    }
}

/**
 * Fullscreen Takeover Menu (Seed Pattern)
 * Injected via JS to avoid touching 80 HTML pages
 */
function initFullscreenMenu(hamburger) {
    // Detect path prefix for correct links
    var path = window.location.pathname;
    var p = '';
    if (path.indexOf('/articles/') !== -1 || path.indexOf('/products/') !== -1 ||
        path.indexOf('/classroom/') !== -1 || path.indexOf('/courses/') !== -1) {
        p = '../';
    }

    // Build menu HTML
    var menuHTML = '<div class="fs-menu-backdrop" id="menuBackdrop"></div>' +
        '<div class="fs-menu" id="fsMenu">' +
        '<div class="fs-menu-tabs">' +
        '<div class="fs-menu-logo"></div>' +
        '<button class="fs-tab active" data-tab="shop">Shop</button>' +
        '<button class="fs-tab" data-tab="science">Science</button>' +
        '<button class="fs-tab" data-tab="learn">Learn</button>' +
        '<button class="fs-tab" data-tab="login">Login</button>' +
        '<button class="fs-menu-close" id="menuClose" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="fs-menu-scroll">' +
        // SHOP panel
        '<div class="fs-panel active" data-panel="shop">' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-code">KR-01</div><div class="product-name">Kratom Full Spectrum</div></div></a>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar teal"></div></div><div class="product-info"><div class="product-code">KR-02</div><div class="product-name">Kratom Enhanced Blend</div></div></a>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-code">KV-01</div><div class="product-name">Kava Noble Extract</div></div></a>' +
        '<a href="' + p + 'products/tinctures.html" class="product-row"><div class="product-thumb"><div class="jar blue"></div></div><div class="product-info"><div class="product-code">BL-01</div><div class="product-name">Blue Lotus Concentrate</div></div></a>' +
        '<a href="' + p + 'products/gummies.html" class="product-row"><div class="product-thumb"><div class="jar amber"></div></div><div class="product-info"><div class="product-code">BD-01</div><div class="product-name">Hill Country Bundle</div></div></a>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar purple"></div></div><div class="product-info"><div class="product-code">ET-01</div><div class="product-name">Ethnobotanical Sampler</div></div></a>' +
        '<a href="' + p + 'index.html#products" class="shop-all-link">Shop All Products &rarr;</a>' +
        '</div>' +
        // SCIENCE panel
        '<div class="fs-panel" data-panel="science">' +
        '<a href="' + p + 'index.html#about" class="panel-item"><div class="panel-item-image img-approach">&#128300;</div><div class="panel-item-content"><div class="panel-item-title">Approach</div><div class="panel-item-desc">Botanical science for human wellness</div></div></a>' +
        '<a href="' + p + 'research.html" class="panel-item"><div class="panel-item-image img-labs">&#9878;</div><div class="panel-item-content"><div class="panel-item-title">Nored[Labs]</div><div class="panel-item-desc">Frontier extraction science</div></div></a>' +
        '<a href="' + p + 'consulting.html" class="panel-item"><div class="panel-item-image img-scientists">&#128200;</div><div class="panel-item-content"><div class="panel-item-title">Researchers</div><div class="panel-item-desc">Leading ethnobotanical experts</div></div></a>' +
        '<a href="' + p + 'research.html#growing" class="panel-item"><div class="panel-item-image img-sustainability">&#127807;</div><div class="panel-item-content"><div class="panel-item-title">Sustainability</div><div class="panel-item-desc">Sourcing impact on ecological health</div></div></a>' +
        '<div class="panel-group-header">Reference</div>' +
        '<ul class="ref-list">' +
        '<li><a href="' + p + 'articles/complete-kratom-guide.html">KR-01 Kratom Full Spectrum</a></li>' +
        '<li><a href="' + p + 'articles/kratom-alkaloid-profiles.html">KR-02 Kratom Enhanced Blend</a></li>' +
        '<li><a href="' + p + 'articles/kava-noble-vs-tudei.html">KV-01 Kava Noble Extract</a></li>' +
        '<li><a href="' + p + 'articles/blue-lotus-guide.html">BL-01 Blue Lotus Concentrate</a></li>' +
        '</ul>' +
        '</div>' +
        // LEARN panel
        '<div class="fs-panel" data-panel="learn">' +
        '<a href="' + p + 'classroom/extraction.html" class="panel-item"><div class="panel-item-image img-approach">&#9752;</div><div class="panel-item-content"><div class="panel-item-title">Extraction 101</div><div class="panel-item-desc">The science of isolating active plant compounds.</div></div></a>' +
        '<a href="' + p + 'classroom/effects.html" class="panel-item"><div class="panel-item-image img-sustainability">&#127807;</div><div class="panel-item-content"><div class="panel-item-title">Alkaloids 101</div><div class="panel-item-desc">How mitragynine, kavalactones and aporphines work.</div></div></a>' +
        '<div class="panel-group-header">Featured Articles</div>' +
        '<a href="' + p + 'articles/kratom-alkaloid-profiles.html" class="panel-item"><div class="article-thumb article-thumb-1"></div><div class="panel-item-content"><div class="panel-item-title">Understanding Kratom Alkaloid Profiles</div><div class="panel-item-meta">8 min read</div></div></a>' +
        '<a href="' + p + 'articles/kava-noble-vs-tudei.html" class="panel-item"><div class="article-thumb article-thumb-2"></div><div class="panel-item-content"><div class="panel-item-title">Kava Noble vs Tudei: Why It Matters</div><div class="panel-item-meta">6 min read</div></div></a>' +
        '<a href="' + p + 'articles/water-vs-ethanol-extraction.html" class="panel-item"><div class="article-thumb article-thumb-3"></div><div class="panel-item-content"><div class="panel-item-title">Water vs Ethanol Extraction Methods</div><div class="panel-item-meta">10 min read</div></div></a>' +
        '<a href="' + p + 'articles/blue-lotus-guide.html" class="panel-item"><div class="article-thumb article-thumb-4"></div><div class="panel-item-content"><div class="panel-item-title">Blue Lotus in Ancient Egyptian Medicine</div><div class="panel-item-meta">12 min read</div></div></a>' +
        '<a href="' + p + 'blog.html" class="all-articles-link">All Articles &rarr;</a>' +
        '</div>' +
        // LOGIN panel
        '<div class="fs-panel" data-panel="login">' +
        '<div class="login-brand">[ Nored Farms ]</div>' +
        '<h2 class="login-heading">Login</h2>' +
        '<p class="login-subtitle">Access your account, courses, lab reports, and more.</p>' +
        '<div class="login-divider"><span>EMAIL LOGIN</span></div>' +
        '<form onsubmit="window.location.href=\'' + p + 'courses/login.html\'; return false;">' +
        '<div class="login-field"><input type="email" placeholder="Email" class="login-input" autocomplete="email"></div>' +
        '<div class="login-field"><input type="password" placeholder="Password" class="login-input" autocomplete="current-password"></div>' +
        '<div class="login-actions"><a href="' + p + 'courses/login.html" class="login-forgot">Forgot password?</a><button type="submit" class="login-submit">Sign In</button></div>' +
        '</form>' +
        '</div>' +
        '<a href="' + p + 'articles/complete-kratom-guide.html" class="fs-menu-promo">Is KR-01 Right For You? &rarr;</a>' +
        '</div>' + // /fs-menu-scroll
        '</div>'; // /fs-menu

    // Insert menu into DOM
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    // Get references
    var fsMenu = document.getElementById('fsMenu');
    var menuBackdrop = document.getElementById('menuBackdrop');
    var menuClose = document.getElementById('menuClose');
    var tabs = document.querySelectorAll('.fs-tab');
    var panels = document.querySelectorAll('.fs-panel');

    function openMenu() {
        fsMenu.classList.add('open');
        menuBackdrop.classList.add('open');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Prevent iOS body scroll when menu is open
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.dataset.scrollY = window.scrollY;
        document.body.style.top = '-' + window.scrollY + 'px';
        // Position sliding glass indicator once layout is visible
        requestAnimationFrame(initIndicator);
    }

    function closeMenu() {
        fsMenu.classList.remove('open');
        menuBackdrop.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
        // Restore iOS scroll position
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        var scrollY = document.body.dataset.scrollY;
        if (scrollY) window.scrollTo(0, parseInt(scrollY, 10));
    }

    function toggleMenu(e) {
        if (e) e.preventDefault();
        fsMenu.classList.contains('open') ? closeMenu() : openMenu();
    }

    hamburger.addEventListener('click', toggleMenu);
    // Fallback for mobile browsers that may not fire click reliably
    hamburger.addEventListener('touchend', function(e) {
        e.preventDefault();
        toggleMenu();
    }, { passive: false });

    menuClose.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);
    menuClose.addEventListener('touchend', function(e) { e.preventDefault(); closeMenu(); }, { passive: false });
    menuBackdrop.addEventListener('touchend', function(e) { e.preventDefault(); closeMenu(); }, { passive: false });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });

    // iOS-style sliding glass indicator
    var tabBar = document.querySelector('.fs-menu-tabs');
    var indicator = document.createElement('div');
    indicator.className = 'fs-tab-indicator';
    if (tabBar) tabBar.appendChild(indicator);

    function positionIndicator(activeTab) {
        if (!activeTab || !indicator || !tabBar) return;
        var tabRect = activeTab.getBoundingClientRect();
        var barRect = tabBar.getBoundingClientRect();
        indicator.style.width = tabRect.width + 'px';
        indicator.style.transform = 'translateX(' + (tabRect.left - barRect.left - 4) + 'px)';
    }

    // Position on first open
    function initIndicator() {
        var activeTab = tabBar && tabBar.querySelector('.fs-tab.active');
        if (activeTab) {
            indicator.style.transition = 'none';
            positionIndicator(activeTab);
            // Re-enable transition after initial position
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    indicator.style.transition = '';
                });
            });
        }
    }

    // Tab switching with collapse/expand toggle
    var panelsCollapsed = false;

    function collapseMenu() {
        panelsCollapsed = true;
        fsMenu.classList.add('panels-collapsed');
        tabs.forEach(function(tab) { tab.classList.remove('active'); });
        panels.forEach(function(panel) { panel.classList.remove('active'); });
        indicator.style.opacity = '0';
        // Hide backdrop, restore page scroll — tab bar becomes the header
        menuBackdrop.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        var scrollY = document.body.dataset.scrollY;
        if (scrollY) window.scrollTo(0, parseInt(scrollY, 10));
    }

    function expandMenu(tabName) {
        panelsCollapsed = false;
        fsMenu.classList.remove('panels-collapsed');
        tabs.forEach(function(tab) { tab.classList.toggle('active', tab.dataset.tab === tabName); });
        panels.forEach(function(panel) { panel.classList.toggle('active', panel.dataset.panel === tabName); });
        var scrollEl = document.querySelector('.fs-menu-scroll');
        if (scrollEl) scrollEl.scrollTop = 0;
        indicator.style.opacity = '1';
        var activeTab = tabBar && tabBar.querySelector('.fs-tab.active');
        if (activeTab) positionIndicator(activeTab);
        // Re-lock page scroll and show backdrop
        menuBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.dataset.scrollY = window.scrollY;
        document.body.style.top = '-' + window.scrollY + 'px';
    }

    function switchTab(tabName) {
        var currentActive = tabBar && tabBar.querySelector('.fs-tab.active');
        var clickedSameTab = currentActive && currentActive.dataset.tab === tabName;

        if (clickedSameTab && !panelsCollapsed) {
            // Clicking active tab → collapse panels, keep tab bar + X
            collapseMenu();
        } else {
            // Clicking different tab or expanding from collapsed
            expandMenu(tabName);
        }
    }

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() { switchTab(tab.dataset.tab); });
    });

    // Swipe between tabs
    var touchStartX = 0;
    var touchStartY = 0;
    var scrollEl = document.querySelector('.fs-menu-scroll');
    var tabOrder = ['shop', 'science', 'learn', 'login'];

    if (scrollEl) {
        scrollEl.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        scrollEl.addEventListener('touchend', function(e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                var current = document.querySelector('.fs-tab.active').dataset.tab;
                var i = tabOrder.indexOf(current);
                if (dx < 0 && i < tabOrder.length - 1) switchTab(tabOrder[i + 1]);
                else if (dx > 0 && i > 0) switchTab(tabOrder[i - 1]);
            }
        }, { passive: true });
    }

    // Close on link click inside menu
    fsMenu.querySelectorAll('.product-row, .panel-item, .fs-cta-primary, .fs-cta-secondary, .shop-all-link, .ref-list a, .all-articles-link').forEach(function(el) {
        el.addEventListener('click', closeMenu);
    });

    // Auto-close menu when resizing past desktop breakpoint
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && fsMenu.classList.contains('open')) {
            closeMenu();
        }
    });
}

/**
 * Scroll Effects
 */
function initScrollEffects() {
    // Reveal animations on scroll
    var observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.research-card, .product-card, .service-card, .trust-item').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // .reveal class observer (seed-template pattern)
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        var seedObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    seedObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function(el) { seedObserver.observe(el); });
    }
}

/**
 * Forms
 */
function initForms() {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            const button = newsletterForm.querySelector('button');
            const originalText = button.innerHTML;

            // Show loading state
            button.innerHTML = '<span>Joining...</span>';
            button.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success
            button.innerHTML = '<span>Joined!</span>';
            newsletterForm.reset();

            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);

            // Show success message (could be a toast notification)
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            const button = contactForm.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;

            // Show loading state
            button.innerHTML = '<span>Sending...</span>';
            button.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success
            button.innerHTML = '<span>Message Sent!</span>';
            contactForm.reset();

            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);

        });
    }

    // Add floating label effect (optional enhancement)
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Check initial state
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

/**
 * Animations
 */
function initAnimations() {
    // Add CSS for revealed state
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Stagger reveal animations
    const cards = document.querySelectorAll('.research-card, .product-card, .service-card');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Hero animations
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-stats');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

        // Trigger animation after a short delay
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100);
    });

    // Molecule animation enhancement
    const molecule = document.querySelector('.hero-molecule');
    if (molecule) {
        let rotation = 0;
        const animate = () => {
            rotation += 0.1;
            molecule.style.transform = `rotate(${rotation}deg)`;
            requestAnimationFrame(animate);
        };
        // Uncomment to enable slow rotation:
        // animate();
    }
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Mobile Enhancements
 */
function initMobileEnhancements() {
    const mobileCta = document.getElementById('mobileCta');
    const scrollTop = document.getElementById('scrollTop');
    const heroSection = document.querySelector('.hero');

    // Check if we're on mobile
    const isMobile = () => window.innerWidth <= 768;

    // Mobile CTA visibility
    if (mobileCta && heroSection) {
        let ctaVisible = false;

        const updateMobileCtaVisibility = () => {
            if (!isMobile()) {
                mobileCta.classList.remove('visible');
                return;
            }

            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            const scrollPosition = window.scrollY + window.innerHeight;

            if (scrollPosition > heroBottom + 100 && !ctaVisible) {
                mobileCta.classList.add('visible');
                ctaVisible = true;
            } else if (scrollPosition <= heroBottom && ctaVisible) {
                mobileCta.classList.remove('visible');
                ctaVisible = false;
            }
        };

        window.addEventListener('scroll', throttle(updateMobileCtaVisibility, 100));
        window.addEventListener('resize', debounce(updateMobileCtaVisibility, 150));
        updateMobileCtaVisibility();
    }

    // Scroll to top button
    if (scrollTop) {
        let scrollTopVisible = false;

        const updateScrollTopVisibility = () => {
            if (window.scrollY > 500 && !scrollTopVisible) {
                scrollTop.classList.add('visible');
                scrollTopVisible = true;
            } else if (window.scrollY <= 500 && scrollTopVisible) {
                scrollTop.classList.remove('visible');
                scrollTopVisible = false;
            }
        };

        scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', throttle(updateScrollTopVisibility, 100));
        updateScrollTopVisibility();
    }

    // Hide swipe hints after first interaction
    const swipeHints = document.querySelectorAll('.swipe-hint');
    const swipeContainers = document.querySelectorAll('.research-grid, .trust-grid');

    swipeContainers.forEach((container, index) => {
        let hasScrolled = false;

        container.addEventListener('scroll', () => {
            if (!hasScrolled) {
                hasScrolled = true;
                const hint = swipeHints[index] || swipeHints[0];
                if (hint) {
                    hint.style.opacity = '0';
                    setTimeout(() => {
                        hint.style.display = 'none';
                    }, 300);
                }
            }
        }, { passive: true });
    });

    // Improve touch scrolling performance
    document.querySelectorAll('.research-grid, .trust-grid').forEach(el => {
        el.style.willChange = 'scroll-position';
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        // Small delay to allow for orientation change to complete
        setTimeout(() => {
            // Recalculate any position-dependent elements
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });

    // Prevent pull-to-refresh on mobile when scrolling horizontally
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!e.cancelable) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);

        // If horizontal scroll is dominant, prevent vertical scroll interference
        if (deltaX > deltaY * 1.5) {
            const target = e.target.closest('.research-grid, .trust-grid');
            if (target) {
                // Allow horizontal scrolling
                e.stopPropagation();
            }
        }
    }, { passive: false });

    /* Theme color meta handled statically */

    // Lazy load images when they come into view (for future image additions)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add haptic feedback for supported devices (optional)
    if ('vibrate' in navigator) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.vibrate(10);
            });
        });
    }

}

/**
 * Product Category Filtering
 */
function initProductFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');
    const productsGrid = document.querySelector('.products-grid');

    if (!categoryButtons.length || !productCards.length) return;

    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            // Update active button state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter products with animation
            filterProducts(category, productCards);

            // Scroll to products section smoothly
            const productsSection = document.getElementById('products');
            if (productsSection && window.scrollY > productsSection.offsetTop) {
                // Already past products, no need to scroll
            }
        });
    });

    // Add keyboard navigation for category buttons
    categoryButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = categoryButtons[index + 1] || categoryButtons[0];
                next.focus();
                next.click();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = categoryButtons[index - 1] || categoryButtons[categoryButtons.length - 1];
                prev.focus();
                prev.click();
            }
        });
    });

    // URL hash-based filtering
    const handleHashFilter = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash.startsWith('filter-')) {
            const category = hash.replace('filter-', '');
            const targetButton = document.querySelector(`.category-btn[data-category="${category}"]`);
            if (targetButton) {
                targetButton.click();
            }
        }
    };

    window.addEventListener('hashchange', handleHashFilter);
    handleHashFilter(); // Check on load

}

/**
 * Filter products by category with staggered animation
 */
function filterProducts(category, productCards) {
    let visibleIndex = 0;

    productCards.forEach((card, index) => {
        const cardCategory = card.dataset.category;
        const shouldShow = category === 'all' || cardCategory === category;

        if (shouldShow) {
            // Show with staggered animation
            card.classList.remove('hidden');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, visibleIndex * 50);

            visibleIndex++;
        } else {
            // Hide immediately
            card.classList.add('hidden');
            card.style.opacity = '0';
        }
    });

    // Update product count display if exists
    const productCount = document.querySelector('.product-count');
    if (productCount) {
        productCount.textContent = `${visibleIndex} product${visibleIndex !== 1 ? 's' : ''}`;
    }
}

/**
 * Featured Products Carousel
 */
function initFeaturedCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track || !prevBtn || !nextBtn) {
        return;
    }

    const cards = track.querySelectorAll('.featured-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const totalDots = Math.ceil(totalCards / cardsPerView);

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Get cards per view based on screen width
    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    // Calculate slide width
    function getSlideWidth() {
        if (!cards.length) return 0;
        const card = cards[0];
        const style = window.getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseFloat(style.marginRight) || 0;
        const gap = 24; // var(--spacing-lg)
        return width + gap;
    }

    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = Math.min(Math.max(0, index * cardsPerView), maxIndex);
        updateCarousel();
    }

    // Check if mobile (using native scroll)
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Update carousel position
    function updateCarousel() {
        // On mobile, use native scroll instead of transform
        if (isMobile()) {
            track.style.transform = 'none';
            // Scroll to current card
            const card = cards[currentIndex];
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        } else {
            const slideWidth = getSlideWidth();
            const translateX = -currentIndex * slideWidth;
            track.style.transform = `translateX(${translateX}px)`;
        }

        // Update buttons
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= totalCards - cardsPerView;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        const activeDotIndex = Math.floor(currentIndex / cardsPerView);
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeDotIndex);
        });
    }

    // Next slide
    function nextSlide() {
        const maxIndex = totalCards - cardsPerView;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    }

    // Previous slide
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Keyboard navigation
    track.parentElement.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchTarget = null;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        touchTarget = e.target;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        // Don't trigger swipe if the touch started on an interactive element
        const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT'];
        const clickedInteractive = touchTarget && (
            interactiveElements.includes(touchTarget.tagName) ||
            touchTarget.closest('button') ||
            touchTarget.closest('a') ||
            touchTarget.closest('.add-to-cart-btn')
        );

        if (clickedInteractive) {
            return; // Let the click happen naturally
        }

        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 80; // Increased threshold to reduce accidental swipes
        const verticalThreshold = 50; // If vertical movement is significant, it's a scroll not swipe
        const maxSwipeTime = 500; // Swipe must complete within 500ms

        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        const swipeTime = Date.now() - touchStartTime;

        // Only trigger swipe if:
        // 1. Horizontal movement exceeds threshold
        // 2. Vertical movement is minimal (not a scroll)
        // 3. Swipe completed quickly (intentional gesture)
        if (Math.abs(diffX) > swipeThreshold &&
            diffY < verticalThreshold &&
            swipeTime < maxSwipeTime) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                cardsPerView = newCardsPerView;
                currentIndex = 0;
                createDots();
                updateCarousel();
            }
        }, 250);
    });

    // Auto-advance (every 5 seconds with gentle transition) - disabled on mobile
    let autoAdvance;

    function startAutoAdvance() {
        // Don't auto-advance on mobile - let users control via native scroll
        if (isMobile()) return;

        stopAutoAdvance(); // Clear any existing interval
        autoAdvance = setInterval(() => {
            if (currentIndex < totalCards - cardsPerView) {
                nextSlide();
            } else {
                currentIndex = 0;
                updateCarousel();
            }
        }, 5000); // Increased to 5 seconds for less aggressive advancement
    }

    function stopAutoAdvance() {
        if (autoAdvance) {
            clearInterval(autoAdvance);
            autoAdvance = null;
        }
    }

    // Pause on hover/touch, resume after (desktop only)
    track.addEventListener('mouseenter', stopAutoAdvance);
    track.addEventListener('mouseleave', () => {
        if (!isMobile()) startAutoAdvance();
    });
    // Touch events - stop auto-advance but don't resume on mobile
    track.addEventListener('touchstart', stopAutoAdvance, { passive: true });

    // Sync dots with native scroll on mobile
    let scrollTimeout;
    track.addEventListener('scroll', () => {
        if (!isMobile()) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Find which card is most visible
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;

            let closestCard = 0;
            let closestDistance = Infinity;

            cards.forEach((card, i) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - trackCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCard = i;
                }
            });

            currentIndex = closestCard;

            // Update dots without scrolling
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }, 100);
    }, { passive: true });

    // Create overlay navigation arrows
    function createOverlayArrows() {
        const container = track.parentElement;

        // Create left arrow
        const leftArrow = document.createElement('button');
        leftArrow.className = 'carousel-overlay-arrow carousel-overlay-left';
        leftArrow.setAttribute('aria-label', 'Previous');
        leftArrow.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 19l-7-7 7-7"/>
            </svg>
        `;
        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
            stopAutoAdvance();
            setTimeout(startAutoAdvance, 3000);
        });

        // Create right arrow
        const rightArrow = document.createElement('button');
        rightArrow.className = 'carousel-overlay-arrow carousel-overlay-right';
        rightArrow.setAttribute('aria-label', 'Next');
        rightArrow.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"/>
            </svg>
        `;
        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
            stopAutoAdvance();
            setTimeout(startAutoAdvance, 3000);
        });

        container.appendChild(leftArrow);
        container.appendChild(rightArrow);

        // Update arrow visibility based on position
        function updateOverlayArrows() {
            leftArrow.classList.toggle('hidden', currentIndex === 0);
            rightArrow.classList.toggle('hidden', currentIndex >= totalCards - cardsPerView);
        }

        // Hook into updateCarousel
        const originalUpdate = updateCarousel;
        updateCarousel = function() {
            originalUpdate();
            updateOverlayArrows();
        };

        updateOverlayArrows();
    }

    // Initialize
    createDots();
    createOverlayArrows();
    updateCarousel();
    startAutoAdvance();

}

/**
 * View All Products Toggle
 */
function initViewAllProducts() {
    const viewAllBtn = document.getElementById('viewAllBtn');
    const fullCatalog = document.getElementById('fullCatalog');

    if (!viewAllBtn || !fullCatalog) {
        return;
    }

    // Update button text based on state
    function updateButtonText(isExpanded) {
        const textSpan = viewAllBtn.querySelector('.view-all-text');
        if (textSpan) {
            textSpan.textContent = isExpanded ? 'Hide Products' : 'View All Products';
        }
    }

    // Toggle catalog visibility
    viewAllBtn.addEventListener('click', () => {
        const isExpanded = fullCatalog.classList.toggle('expanded');
        viewAllBtn.classList.toggle('active', isExpanded);
        updateButtonText(isExpanded);

        // Smooth scroll to catalog if expanding
        if (isExpanded) {
            setTimeout(() => {
                fullCatalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Announce state change for accessibility
        viewAllBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Initialize ARIA
    viewAllBtn.setAttribute('aria-expanded', 'false');
    viewAllBtn.setAttribute('aria-controls', 'fullCatalog');

}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterProducts };
}
