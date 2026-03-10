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
    initProductCarousel();
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
    // On desktop scroll: single glass pill with logo + Products/Articles/Classes/Company
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

    // Initialize desktop dropdown menus
    initDesktopDropdowns(nav);

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
 * Desktop Dropdown Menus (Seed Pattern)
 * Mega-menu dropdowns for nav links on desktop with 2-column layout
 */
function initDesktopDropdowns(nav) {
    // Only on desktop
    if (window.innerWidth <= 768) return;

    var mainLinks = nav.querySelector('.nav-main-links');
    if (!mainLinks) return;

    // Dropdown data matching fullscreen menu structure
    var dropdownData = {
        'products': {
            wide: true,
            col1Title: 'Categories',
            col1Links: [
                { text: 'Tinctures', href: 'products/tinctures.html', icon: '&#128167;' },
                { text: 'Gummies', href: 'products/gummies.html', icon: '&#127852;' },
                { text: 'Extracts', href: 'products/extracts.html', icon: '&#9878;' },
                { text: 'Dried Botanicals', href: 'products/dried-botanicals.html', icon: '&#127807;' },
                { text: 'Live Plants', href: 'products/live-plants.html', icon: '&#127811;' },
                { text: 'Seeds', href: 'products/seeds.html', icon: '&#127793;' }
            ],
            col2Title: 'Products',
            col2Groups: [
                { heading: 'Tinctures', items: [
                    { text: '5000mg Blue Lotus Tincture', href: 'products/tinctures.html', price: '$60' },
                    { text: '3000mg Kanna Tincture', href: 'products/tinctures.html', price: '$80' }
                ]},
                { heading: 'Gummies', items: [
                    { text: '500mg Kanna Gummies', href: 'products/gummies.html', price: '$40' },
                    { text: '2500mg Blue Lotus Gummies', href: 'products/gummies.html', price: '$40' }
                ]},
                { heading: 'Extracts', items: [
                    { text: '1g Blue Lotus Resin Extract', href: 'products/extracts.html', price: '$30' },
                    { text: '1g High Potency Kanna Extract', href: 'products/extracts.html', price: '$40' },
                    { text: 'Kava Kava CO2 Extract', href: 'products/extracts.html', price: '$30' }
                ]},
                { heading: 'Dried Botanicals', items: [
                    { text: 'Dried Blue Lotus (1 oz)', href: 'products/dried-botanicals.html', price: '$30' },
                    { text: 'Dried Kanna (1 oz)', href: 'products/dried-botanicals.html', price: '$30' }
                ]},
                { heading: 'Live Plants', items: [
                    { text: 'Purple Dragon Fruit 12-16"', href: 'products/live-plants.html', price: '$20' },
                    { text: 'Bob Gordon Elderberry 12-16"', href: 'products/live-plants.html', price: '$20' },
                    { text: 'Central TX Prickly Pear', href: 'products/live-plants.html', price: '$20' },
                    { text: 'Davis Mountain Yucca 6"', href: 'products/live-plants.html', price: '$25' }
                ]},
                { heading: 'Seeds', items: [
                    { text: 'Heirloom Sugarcane Seeds', href: 'products/seeds.html', price: '$20' },
                    { text: 'Hibiscus Seeds', href: 'products/seeds.html', price: '$20' },
                    { text: 'Nicotiana Rustica (Hape) Seeds', href: 'products/seeds.html', price: '$40' }
                ]}
            ],
            footerText: 'Shop All Products',
            footerHref: 'index.html#products'
        },
        'articles': {
            col1Title: 'Categories',
            col1Links: [
                { text: 'Garden / Farm Design', href: 'blog.html', icon: '&#127793;' },
                { text: 'Plant Articles', href: 'blog.html', icon: '&#127807;' },
                { text: 'Extract Methods', href: 'articles/extraction-methods.html', icon: '&#9878;' },
                { text: 'Compounds', href: 'articles/blue-lotus-compounds.html', icon: '&#128300;' },
                { text: 'Studies', href: 'research.html', icon: '&#128200;' }
            ],
            col2Title: 'Featured Articles',
            col2Links: [
                { text: 'Adaptogens: The Science', href: 'articles/adaptogens-science.html', meta: '8 min' },
                { text: 'Kavalactones Explained', href: 'articles/kavalactones-explained.html', meta: '6 min' },
                { text: 'Extraction Methods Compared', href: 'articles/extraction-methods.html', meta: '10 min' },
                { text: 'Blue Lotus Compounds', href: 'articles/blue-lotus-compounds.html', meta: '12 min' }
            ],
            footerText: 'All 50+ Articles',
            footerHref: 'blog.html'
        },
        'classes': {
            col1Title: 'Growing Classes',
            col1Links: [
                { text: 'Cultivation Techniques', href: 'classroom/growing.html', icon: '&#127793;' },
                { text: 'Infrastructure & Equipment', href: 'classroom/infrastructure.html', icon: '&#128296;' },
                { text: 'Browse All Classes', href: 'classes.html', icon: '&#128218;' }
            ],
            col2Title: 'Extraction Classes',
            col2Links: [
                { text: 'Extraction Methods', href: 'classroom/extraction.html' },
                { text: 'Effects & Alkaloids', href: 'classroom/effects.html' },
                { text: 'Classroom Portal', href: 'classroom.html' },
                { text: 'Course Login', href: 'courses/login.html' }
            ],
            footerText: null,
            footerHref: null
        },
        'company': {
            col1Title: 'About Us',
            col1Links: [
                { text: 'Our Story & Mission', href: 'about-us.html', icon: '&#127807;' },
                { text: 'Sustainability', href: 'about-us.html#sustainability', icon: '&#127811;' },
                { text: 'Research & Labs', href: 'research.html', icon: '&#128300;' },
                { text: 'Consulting', href: 'consulting.html', icon: '&#128200;' }
            ],
            col2Title: 'Contact Us',
            col2Links: [
                { text: 'Get in Touch', href: 'contact.html' },
                { text: 'Wholesale Portal', href: 'wholesale/index.html' },
                { text: 'Partnerships', href: 'consulting.html' }
            ],
            footerText: null,
            footerHref: null
        }
    };

    // Attach dropdowns to matching nav links
    var links = mainLinks.querySelectorAll('a');
    links.forEach(function(link) {
        var text = link.textContent.trim().toLowerCase();
        var data = dropdownData[text];
        if (!data) return;

        // Wrap the link in a container for positioning
        var wrapper = document.createElement('div');
        wrapper.className = 'nav-dropdown-wrap';
        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(link);

        // Build dropdown HTML
        var dropdown = document.createElement('div');
        dropdown.className = 'nav-dropdown' + (data.wide ? ' nav-dropdown-wide' : '');

        var inner = '<div class="nav-dropdown-inner">';
        // Column 1
        inner += '<div class="nav-dropdown-col">';
        inner += '<div class="nav-dropdown-heading">' + data.col1Title + '</div>';
        data.col1Links.forEach(function(item) {
            inner += '<a href="' + item.href + '" class="nav-dropdown-link">';
            if (item.icon) inner += '<span class="nav-dropdown-icon">' + item.icon + '</span>';
            inner += '<span>' + item.text + '</span>';
            inner += '</a>';
        });
        inner += '</div>';
        // Column 2
        inner += '<div class="nav-dropdown-col">';
        inner += '<div class="nav-dropdown-heading">' + data.col2Title + '</div>';
        if (data.col2Groups) {
            // Grouped product listing
            data.col2Groups.forEach(function(group) {
                inner += '<div class="nav-dropdown-group-label">' + group.heading + '</div>';
                group.items.forEach(function(item) {
                    inner += '<a href="' + item.href + '" class="nav-dropdown-link nav-dropdown-product">';
                    inner += '<span>' + item.text + '</span>';
                    if (item.price) inner += '<span class="nav-dropdown-meta">' + item.price + '</span>';
                    inner += '</a>';
                });
            });
        } else if (data.col2Links) {
            data.col2Links.forEach(function(item) {
                inner += '<a href="' + item.href + '" class="nav-dropdown-link">';
                if (item.icon) inner += '<span class="nav-dropdown-icon">' + item.icon + '</span>';
                inner += '<span>' + item.text + '</span>';
                if (item.price) inner += '<span class="nav-dropdown-meta">' + item.price + '</span>';
                if (item.meta) inner += '<span class="nav-dropdown-meta">' + item.meta + '</span>';
                inner += '</a>';
            });
        }
        inner += '</div>';
        inner += '</div>';
        // Footer
        if (data.footerText) {
            inner += '<div class="nav-dropdown-footer"><a href="' + data.footerHref + '">' + data.footerText + ' &rarr;</a></div>';
        }

        dropdown.innerHTML = inner;
        wrapper.appendChild(dropdown);

        // Show/hide on hover
        var hideTimer = null;
        wrapper.addEventListener('mouseenter', function() {
            clearTimeout(hideTimer);
            // Close any other open dropdowns
            document.querySelectorAll('.nav-dropdown-wrap.active').forEach(function(w) {
                if (w !== wrapper) w.classList.remove('active');
            });
            wrapper.classList.add('active');
        });
        wrapper.addEventListener('mouseleave', function() {
            hideTimer = setTimeout(function() {
                wrapper.classList.remove('active');
            }, 150);
        });
    });

    // Close dropdowns on scroll
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.nav-dropdown-wrap.active').forEach(function(w) {
            w.classList.remove('active');
        });
    }, { passive: true });
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
        '<button class="fs-tab active" data-tab="products">Shop</button>' +
        '<button class="fs-tab" data-tab="articles">Articles</button>' +
        '<button class="fs-tab" data-tab="classes">Learn</button>' +
        '<button class="fs-tab" data-tab="company">About</button>' +
        '<button class="fs-tab" data-tab="login">Login</button>' +
        '<button class="fs-menu-close" id="menuClose" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="fs-menu-scroll">' +

        // ---- PRODUCTS panel ----
        '<div class="fs-panel active" data-panel="products">' +
        '<div class="panel-group-header" style="padding-top:0.25rem">Categories</div>' +
        '<div class="category-grid">' +
        '<a href="' + p + 'products/tinctures.html" class="category-pill-link"><span class="category-pill-icon">&#128167;</span><span>Tinctures</span></a>' +
        '<a href="' + p + 'products/gummies.html" class="category-pill-link"><span class="category-pill-icon">&#127852;</span><span>Gummies</span></a>' +
        '<a href="' + p + 'products/extracts.html" class="category-pill-link"><span class="category-pill-icon">&#9878;</span><span>Extracts</span></a>' +
        '<a href="' + p + 'products/dried-botanicals.html" class="category-pill-link"><span class="category-pill-icon">&#127807;</span><span>Dried Botanicals</span></a>' +
        '<a href="' + p + 'products/live-plants.html" class="category-pill-link"><span class="category-pill-icon">&#127811;</span><span>Live Plants</span></a>' +
        '<a href="' + p + 'products/seeds.html" class="category-pill-link"><span class="category-pill-icon">&#127793;</span><span>Seeds</span></a>' +
        '</div>' +

        // Tinctures
        '<div class="panel-group-header">Tinctures</div>' +
        '<a href="' + p + 'products/tinctures.html" class="product-row"><div class="product-thumb"><div class="jar blue"></div></div><div class="product-info"><div class="product-name">5000mg Blue Lotus Tincture</div></div><div class="product-price">$60</div></a>' +
        '<a href="' + p + 'products/tinctures.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">3000mg Kanna Tincture</div></div><div class="product-price">$80</div></a>' +

        // Gummies
        '<div class="panel-group-header">Gummies</div>' +
        '<a href="' + p + 'products/gummies.html" class="product-row"><div class="product-thumb"><div class="jar amber"></div></div><div class="product-info"><div class="product-name">500mg Kanna Gummies</div></div><div class="product-price">$40</div></a>' +
        '<a href="' + p + 'products/gummies.html" class="product-row"><div class="product-thumb"><div class="jar blue"></div></div><div class="product-info"><div class="product-name">2500mg Blue Lotus Gummies</div></div><div class="product-price">$40</div></a>' +

        // Extracts
        '<div class="panel-group-header">Extracts</div>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar blue"></div></div><div class="product-info"><div class="product-name">1g Blue Lotus Resin Extract</div></div><div class="product-price">$30</div></a>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">1g High Potency Kanna Extract</div></div><div class="product-price">$40</div></a>' +
        '<a href="' + p + 'products/extracts.html" class="product-row"><div class="product-thumb"><div class="jar teal"></div></div><div class="product-info"><div class="product-name">High Potency Kava Kava CO2 Extract</div></div><div class="product-price">$30</div></a>' +

        // Dried Botanicals
        '<div class="panel-group-header">Dried Botanicals</div>' +
        '<a href="' + p + 'products/dried-botanicals.html" class="product-row"><div class="product-thumb"><div class="jar blue"></div></div><div class="product-info"><div class="product-name">Dried Blue Lotus (1 oz)</div></div><div class="product-price">$30</div></a>' +
        '<a href="' + p + 'products/dried-botanicals.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">Dried Kanna (1 oz)</div></div><div class="product-price">$30</div></a>' +

        // Live Plants
        '<div class="panel-group-header">Live Plants</div>' +
        '<a href="' + p + 'products/live-plants.html" class="product-row"><div class="product-thumb"><div class="jar teal"></div></div><div class="product-info"><div class="product-name">Purple Dragon Fruit, rooted 12-16&quot;</div></div><div class="product-price">$20</div></a>' +
        '<a href="' + p + 'products/live-plants.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">Bob Gordon Elderberry, 12-16&quot;</div></div><div class="product-price">$20</div></a>' +
        '<a href="' + p + 'products/live-plants.html" class="product-row"><div class="product-thumb"><div class="jar amber"></div></div><div class="product-info"><div class="product-name">Central Texas Prickly Pear, 2 pads</div></div><div class="product-price">$20</div></a>' +
        '<a href="' + p + 'products/live-plants.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">Davis Mountain Yucca, 6&quot;</div></div><div class="product-price">$25</div></a>' +

        // Seeds
        '<div class="panel-group-header">Seeds</div>' +
        '<a href="' + p + 'products/seeds.html" class="product-row"><div class="product-thumb"><div class="jar amber"></div></div><div class="product-info"><div class="product-name">Heirloom Sugarcane Seeds</div></div><div class="product-price">$20</div></a>' +
        '<a href="' + p + 'products/seeds.html" class="product-row"><div class="product-thumb"><div class="jar teal"></div></div><div class="product-info"><div class="product-name">Hibiscus Seeds</div></div><div class="product-price">$20</div></a>' +
        '<a href="' + p + 'products/seeds.html" class="product-row"><div class="product-thumb"><div class="jar green"></div></div><div class="product-info"><div class="product-name">Nicotiana Rustica (Hape) Seeds</div></div><div class="product-price">$40</div></a>' +

        '<a href="' + p + 'index.html#products" class="shop-all-link">Shop All Products &rarr;</a>' +
        '</div>' +

        // ---- ARTICLES panel ----
        '<div class="fs-panel" data-panel="articles">' +
        '<div class="panel-group-header" style="padding-top:0.25rem">Categories</div>' +
        '<div class="category-grid">' +
        '<a href="' + p + 'blog.html" class="category-pill-link"><span class="category-pill-icon">&#127793;</span><span>Garden / Farm Design</span></a>' +
        '<a href="' + p + 'blog.html" class="category-pill-link"><span class="category-pill-icon">&#127807;</span><span>Plant Articles</span></a>' +
        '<a href="' + p + 'articles/extraction-methods.html" class="category-pill-link"><span class="category-pill-icon">&#9878;</span><span>Extract Methods</span></a>' +
        '<a href="' + p + 'articles/blue-lotus-compounds.html" class="category-pill-link"><span class="category-pill-icon">&#128300;</span><span>Compounds</span></a>' +
        '<a href="' + p + 'research.html" class="category-pill-link"><span class="category-pill-icon">&#128200;</span><span>Studies</span></a>' +
        '</div>' +
        '<div class="panel-group-header">Featured Articles</div>' +
        '<a href="' + p + 'articles/adaptogens-science.html" class="panel-item"><div class="article-thumb article-thumb-1"></div><div class="panel-item-content"><div class="panel-item-title">Adaptogens: The Science</div><div class="panel-item-meta">8 min read</div></div></a>' +
        '<a href="' + p + 'articles/kavalactones-explained.html" class="panel-item"><div class="article-thumb article-thumb-2"></div><div class="panel-item-content"><div class="panel-item-title">Kavalactones Explained</div><div class="panel-item-meta">6 min read</div></div></a>' +
        '<a href="' + p + 'articles/extraction-methods.html" class="panel-item"><div class="article-thumb article-thumb-3"></div><div class="panel-item-content"><div class="panel-item-title">Extraction Methods Compared</div><div class="panel-item-meta">10 min read</div></div></a>' +
        '<a href="' + p + 'articles/blue-lotus-compounds.html" class="panel-item"><div class="article-thumb article-thumb-4"></div><div class="panel-item-content"><div class="panel-item-title">Blue Lotus Compounds & Research</div><div class="panel-item-meta">12 min read</div></div></a>' +
        '<a href="' + p + 'blog.html" class="all-articles-link">All Articles &rarr;</a>' +
        '</div>' +

        // ---- CLASSES panel ----
        '<div class="fs-panel" data-panel="classes">' +
        '<div class="panel-group-header" style="padding-top:0.25rem">Growing Classes</div>' +
        '<a href="' + p + 'classroom/growing.html" class="panel-item"><div class="panel-item-image img-sustainability">&#127793;</div><div class="panel-item-content"><div class="panel-item-title">Cultivation Techniques</div><div class="panel-item-desc">Soil preparation, planting, harvesting, and food forest design.</div></div></a>' +
        '<a href="' + p + 'classroom/infrastructure.html" class="panel-item"><div class="panel-item-image img-scientists">&#128296;</div><div class="panel-item-content"><div class="panel-item-title">Infrastructure & Equipment</div><div class="panel-item-desc">Tools, irrigation, structures, and systems for sustainable growing.</div></div></a>' +

        '<div class="panel-group-header">Extraction Classes</div>' +
        '<a href="' + p + 'classroom/extraction.html" class="panel-item"><div class="panel-item-image img-approach">&#9878;</div><div class="panel-item-content"><div class="panel-item-title">Extraction Methods</div><div class="panel-item-desc">Water, ethanol, CO2, and cold-process extraction techniques.</div></div></a>' +
        '<a href="' + p + 'classroom/effects.html" class="panel-item"><div class="panel-item-image img-labs">&#128300;</div><div class="panel-item-content"><div class="panel-item-title">Effects & Alkaloids</div><div class="panel-item-desc">How kavalactones, aporphines, and mesembrine work in the body.</div></div></a>' +

        '<div class="panel-group-header">Quick Links</div>' +
        '<ul class="ref-list">' +
        '<li><a href="' + p + 'classes.html">Browse All Classes</a></li>' +
        '<li><a href="' + p + 'classroom.html">Classroom Portal</a></li>' +
        '<li><a href="' + p + 'courses/login.html">Course Login</a></li>' +
        '</ul>' +
        '</div>' +

        // ---- COMPANY panel ----
        '<div class="fs-panel" data-panel="company">' +
        '<div class="panel-group-header" style="padding-top:0.25rem">About Us</div>' +
        '<a href="' + p + 'about-us.html" class="panel-item"><div class="panel-item-image img-approach">&#127807;</div><div class="panel-item-content"><div class="panel-item-title">Our Story & Mission</div><div class="panel-item-desc">15+ years of ethnobotanical research from Texas Hill Country.</div></div></a>' +
        '<a href="' + p + 'about-us.html#sustainability" class="panel-item"><div class="panel-item-image img-sustainability">&#127811;</div><div class="panel-item-content"><div class="panel-item-title">Sustainability</div><div class="panel-item-desc">Our commitment to ecological responsibility and ethical sourcing.</div></div></a>' +
        '<a href="' + p + 'research.html" class="panel-item"><div class="panel-item-image img-labs">&#128300;</div><div class="panel-item-content"><div class="panel-item-title">Research & Labs</div><div class="panel-item-desc">GMP-compliant facility, third-party testing, and COAs.</div></div></a>' +

        '<div class="panel-group-header">Contact Us</div>' +
        '<a href="' + p + 'contact.html" class="panel-item"><div class="panel-item-image img-labs">&#9993;</div><div class="panel-item-content"><div class="panel-item-title">Get in Touch</div><div class="panel-item-desc">Questions, orders, wholesale inquiries, or partnerships.</div></div></a>' +
        '<a href="' + p + 'consulting.html" class="panel-item"><div class="panel-item-image img-scientists">&#128200;</div><div class="panel-item-content"><div class="panel-item-title">Consulting Services</div><div class="panel-item-desc">Extraction consulting, farm design, and botanical sourcing.</div></div></a>' +
        '</div>' +

        // ---- LOGIN panel ----
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
        '<div class="login-signup-cta">' +
        '<p class="login-signup-text">Don\'t have an account?</p>' +
        '<a href="' + p + 'courses/login.html?mode=signup" class="login-signup-btn">Create Account</a>' +
        '</div>' +
        '<div class="login-divider" style="margin-top:1.25rem"><span>WHOLESALE</span></div>' +
        '<a href="' + p + 'wholesale/index.html" class="wholesale-login-link">Wholesale Portal &rarr;</a>' +
        '<p class="wholesale-desc">Authorized retailers and distributors can access bulk pricing, lab reports, and wholesale ordering.</p>' +
        '</div>' +

        '<a href="' + p + 'products/extracts.html" class="fs-menu-promo">Explore Our Extracts &rarr;</a>' +
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
    var tabOrder = ['products', 'articles', 'classes', 'company', 'login'];

    if (scrollEl) {
        scrollEl.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        scrollEl.addEventListener('touchend', function(e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                var activeTab = document.querySelector('.fs-tab.active');
                if (!activeTab) return;
                var current = activeTab.dataset.tab;
                var i = tabOrder.indexOf(current);
                if (dx < 0 && i < tabOrder.length - 1) switchTab(tabOrder[i + 1]);
                else if (dx > 0 && i > 0) switchTab(tabOrder[i - 1]);
            }
        }, { passive: true });
    }

    // Close on link click inside menu
    fsMenu.querySelectorAll('.product-row, .panel-item, .fs-cta-primary, .fs-cta-secondary, .shop-all-link, .ref-list a, .all-articles-link, .category-pill-link, .wholesale-login-link').forEach(function(el) {
        el.addEventListener('click', closeMenu);
    });

    // Auto-close menu when resizing past desktop breakpoint + reposition indicator
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && fsMenu.classList.contains('open')) {
            closeMenu();
        }
        // Reposition the sliding indicator on resize
        var activeTab = tabBar && tabBar.querySelector('.fs-tab.active');
        if (activeTab && indicator) {
            indicator.style.transition = 'none';
            positionIndicator(activeTab);
            requestAnimationFrame(function() {
                indicator.style.transition = '';
            });
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

    // Combined scroll handler for mobile CTA + scroll-to-top
    let ctaVisible = false;
    let scrollTopVisible = false;

    const updateMobileScrollElements = () => {
        const scrollY = window.scrollY;

        if (mobileCta && heroSection) {
            if (!isMobile()) {
                mobileCta.classList.remove('visible');
            } else {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                const scrollPosition = scrollY + window.innerHeight;

                if (scrollPosition > heroBottom + 100 && !ctaVisible) {
                    mobileCta.classList.add('visible');
                    ctaVisible = true;
                } else if (scrollPosition <= heroBottom && ctaVisible) {
                    mobileCta.classList.remove('visible');
                    ctaVisible = false;
                }
            }
        }

        if (scrollTop) {
            if (scrollY > 500 && !scrollTopVisible) {
                scrollTop.classList.add('visible');
                scrollTopVisible = true;
            } else if (scrollY <= 500 && scrollTopVisible) {
                scrollTop.classList.remove('visible');
                scrollTopVisible = false;
            }
        }
    };

    if (mobileCta || scrollTop) {
        window.addEventListener('scroll', throttle(updateMobileScrollElements, 100), { passive: true });
        if (mobileCta) window.addEventListener('resize', debounce(updateMobileScrollElements, 150));
        updateMobileScrollElements();
    }

    if (scrollTop) {
        scrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);

        // If horizontal scroll is dominant, prevent vertical scroll interference
        if (deltaX > deltaY * 1.5) {
            const target = e.target.closest('.research-grid, .trust-grid');
            if (target) {
                e.stopPropagation();
            }
        }
    }, { passive: true });

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
 * Product Carousel (Embla Carousel)
 * Fluid, physics-based carousel with no scroll hijacking.
 */
function initProductCarousel() {
    var emblaNode = document.getElementById('productsEmbla');
    if (!emblaNode || typeof EmblaCarousel === 'undefined') return;

    var viewportNode = emblaNode.querySelector('.embla__viewport');
    var embla = EmblaCarousel(viewportNode, {
        loop: false,
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps'
    });

    // Arrow buttons
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');

    if (prevBtn) prevBtn.addEventListener('click', function() { embla.scrollPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { embla.scrollNext(); });

    // Dots
    var dotsContainer = document.getElementById('carouselDots');

    function setupDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        var scrollSnaps = embla.scrollSnapList();
        scrollSnaps.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', function() { embla.scrollTo(i); });
            dotsContainer.appendChild(dot);
        });
    }

    function updateState() {
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = !embla.canScrollPrev();
        nextBtn.disabled = !embla.canScrollNext();

        // Update dots
        if (!dotsContainer) return;
        var selected = embla.selectedScrollSnap();
        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === selected);
        });
    }

    setupDots();
    updateState();
    embla.on('select', updateState);
    embla.on('reInit', function() { setupDots(); updateState(); });

    // Keyboard navigation when carousel is focused
    emblaNode.setAttribute('tabindex', '0');
    emblaNode.setAttribute('role', 'region');
    emblaNode.setAttribute('aria-label', 'Featured products');
    emblaNode.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') { embla.scrollNext(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { embla.scrollPrev(); e.preventDefault(); }
    });
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
