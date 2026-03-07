/* ============================================
   Nored Farms - Technical Lab UI
   Clean, Minimal Interactions + Theme Toggle
   ============================================ */

(function() {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // State
    let activeVial = null;
    let isTripping = false;
    let currentTheme = 'lab';
    let isTransitioning = false;

    // Smooth section transition helper
    function smoothTransition(callback, duration = 300) {
        if (isTransitioning) return;
        isTransitioning = true;

        const labContainer = $('.lab-container');
        if (labContainer) {
            labContainer.classList.add('transitioning');
        }

        setTimeout(() => {
            if (callback) callback();

            setTimeout(() => {
                if (labContainer) {
                    labContainer.classList.remove('transitioning');
                }
                isTransitioning = false;
            }, 50);
        }, duration);
    }

    // Font Size Manager
    const FontSizeManager = {
        SCALE_KEY: 'noredfarms-font-scale',
        SCALES: [1, 1.15, 1.30, 1.45, 1.60],
        DEFAULT_INDEX: 2, // 130% as default for better readability

        currentIndex: 2,

        init() {
            // Load saved preference
            const saved = localStorage.getItem(this.SCALE_KEY);
            if (saved !== null) {
                const index = parseInt(saved, 10);
                if (index >= 0 && index < this.SCALES.length) {
                    this.currentIndex = index;
                }
            }
            this.apply();
            this.bindEvents();
            this.updateButtons();
        },

        apply() {
            const scale = this.SCALES[this.currentIndex];
            document.documentElement.style.setProperty('--font-scale', scale);
        },

        increase() {
            if (this.currentIndex < this.SCALES.length - 1) {
                this.currentIndex++;
                this.save();
                this.apply();
                this.updateButtons();
            }
        },

        decrease() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.save();
                this.apply();
                this.updateButtons();
            }
        },

        reset() {
            this.currentIndex = this.DEFAULT_INDEX;
            this.save();
            this.apply();
            this.updateButtons();
        },

        save() {
            localStorage.setItem(this.SCALE_KEY, this.currentIndex.toString());
        },

        updateButtons() {
            const decreaseBtn = $('#fontDecrease');
            const increaseBtn = $('#fontIncrease');
            const resetBtn = $('#fontReset');

            if (decreaseBtn) {
                decreaseBtn.disabled = this.currentIndex === 0;
                decreaseBtn.classList.toggle('disabled', this.currentIndex === 0);
            }
            if (increaseBtn) {
                increaseBtn.disabled = this.currentIndex === this.SCALES.length - 1;
                increaseBtn.classList.toggle('disabled', this.currentIndex === this.SCALES.length - 1);
            }
            if (resetBtn) {
                resetBtn.classList.toggle('active', this.currentIndex === this.DEFAULT_INDEX);
            }
        },

        bindEvents() {
            const decreaseBtn = $('#fontDecrease');
            const increaseBtn = $('#fontIncrease');
            const resetBtn = $('#fontReset');

            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => this.decrease());
            }
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => this.increase());
            }
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.reset());
            }

            // Keyboard shortcuts (optional)
            document.addEventListener('keydown', (e) => {
                // Only trigger if not in an input field
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                if (e.ctrlKey || e.metaKey) {
                    if (e.key === '=' || e.key === '+') {
                        e.preventDefault();
                        this.increase();
                    } else if (e.key === '-') {
                        e.preventDefault();
                        this.decrease();
                    } else if (e.key === '0') {
                        e.preventDefault();
                        this.reset();
                    }
                }
            });
        }
    };

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        FontSizeManager.init();
        initVials();
        initPanel();
        initContact();
        initNav();
        initThemeToggle();
        initBeakerBubble();
        initPortals();
        initLibrary();
    });

    // Vial interactions
    let hoverTimeout = null;
    let isHovering = false;

    function initVials() {
        $$('.vial').forEach(vial => {
            // Hover to preview
            vial.addEventListener('mouseenter', () => {
                isHovering = true;
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    if (isHovering) {
                        selectVial(vial, true); // true = hover mode
                    }
                }, 150); // Small delay for intentional hover
            });

            vial.addEventListener('mouseleave', () => {
                isHovering = false;
                clearTimeout(hoverTimeout);
            });

            // Click to lock selection
            vial.addEventListener('click', () => {
                clearTimeout(hoverTimeout);
                selectVial(vial, false); // false = click mode (toggle)
            });

            vial.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectVial(vial, false);
                }
            });
        });
    }

    function selectVial(vial, isHover = false) {
        const product = vial.dataset.product;
        const panel = $('#infoPanel');
        const content = $('.panel-content', panel);
        const template = $(`#product-${product}`);

        // Click on active vial closes panel
        if (!isHover && activeVial === vial) {
            closePanel();
            return;
        }

        // If switching between vials, animate the transition
        if (activeVial && activeVial !== vial) {
            panel.classList.add('switching');

            setTimeout(() => {
                updatePanelContent(vial, product, template, panel, content);
                panel.classList.remove('switching');
            }, 200);
        } else {
            updatePanelContent(vial, product, template, panel, content);
        }
    }

    function updatePanelContent(vial, product, template, panel, content) {
        // Update active state
        $$('.vial').forEach(v => v.classList.remove('active'));
        vial.classList.add('active');
        activeVial = vial;

        // Update panel content
        if (template) {
            content.innerHTML = template.innerHTML;
            $('.panel-title', panel).textContent = product.toUpperCase();
        }

        panel.classList.add('active');
    }

    // Panel
    function initPanel() {
        const panel = $('#infoPanel');
        const close = $('.panel-close', panel);

        if (close) {
            close.addEventListener('click', closePanel);
        }

        // Close on escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closePanel();
        });
    }

    function closePanel() {
        const panel = $('#infoPanel');
        panel.classList.remove('active');

        $$('.vial').forEach(v => v.classList.remove('active'));
        activeVial = null;

        // Reset panel content
        setTimeout(() => {
            const content = $('.panel-content', panel);
            content.innerHTML = '<p class="panel-hint">Click a vial to view extract information</p>';
            $('.panel-title', panel).textContent = 'SELECT EXTRACT';
        }, 300);
    }

    // Contact
    function initContact() {
        const overlay = $('#contact');
        const form = $('#contactForm');

        // Nav link opens contact
        $$('a[href="#contact"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                openContact();
            });
        });

        // Close on backdrop click
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeContact();
        });

        // Escape closes
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeContact();
            }
        });

        // Form submit
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    }

    function openContact(product = null) {
        const overlay = $('#contact');

        // Use smooth transition
        smoothTransition(() => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (product) {
                const select = $('#interestSelect');
                if (select) select.value = product;
            }

            // Focus first input
            setTimeout(() => {
                const input = $('input', overlay);
                if (input) input.focus();
            }, 100);
        }, 200);
    }

    function closeContact() {
        const overlay = $('#contact');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Global function for template buttons
    window.scrollToContact = function(product) {
        closePanel();
        openContact(product);
    };

    window.closeContact = closeContact;

    async function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = $('.submit-btn', form);
        const original = btn.textContent;

        btn.textContent = 'SENDING...';
        btn.disabled = true;

        try {
            // Simulate API call
            await new Promise((res, rej) => {
                setTimeout(() => Math.random() > 0.1 ? res() : rej(), 1500);
            });

            btn.textContent = 'SENT';
            form.reset();

            setTimeout(() => {
                closeContact();
                btn.textContent = original;
                btn.disabled = false;
            }, 1500);

        } catch {
            btn.textContent = 'ERROR';
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
            }, 2000);
        }
    }

    // Nav
    function initNav() {
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                const section = this.dataset.section;

                // Handle different sections
                if (section === 'library') {
                    e.preventDefault();
                    openLibrary();
                } else if (section === 'extracts') {
                    e.preventDefault();
                    showExtractsPreview();
                } else if (section === 'contact') {
                    e.preventDefault();
                    openContact();
                } else if (section === 'lab') {
                    e.preventDefault();
                    closeLibrary();
                    closePanel();
                }

                // Update active states
                $$('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Theme Toggle with Hallucination Effect
    function initThemeToggle() {
        const toggle = $('#themeToggle');
        const hallucination = $('#hallucination');

        if (!toggle || !hallucination) return;

        toggle.addEventListener('click', () => {
            if (isTripping) return; // Prevent double-trigger
            triggerHallucination();
        });

        // Keyboard support
        toggle.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && !isTripping) {
                e.preventDefault();
                triggerHallucination();
            }
        });
    }

    function triggerHallucination() {
        const hallucination = $('#hallucination');
        const body = document.body;

        isTripping = true;

        // Activate hallucination overlay
        hallucination.classList.add('active');
        body.classList.add('tripping');

        // Create additional trip elements dynamically
        createTripEffects();

        // After hallucination peaks, switch theme
        setTimeout(() => {
            switchTheme();
        }, 1500);

        // End hallucination
        setTimeout(() => {
            hallucination.classList.remove('active');
            body.classList.remove('tripping');
            isTripping = false;
            clearTripEffects();
        }, 3000);
    }

    function switchTheme() {
        const toggle = $('#themeToggle');
        const labIcon = $('.theme-icon.lab', toggle);
        const shamanIcon = $('.theme-icon.shaman', toggle);

        if (currentTheme === 'lab') {
            document.documentElement.setAttribute('data-theme', 'shaman');
            currentTheme = 'shaman';
            if (labIcon) labIcon.style.display = 'none';
            if (shamanIcon) shamanIcon.style.display = 'block';
        } else {
            document.documentElement.setAttribute('data-theme', 'lab');
            currentTheme = 'lab';
            if (labIcon) labIcon.style.display = 'block';
            if (shamanIcon) shamanIcon.style.display = 'none';
        }
    }

    function createTripEffects() {
        const container = $('#hallucination');

        // Add extra pulsing circles
        for (let i = 0; i < 5; i++) {
            const circle = document.createElement('div');
            circle.className = 'trip-circle-extra';
            circle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${50 + Math.random() * 150}px;
                height: ${50 + Math.random() * 150}px;
                border: 2px solid currentColor;
                border-radius: 50%;
                animation: tripPulse ${1 + Math.random()}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(circle);
        }

        // Add sacred geometry shapes
        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            shape.className = 'trip-shape-extra';
            shape.innerHTML = `
                <svg viewBox="0 0 100 100" style="width: ${100 + Math.random() * 200}px; opacity: 0.5;">
                    <polygon points="50,5 95,97.5 5,97.5" fill="none" stroke="currentColor" stroke-width="1"/>
                    <polygon points="50,95 5,2.5 95,2.5" fill="none" stroke="currentColor" stroke-width="1"/>
                </svg>
            `;
            shape.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
                animation: tripPulse ${1.5 + Math.random()}s ease-out forwards;
                animation-delay: ${Math.random() * 0.3}s;
            `;
            container.appendChild(shape);
        }
    }

    function clearTripEffects() {
        const extras = $$('.trip-circle-extra, .trip-shape-extra');
        extras.forEach(el => el.remove());
    }

    // Global theme toggle function
    window.toggleTheme = function() {
        if (!isTripping) triggerHallucination();
    };

    // Lab Portals (Navigation shortcuts in the lab scene)
    function initPortals() {
        $$('.lab-portal').forEach(portal => {
            const target = portal.dataset.goto;

            portal.addEventListener('click', () => navigateToSection(target));
            portal.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateToSection(target);
                }
            });
        });
    }

    function navigateToSection(section) {
        // Update nav active state
        $$('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        // Handle different sections
        switch (section) {
            case 'library':
                showLibraryPreview();
                break;
            case 'extracts':
                showExtractsPreview();
                break;
            case 'contact':
                openContact();
                break;
            default:
                // Stay on lab
                break;
        }
    }

    function showLibraryPreview() {
        // Open the full library section
        openLibrary();
    }

    function showExtractsPreview() {
        const panel = $('#infoPanel');
        const content = $('.panel-content', panel);
        const title = $('.panel-title', panel);

        const isShaman = currentTheme === 'shaman';

        // Use smooth transition
        smoothTransition(() => {
            title.textContent = isShaman ? 'SACRED MEDICINES' : 'EXTRACT CATALOG';
            content.innerHTML = `
                <div class="extracts-preview">
                    <p class="preview-intro">${isShaman
                        ? 'Plant allies prepared with intention and reverence.'
                        : 'Premium botanical extracts, lab tested for purity.'
                    }</p>
                    <div class="preview-categories">
                        <div class="preview-item">
                            <span class="preview-icon">🍃</span>
                            <span>Kanna Varieties</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-icon">🥥</span>
                            <span>Kava Cultivars</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-icon">🪷</span>
                            <span>Blue Lotus</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-icon">🧠</span>
                            <span>Nootropic Blends</span>
                        </div>
                    </div>
                    <button class="inquire-btn" onclick="alert('Full catalog coming soon!')">
                        ${isShaman ? 'VIEW OFFERINGS' : 'VIEW CATALOG'}
                    </button>
                </div>
            `;

            panel.classList.add('active');
        }, 200);
    }

    // Library Section
    function initLibrary() {
        const library = $('#librarySection');
        if (!library) return;

        // Back button
        const backBtn = $('.back-to-lab', library);
        if (backBtn) {
            backBtn.addEventListener('click', closeLibrary);
        }

        // Category tabs
        $$('.tab-btn', library).forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                filterLibrary(category);

                // Update active tab
                $$('.tab-btn', library).forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Search functionality
        const searchInput = $('.search-input', library);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchLibrary(e.target.value);
            });
        }

        // Card click (placeholder for future article view)
        $$('.library-card', library).forEach(card => {
            card.addEventListener('click', () => {
                // Future: open article detail view
                const title = card.querySelector('.card-title');
                const displayTitle = currentTheme === 'shaman'
                    ? title.querySelector('.shaman-text')?.textContent
                    : title.querySelector('.lab-text')?.textContent;
            });
        });

        // Escape key closes library
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && library.classList.contains('active')) {
                closeLibrary();
            }
        });
    }

    function openLibrary() {
        const library = $('#librarySection');
        if (!library) return;

        closePanel(); // Close info panel

        // Use smooth transition
        smoothTransition(() => {
            library.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animate cards in
            $$('.library-card', library).forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (i * 50));
            });
        }, 250);
    }

    function closeLibrary() {
        const library = $('#librarySection');
        if (!library) return;

        // Fade out cards first
        $$('.library-card', library).forEach((card, i) => {
            card.style.transition = 'all 0.2s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
        });

        // Then close with smooth transition
        setTimeout(() => {
            smoothTransition(() => {
                library.classList.remove('active');
                document.body.style.overflow = '';

                // Reset card styles
                $$('.library-card', library).forEach(card => {
                    card.style.opacity = '';
                    card.style.transform = '';
                    card.style.transition = '';
                });
            }, 200);
        }, 150);

        // Reset nav
        $$('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === 'lab');
        });
    }

    function filterLibrary(category) {
        const cards = $$('.library-card');

        cards.forEach((card, i) => {
            const cardCategory = card.dataset.category;
            const show = category === 'all' || cardCategory === category;

            if (show) {
                card.classList.remove('hidden');
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 30);
            } else {
                card.classList.add('hidden');
            }
        });
    }

    function searchLibrary(query) {
        const cards = $$('.library-card');
        const searchTerm = query.toLowerCase().trim();

        cards.forEach(card => {
            if (!searchTerm) {
                card.classList.remove('hidden');
                return;
            }

            const labTitle = card.querySelector('.lab-text')?.textContent.toLowerCase() || '';
            const shamanTitle = card.querySelector('.shaman-text')?.textContent.toLowerCase() || '';
            const labDesc = card.querySelector('.card-desc .lab-text')?.textContent.toLowerCase() || '';
            const shamanDesc = card.querySelector('.card-desc .shaman-text')?.textContent.toLowerCase() || '';

            const matches = labTitle.includes(searchTerm) ||
                           shamanTitle.includes(searchTerm) ||
                           labDesc.includes(searchTerm) ||
                           shamanDesc.includes(searchTerm);

            card.classList.toggle('hidden', !matches);
        });

        // Reset active tab to "all" when searching
        if (searchTerm) {
            $$('.tab-btn').forEach(t => t.classList.remove('active'));
            $('.tab-btn[data-category="all"]')?.classList.add('active');
        }
    }

    // Global function
    window.openLibrary = openLibrary;
    window.closeLibrary = closeLibrary;

    // Beaker Bubble Animation
    function initBeakerBubble() {
        const bubble = $('#beakerBubble');
        const beaker = $('.beaker');

        if (!bubble || !beaker) return;

        // Messages that rotate based on theme
        const messages = {
            lab: [
                'Ancient Shamanic Lab',
                'Est. 5000 BCE',
                'Pure Extraction',
                'Lab Tested'
            ],
            shaman: [
                'Sacred Alchemy',
                'Ancient Wisdom',
                'Plant Medicine',
                'Traditional Methods'
            ]
        };

        let messageIndex = 0;

        function showBubble() {
            const themeMessages = messages[currentTheme] || messages.lab;
            const text = $('.bubble-text', bubble);

            // Update message
            text.textContent = themeMessages[messageIndex];
            messageIndex = (messageIndex + 1) % themeMessages.length;

            // Trigger small rising bubbles first
            beaker.classList.add('bubbling');

            // Show main bubble after small bubbles start
            setTimeout(() => {
                bubble.classList.remove('active');
                // Force reflow
                void bubble.offsetWidth;
                bubble.classList.add('active');
            }, 300);

            // Clean up bubbling class
            setTimeout(() => {
                beaker.classList.remove('bubbling');
            }, 1500);
        }

        // Initial bubble after 2 seconds
        setTimeout(showBubble, 2000);

        // Then every 6 seconds
        setInterval(showBubble, 6000);
    }

    // ==========================================
    // Library Article Modals
    // ==========================================
    const articleModalOverlay = document.getElementById('articleModalOverlay');
    const articleModal = document.getElementById('articleModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const libraryCards = document.querySelectorAll('.library-card[data-article]');

    if (articleModalOverlay && libraryCards.length > 0) {
        // Open modal when card is clicked
        libraryCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const articleId = card.dataset.article;
                const template = document.getElementById(`article-${articleId}`);

                if (template) {
                    // Clone template content
                    const content = template.content.cloneNode(true);
                    modalContent.innerHTML = '';
                    modalContent.appendChild(content);

                    // Animate modal in
                    articleModalOverlay.style.opacity = '0';
                    articleModalOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    // Trigger fade in
                    requestAnimationFrame(() => {
                        articleModalOverlay.style.transition = 'opacity 0.3s ease';
                        articleModalOverlay.style.opacity = '1';
                    });
                }
            });
        });

        // Close modal with smooth animation
        const closeModal = () => {
            articleModalOverlay.style.transition = 'opacity 0.25s ease';
            articleModalOverlay.style.opacity = '0';

            setTimeout(() => {
                articleModalOverlay.classList.remove('active');
                articleModalOverlay.style.opacity = '';
                articleModalOverlay.style.transition = '';
                document.body.style.overflow = '';
            }, 250);
        };

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        // Close on overlay click
        articleModalOverlay.addEventListener('click', (e) => {
            if (e.target === articleModalOverlay) {
                closeModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && articleModalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ==========================================
    // Back Navigation Drawer
    // ==========================================
    const backDrawer = document.getElementById('backDrawer');
    const backDrawerToggle = document.getElementById('backDrawerToggle');

    if (backDrawer && backDrawerToggle) {
        backDrawerToggle.addEventListener('click', () => {
            backDrawer.classList.toggle('open');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (!backDrawer.contains(e.target)) {
                backDrawer.classList.remove('open');
            }
        });

        // Close drawer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                backDrawer.classList.remove('open');
            }
        });
    }

})();
