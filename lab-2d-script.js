/* ============================================
   Nored Farms - Laboratory 2D
   Immersive Scrollable Lab | Deep Iron Theme
   Modules: Parallax, Scroll, Reveal, AncientLab
   ============================================ */

(function() {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // ==========================================
    // State
    // ==========================================
    let activeVial = null;
    let isTripping = false;
    let currentTheme = 'lab';
    let isTransitioning = false;

    // ==========================================
    // Font Size Manager
    // ==========================================
    const FontSizeManager = {
        SCALE_KEY: 'noredfarms-font-scale',
        SCALES: [1, 1.15, 1.30, 1.45, 1.60],
        DEFAULT_INDEX: 2,
        currentIndex: 2,

        init() {
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
            document.documentElement.style.setProperty('--font-scale', this.SCALES[this.currentIndex]);
        },

        increase() {
            if (this.currentIndex < this.SCALES.length - 1) {
                this.currentIndex++;
                this.save(); this.apply(); this.updateButtons();
            }
        },

        decrease() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.save(); this.apply(); this.updateButtons();
            }
        },

        reset() {
            this.currentIndex = this.DEFAULT_INDEX;
            this.save(); this.apply(); this.updateButtons();
        },

        save() { localStorage.setItem(this.SCALE_KEY, this.currentIndex.toString()); },

        updateButtons() {
            const dec = $('#fontDecrease'), inc = $('#fontIncrease'), rst = $('#fontReset');
            if (dec) { dec.disabled = this.currentIndex === 0; dec.classList.toggle('disabled', this.currentIndex === 0); }
            if (inc) { inc.disabled = this.currentIndex === this.SCALES.length - 1; inc.classList.toggle('disabled', this.currentIndex === this.SCALES.length - 1); }
            if (rst) { rst.classList.toggle('active', this.currentIndex === this.DEFAULT_INDEX); }
        },

        bindEvents() {
            const dec = $('#fontDecrease'), inc = $('#fontIncrease'), rst = $('#fontReset');
            if (dec) dec.addEventListener('click', () => this.decrease());
            if (inc) inc.addEventListener('click', () => this.increase());
            if (rst) rst.addEventListener('click', () => this.reset());

            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === '=' || e.key === '+') { e.preventDefault(); this.increase(); }
                    else if (e.key === '-') { e.preventDefault(); this.decrease(); }
                    else if (e.key === '0') { e.preventDefault(); this.reset(); }
                }
            });
        }
    };

    // ==========================================
    // ParallaxEngine - Mouse-tracking 3D depth
    // ==========================================
    const ParallaxEngine = {
        container: null,
        layers: [],
        isActive: false,
        rafId: null,
        mouseX: 0,
        mouseY: 0,
        currentX: 0,
        currentY: 0,

        init() {
            this.container = $('.perspective-container');
            if (!this.container) return;

            // Skip on touch devices
            if ('ontouchstart' in window) return;

            this.layers = $$('.depth-layer', this.container);
            if (this.layers.length === 0) return;

            // Observe hero visibility to pause/resume
            const hero = $('#hero-lab');
            if (hero) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.start();
                        } else {
                            this.stop();
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(hero);
            }

            // Track mouse
            document.addEventListener('mousemove', (e) => {
                this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            }, { passive: true });
        },

        start() {
            if (this.isActive) return;
            this.isActive = true;
            this.tick();
        },

        stop() {
            this.isActive = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        },

        tick() {
            if (!this.isActive) return;

            // Smooth interpolation
            this.currentX += (this.mouseX - this.currentX) * 0.08;
            this.currentY += (this.mouseY - this.currentY) * 0.08;

            this.layers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth) || 0;
                const moveX = this.currentX * depth * 100;
                const moveY = this.currentY * depth * 100;
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });

            this.rafId = requestAnimationFrame(() => this.tick());
        }
    };

    // ==========================================
    // ScrollSystem - Section tracking + sticky nav
    // ==========================================
    const ScrollSystem = {
        sections: [],
        dots: [],
        navLinks: [],
        topbar: null,
        scrollThreshold: 50,

        init() {
            this.topbar = $('#topbar');
            this.dots = $$('.section-dots .dot');
            this.navLinks = $$('.nav-link[data-section]');

            // Collect sections
            const sectionIds = ['hero-lab', 'compounds-section', 'extraction-section', 'library-section', 'labdata-section', 'contact-section'];
            this.sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

            if (this.sections.length === 0) return;

            // Observe sections for active tracking
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.setActive(entry.target.id);
                    }
                });
            }, { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' });

            this.sections.forEach(s => observer.observe(s));

            // Sticky nav scroll handler
            window.addEventListener('scroll', () => {
                if (this.topbar) {
                    this.topbar.classList.toggle('scrolled', window.scrollY > this.scrollThreshold);
                }
            }, { passive: true });

            // Dot clicks
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const target = document.getElementById(dot.dataset.target);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                });
            });

            // Nav link smooth scrolling
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.getElementById(href.slice(1));
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        },

        setActive(sectionId) {
            // Update dots
            this.dots.forEach(dot => {
                dot.classList.toggle('active', dot.dataset.target === sectionId);
            });

            // Update nav links
            const sectionMap = {
                'hero-lab': 'lab',
                'compounds-section': 'compounds',
                'library-section': 'library',
                'contact-section': 'contact'
            };
            const navSection = sectionMap[sectionId];
            if (navSection) {
                this.navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === navSection);
                });
            }
        }
    };

    // ==========================================
    // RevealAnimations - Scroll-triggered reveals
    // ==========================================
    const RevealAnimations = {
        init() {
            const elements = $$('.reveal');
            if (elements.length === 0) return;

            // Check for scroll-driven animation support
            const hasScrollDriven = CSS.supports && CSS.supports('animation-timeline', 'view()');

            if (hasScrollDriven) {
                // CSS handles it natively - just make sure elements start hidden
                return;
            }

            // Fallback: IntersectionObserver
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

            elements.forEach(el => observer.observe(el));
        }
    };

    // ==========================================
    // AncientLabModule - Embedded popup experience
    // ==========================================
    const AncientLabModule = {
        overlay: null,
        currentZone: 'garden',
        currentFilter: 'all',
        innerModal: null,

        // Plant data (ported from ancient-lab-script.js)
        plantData: {
            kanna: {
                name: 'Kanna', latin: 'Sceletium tortuosum', category: 'Adaptogen',
                description: 'Kanna is a tropical evergreen tree native to Southeast Asia, belonging to the coffee family (Rubiaceae). Its leaves have been used for centuries by indigenous peoples for their unique properties.',
                history: 'Traditional use dates back hundreds of years in Thailand, Malaysia, and Indonesia. Workers would chew the leaves to enhance endurance and alleviate fatigue during long work days.',
                alkaloids: ['Mesembrine', '7-Hydroxymesembrine', 'Speciogynine', 'Paynantheine', 'Speciociliatine'],
                compounds: 'Contains over 40 identified alkaloids, with mesembrine being the most abundant (approximately 66% of alkaloid content).',
                uses: ['Traditional energy support', 'Natural mood enhancement', 'Focus and concentration aid', 'Relaxation at higher amounts'],
                extraction: 'We use supercritical CO2 extraction to preserve the full alkaloid spectrum while removing plant waxes and chlorophyll.'
            },
            kava: {
                name: 'Kava', latin: 'Piper methysticum', category: 'Relaxant',
                description: 'Kava is a plant native to the western Pacific islands where it has been consumed for over 3,000 years. The root is used to produce a ceremonial drink known for its calming properties.',
                history: 'Central to Pacific Island cultures, kava ceremonies mark important social and religious occasions.',
                alkaloids: ['Kavain', 'Dihydrokavain', 'Methysticin', 'Dihydromethysticin', 'Yangonin', 'Desmethoxyyangonin'],
                compounds: 'Contains kavalactones - a family of lactone compounds responsible for its effects.',
                uses: ['Natural relaxation without sedation', 'Social anxiety support', 'Sleep quality improvement', 'Muscle tension relief'],
                extraction: 'Our extraction process uses food-grade ethanol to extract kavalactones while maintaining the traditional chemotype balance.'
            },
            'blue-lotus': {
                name: 'Blue Lotus', latin: 'Nymphaea caerulea', category: 'Nootropic',
                description: 'Blue Lotus is an aquatic flower that was sacred to ancient Egyptians. Depicted extensively in their art and hieroglyphics.',
                history: 'The ancient Egyptians consumed blue lotus in wine and used it in religious ceremonies. It was found in Tutankhamun\'s tomb.',
                alkaloids: ['Aporphine', 'Nuciferine', 'Nornuciferine'],
                compounds: 'Contains apomorphine alkaloids that interact with dopamine receptors, as well as nuciferine which affects serotonin receptors.',
                uses: ['Lucid dream enhancement', 'Meditative state support', 'Mild euphoria and relaxation', 'Creative visualization aid'],
                extraction: 'We use a gentle water-based extraction followed by alcohol extraction to capture both water-soluble and fat-soluble compounds.'
            },
            ashwagandha: {
                name: 'Ashwagandha', latin: 'Withania somnifera', category: 'Adaptogen',
                description: 'One of the most important herbs in Ayurvedic medicine. Its name means "smell of the horse," referring to both its unique smell and its ability to impart vigor.',
                history: 'Used in Ayurvedic medicine for over 3,000 years. Classified as a "Rasayana" - a rejuvenating tonic that promotes longevity.',
                alkaloids: ['Withanolide A', 'Withaferin A', 'Withanolide D', 'Withanone'],
                compounds: 'The root contains withanolides - steroidal lactones unique to this plant. Over 35 different withanolides have been identified.',
                uses: ['Stress adaptation support', 'Cognitive function enhancement', 'Physical endurance improvement', 'Sleep quality optimization'],
                extraction: 'Our full-spectrum extract is standardized to 5% withanolides using a dual extraction process combining water and ethanol.'
            },
            'lions-mane': {
                name: "Lion's Mane", latin: 'Hericium erinaceus', category: 'Nootropic Mushroom',
                description: 'A culinary and medicinal mushroom with a distinctive appearance resembling a cascading waterfall. Grows on hardwood trees throughout the Northern Hemisphere.',
                history: 'Used in Traditional Chinese Medicine for centuries. Buddhist monks reportedly used it to enhance focus during meditation.',
                alkaloids: ['Hericenones', 'Erinacines', 'Beta-glucans', 'Polysaccharides'],
                compounds: 'Contains unique compounds that stimulate Nerve Growth Factor (NGF) synthesis. Also rich in beta-glucans for immune support.',
                uses: ['Cognitive function and memory support', 'Nerve health and regeneration', 'Mood balance and mental clarity', 'Immune system modulation'],
                extraction: 'Dual-extraction: hot water (polysaccharides) and alcohol (hericenones and erinacines) to capture the full range of compounds.'
            },
            passionflower: {
                name: 'Passionflower', latin: 'Passiflora incarnata', category: 'Relaxant',
                description: 'A climbing vine native to the southeastern United States. Its intricate flower was named by Spanish missionaries who saw religious symbolism.',
                history: 'Native Americans used passionflower for wounds, earaches, and liver problems. European herbalists adopted it in the 1500s.',
                alkaloids: ['Harmine', 'Harmaline', 'Harmol', 'Chrysin', 'Vitexin'],
                compounds: 'Contains flavonoids (chrysin, vitexin) and harmala alkaloids that modulate GABA receptors.',
                uses: ['Natural anxiety relief', 'Sleep onset improvement', 'Nervous system calming', 'Muscle relaxation support'],
                extraction: 'Low-temperature ethanol process preserves delicate flavonoid compounds, yielding optimal levels of both flavonoids and alkaloids.'
            }
        },

        // Equipment data (ported from ancient-lab-script.js)
        equipmentData: {
            'co2-extractor': {
                name: 'CO2 Extraction System', category: 'Primary Extraction',
                description: 'Supercritical CO2 extraction uses carbon dioxide at high pressure and specific temperatures to act as a solvent.',
                howItWorks: [
                    'CO2 is compressed beyond its critical point (1071 psi, 31C)',
                    'In this state, CO2 penetrates plant material as both liquid and gas',
                    'The supercritical CO2 dissolves target compounds (alkaloids, terpenes)',
                    'Pressure is reduced, CO2 returns to gas and evaporates, leaving pure extract',
                    'The CO2 is recaptured and recycled for the next batch'
                ],
                advantages: ['No chemical solvent residues', 'Selective extraction through pressure/temperature', 'Preserves heat-sensitive compounds', 'Produces high-purity extracts', 'Environmentally friendly'],
                applications: 'Ideal for extracting kanna alkaloids, preserving terpene profiles, and creating full-spectrum botanical extracts.'
            },
            distillation: {
                name: 'Distillation Apparatus', category: 'Purification',
                description: 'Distillation separates compounds based on their different boiling points for targeted purification.',
                howItWorks: [
                    'Crude extract is heated in a boiling flask',
                    'Compounds vaporize at their respective boiling points',
                    'Vapor travels through a condenser where it cools and liquefies',
                    'Different fractions are collected at different temperature ranges',
                    'The result is purified extracts with targeted compound profiles'
                ],
                advantages: ['Separates compounds by volatility', 'Can isolate specific alkaloids or terpenes', 'Removes unwanted compounds', 'Highly concentrated extracts', 'Scalable from lab to production'],
                applications: 'Used to refine CO2 extracts, isolate essential oils, and create concentrated single-compound isolates.'
            },
            chromatography: {
                name: 'Chromatography Column', category: 'Separation',
                description: 'Separates compounds based on how they interact with a stationary phase versus a mobile phase.',
                howItWorks: [
                    'Extract is dissolved in solvent and loaded onto the column',
                    'Column contains a stationary phase (silica gel, alumina)',
                    'Solvent carries compounds at different rates',
                    'Compounds with more affinity for stationary phase move slower',
                    'Fractions are collected as they exit the column'
                ],
                advantages: ['High-resolution separation', 'Can isolate individual alkaloids', 'Scalable from analytical to preparative', 'Reproducible results', 'Essential for pure isolates'],
                applications: 'Used to separate and purify individual alkaloids like mesembrine, or to create standardized extracts.'
            },
            testing: {
                name: 'HPLC Analysis System', category: 'Quality Control',
                description: 'High-Performance Liquid Chromatography identifies and quantifies specific compounds with high precision.',
                howItWorks: [
                    'Sample is dissolved and injected into a flowing solvent stream',
                    'Sample passes through a high-pressure column',
                    'Compounds separate based on chemical properties',
                    'Detector measures compounds as they exit',
                    'Software compares results to known standards'
                ],
                advantages: ['Precise quantification (parts per million)', 'Identifies specific alkaloids', 'Detects contaminants and adulterants', 'Creates chemical fingerprint per batch', 'Ensures consistency across runs'],
                applications: 'Every batch is tested for alkaloid content, purity, and absence of contaminants. Results are included in COAs.'
            }
        },

        // Library entries for the ancient lab library zone
        libraryEntries: [
            { category: 'plants', tags: 'kanna adaptogen alkaloid', title: 'Kanna (Sceletium tortuosum)', desc: 'Over 40 alkaloids including mesembrine and 7-hydroxymesembrine.' },
            { category: 'plants', tags: 'kava relaxant kavalactone', title: 'Kava (Piper methysticum)', desc: 'Pacific Island root with kavalactones that promote relaxation.' },
            { category: 'plants', tags: 'blue lotus nootropic aporphine', title: 'Blue Lotus (Nymphaea caerulea)', desc: 'Ancient Egyptian sacred flower with aporphine and nuciferine.' },
            { category: 'plants', tags: 'ashwagandha adaptogen withanolide', title: 'Ashwagandha (Withania somnifera)', desc: 'Ayurvedic adaptogen with withanolides for stress adaptation.' },
            { category: 'processes', tags: 'co2 extraction supercritical', title: 'CO2 Extraction', desc: 'Supercritical CO2 extracts full-spectrum compounds without heat degradation.' },
            { category: 'processes', tags: 'distillation purification', title: 'Steam Distillation', desc: 'Separates volatile compounds using steam for essential oils.' },
            { category: 'equipment', tags: 'hplc testing analysis', title: 'HPLC Analysis', desc: 'High-Performance Liquid Chromatography for precise identification.' },
            { category: 'equipment', tags: 'chromatography separation', title: 'Column Chromatography', desc: 'Separates compounds based on polarity for isolating alkaloids.' },
            { category: 'research', tags: 'alkaloid chemistry pharmacology', title: 'Alkaloid Pharmacology', desc: 'How plant alkaloids interact with human receptor systems.' },
            { category: 'research', tags: 'entourage synergy compounds', title: 'The Entourage Effect', desc: 'How multiple plant compounds work synergistically.' }
        ],

        init() {
            this.overlay = $('#ancientLabModule');
            this.innerModal = $('#ancientInnerModal');
            if (!this.overlay) return;

            // Render zone content
            this.renderGardenCards();
            this.renderEquipmentCards();
            this.renderLibraryCards();

            // Bind triggers
            const beakerBtn = $('#beakerBubble');
            if (beakerBtn) beakerBtn.addEventListener('click', (e) => { e.preventDefault(); this.open(); });

            const ctaBtn = $('#ancientLabCta');
            if (ctaBtn) ctaBtn.addEventListener('click', () => this.open());

            // Close handlers
            const closeBtn = $('#ancientLabClose');
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());

            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });

            // Zone tabs
            $$('.zone-tab', this.overlay).forEach(tab => {
                tab.addEventListener('click', () => this.switchZone(tab.dataset.zone));
            });

            // Inner modal close
            const innerClose = $('#ancientInnerClose');
            if (innerClose) innerClose.addEventListener('click', () => this.closeInner());

            if (this.innerModal) {
                this.innerModal.addEventListener('click', (e) => {
                    if (e.target === this.innerModal) this.closeInner();
                });
            }

            // Library search + filter
            const searchInput = $('#ancientLibrarySearch');
            if (searchInput) searchInput.addEventListener('input', () => this.filterLibrary());

            $$('.ancient-filter', this.overlay).forEach(tab => {
                tab.addEventListener('click', () => {
                    $$('.ancient-filter', this.overlay).forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentFilter = tab.dataset.filter;
                    this.filterLibrary();
                });
            });

            // Keyboard
            document.addEventListener('keydown', (e) => {
                if (!this.overlay.classList.contains('active')) return;

                if (e.key === 'Escape') {
                    if (this.innerModal && this.innerModal.classList.contains('active')) {
                        this.closeInner();
                    } else {
                        this.close();
                    }
                }

                if (e.key === 'ArrowRight') {
                    const zones = ['garden', 'ruins', 'lab', 'library'];
                    const idx = zones.indexOf(this.currentZone);
                    if (idx < zones.length - 1) this.switchZone(zones[idx + 1]);
                }
                if (e.key === 'ArrowLeft') {
                    const zones = ['garden', 'ruins', 'lab', 'library'];
                    const idx = zones.indexOf(this.currentZone);
                    if (idx > 0) this.switchZone(zones[idx - 1]);
                }
            });
        },

        open() {
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.closeInner();
        },

        switchZone(zone) {
            this.currentZone = zone;
            $$('.zone-tab', this.overlay).forEach(t => t.classList.toggle('active', t.dataset.zone === zone));
            $$('.ancient-zone', this.overlay).forEach(z => z.classList.toggle('active', z.id === `ancient-${zone}`));
        },

        // Render Garden plant cards
        renderGardenCards() {
            const container = $('#ancientPlantScroll');
            if (!container) return;

            const plantSvgs = {
                kanna: '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><ellipse cx="30" cy="65" rx="18" ry="4" opacity="0.2"/><path d="M30 65V30" stroke-width="2"/><path d="M30 30Q18 22 15 32Q22 28 30 30" fill="currentColor" opacity="0.6"/><path d="M30 30Q42 22 45 32Q38 28 30 30" fill="currentColor" opacity="0.6"/><path d="M30 42Q20 35 18 45Q25 38 30 42" fill="currentColor" opacity="0.5"/><path d="M30 42Q40 35 42 45Q35 38 30 42" fill="currentColor" opacity="0.5"/></svg>',
                kava: '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><ellipse cx="30" cy="65" rx="18" ry="4" opacity="0.2"/><path d="M30 65V35" stroke-width="3"/><ellipse cx="30" cy="28" rx="15" ry="9" fill="currentColor" opacity="0.3"/><circle cx="30" cy="28" r="5" fill="currentColor" opacity="0.5"/></svg>',
                'blue-lotus': '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><ellipse cx="30" cy="62" rx="20" ry="6" fill="#5a8fa8" opacity="0.2"/><path d="M30 62V42" stroke-width="1.5"/><path d="M30 42Q33 28 30 18Q27 28 30 42" fill="#4a7fa8" opacity="0.7"/><path d="M30 35Q20 25 18 32Q24 28 30 35" fill="#5a8fb8" opacity="0.6"/><path d="M30 35Q40 25 42 32Q36 28 30 35" fill="#5a8fb8" opacity="0.6"/><circle cx="30" cy="22" r="3" fill="#d4a857" opacity="0.8"/></svg>',
                ashwagandha: '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><ellipse cx="30" cy="65" rx="18" ry="4" opacity="0.2"/><path d="M30 65V28" stroke-width="1.5"/><path d="M30 28Q22 20 20 28Q26 22 30 28" fill="currentColor" opacity="0.5"/><path d="M30 28Q38 20 40 28Q34 22 30 28" fill="currentColor" opacity="0.5"/><circle cx="22" cy="32" r="2.5" fill="#e6a847" opacity="0.7"/><circle cx="38" cy="32" r="2.5" fill="#e6a847" opacity="0.7"/></svg>',
                'lions-mane': '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><path d="M26 65Q23 52 26 42L34 42Q37 52 34 65Z" fill="currentColor" opacity="0.4"/><ellipse cx="30" cy="32" rx="18" ry="14" fill="currentColor" opacity="0.2"/><path d="M15 32Q18 22 21 32M21 28Q24 18 27 28M27 26Q30 16 33 26M33 28Q36 18 39 28M39 32Q42 22 45 32" stroke-width="1.5" opacity="0.5"/></svg>',
                passionflower: '<svg viewBox="0 0 60 70" fill="none" stroke="currentColor"><ellipse cx="30" cy="65" rx="18" ry="4" opacity="0.2"/><path d="M30 65V40Q20 32 30 25Q40 32 30 40" stroke-width="1.5"/><circle cx="30" cy="25" r="12" fill="none" stroke="#8b5cf6" opacity="0.5"/><path d="M30 13L30 19M30 31L30 37M18 25L24 25M36 25L42 25" stroke="#8b5cf6" stroke-width="1.2" opacity="0.6"/><circle cx="30" cy="25" r="5" fill="#8b5cf6" opacity="0.4"/><circle cx="30" cy="25" r="2" fill="#d4a857" opacity="0.8"/></svg>'
            };

            let html = '';
            Object.entries(this.plantData).forEach(([key, plant]) => {
                html += `
                    <div class="ancient-plant-card" data-plant="${key}">
                        <div class="ancient-plant-svg">${plantSvgs[key] || ''}</div>
                        <span class="ancient-plant-category">${plant.category}</span>
                        <h4>${plant.name}</h4>
                        <p class="ancient-plant-latin">${plant.latin}</p>
                    </div>`;
            });
            container.innerHTML = html;

            // Click handlers
            $$('.ancient-plant-card', container).forEach(card => {
                card.addEventListener('click', () => {
                    const plant = this.plantData[card.dataset.plant];
                    if (plant) this.openPlantModal(plant);
                });
            });
        },

        // Render Equipment cards
        renderEquipmentCards() {
            const container = $('#ancientEquipmentGrid');
            if (!container) return;

            const equipIcons = {
                'co2-extractor': '<svg viewBox="0 0 50 60" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="12" width="26" height="36" rx="3"/><circle cx="25" cy="8" r="5"/><path d="M18 8L25 8L28 10" stroke-width="1"/><rect x="17" y="18" width="16" height="20" rx="2" fill="currentColor" opacity="0.15"/><path d="M12 30L6 30L6 52L20 52" stroke-width="1.5"/><path d="M38 30L44 30L44 52L30 52" stroke-width="1.5"/><rect x="18" y="48" width="14" height="8" rx="2"/></svg>',
                distillation: '<svg viewBox="0 0 50 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 38Q15 55 25 55Q35 55 35 38L35 28L28 28L28 12L22 12L22 28L15 28Z"/><path d="M35 22L45 15"/><rect x="38" y="12" width="8" height="16" rx="2" transform="rotate(-30 42 20)"/><path d="M16 42Q25 40 34 42" fill="#d4a857" opacity="0.3"/></svg>',
                chromatography: '<svg viewBox="0 0 50 60" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="15" y="8" width="20" height="40" rx="2"/><rect x="17" y="14" width="16" height="4" fill="#5c8a7a" opacity="0.5"/><rect x="17" y="22" width="16" height="3" fill="#d4a857" opacity="0.6"/><rect x="17" y="30" width="16" height="5" fill="#8b5cf6" opacity="0.4"/><rect x="17" y="40" width="16" height="2" fill="#22c55e" opacity="0.5"/><path d="M25 48L25 55M22 55L28 55" stroke-width="1.5"/></svg>',
                testing: '<svg viewBox="0 0 50 60" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="34" height="22" rx="2"/><rect x="10" y="10" width="30" height="18" rx="1" fill="currentColor" opacity="0.08"/><path d="M14 22L20 18L26 20L32 12L38 14" stroke="#22c55e" stroke-width="1.5"/><path d="M22 30L22 35M18 35L26 35"/><rect x="12" y="38" width="26" height="6" rx="1"/><rect x="14" y="39" width="5" height="4" rx="0.5" fill="#d4a857" opacity="0.5"/><rect x="21" y="39" width="5" height="4" rx="0.5" fill="#5c8a7a" opacity="0.5"/><rect x="28" y="39" width="5" height="4" rx="0.5" fill="#8b5cf6" opacity="0.5"/></svg>'
            };

            let html = '';
            Object.entries(this.equipmentData).forEach(([key, equip]) => {
                html += `
                    <div class="ancient-equipment-card" data-equipment="${key}">
                        <div class="ancient-equip-svg">${equipIcons[key] || ''}</div>
                        <span class="ancient-equip-tag">${equip.category}</span>
                        <h4>${equip.name}</h4>
                    </div>`;
            });
            container.innerHTML = html;

            // Click handlers
            $$('.ancient-equipment-card', container).forEach(card => {
                card.addEventListener('click', () => {
                    const equip = this.equipmentData[card.dataset.equipment];
                    if (equip) this.openEquipmentModal(equip);
                });
            });
        },

        // Render Library cards
        renderLibraryCards() {
            const container = $('#ancientLibraryGrid');
            if (!container) return;

            const categoryIcons = {
                plants: '<svg viewBox="0 0 20 20" fill="currentColor" opacity="0.6"><circle cx="10" cy="10" r="8"/></svg>',
                processes: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h8l-1 1v4a1.5 1.5 0 00.4 1l3.8 3.8c.8.8.2 2.2-1 2.2H3.8c-1.2 0-1.8-1.4-1-2.2L6.6 9A1.5 1.5 0 007 8V4L6 3z"/></svg>',
                equipment: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="16" height="12" rx="1.5"/><path d="M2 7h16"/><path d="M8 17H6M14 17h-2M10 14v3"/></svg>',
                research: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 5v10m0-10C9 4.5 8 4 6.5 4S4 4.5 3 5v10c1-.5 2-1 3.5-1s2.5.5 3.5 1m0-10c1-.5 2-1 3.5-1s2.5.5 3.5 1v10c-1-.5-2-1-3.5-1s-2.5.5-3.5 1"/></svg>'
            };

            let html = '';
            this.libraryEntries.forEach((entry, i) => {
                html += `
                    <article class="ancient-lib-card" data-category="${entry.category}" data-tags="${entry.tags}" data-index="${i}">
                        <div class="ancient-lib-icon ${entry.category}">${categoryIcons[entry.category] || ''}</div>
                        <h4>${entry.title}</h4>
                        <p>${entry.desc}</p>
                    </article>`;
            });
            container.innerHTML = html;

            // Click handlers for library cards
            $$('.ancient-lib-card', container).forEach(card => {
                card.addEventListener('click', () => {
                    const cat = card.dataset.category;
                    const title = card.querySelector('h4').textContent;

                    // Try to match to plant or equipment data
                    if (cat === 'plants') {
                        const plantKey = Object.keys(this.plantData).find(k => title.includes(this.plantData[k].name));
                        if (plantKey) { this.openPlantModal(this.plantData[plantKey]); return; }
                    }
                    if (cat === 'equipment' || cat === 'processes') {
                        const equipKey = Object.keys(this.equipmentData).find(k => {
                            const eq = this.equipmentData[k];
                            return title.includes(eq.name) || eq.name.includes(title.split(' ')[0]);
                        });
                        if (equipKey) { this.openEquipmentModal(this.equipmentData[equipKey]); return; }
                    }

                    // Default modal
                    const desc = card.querySelector('p').textContent;
                    this.openInner(
                        `<h2>${title}</h2>`,
                        `<div class="modal-section"><h3>Overview</h3><p>${desc}</p></div><div class="modal-section"><p>Detailed content coming soon.</p></div>`
                    );
                });
            });
        },

        // Filter library
        filterLibrary() {
            const searchInput = $('#ancientLibrarySearch');
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const cards = $$('.ancient-lib-card', this.overlay);
            let visible = 0;

            cards.forEach(card => {
                const cat = card.dataset.category;
                const tags = card.dataset.tags || '';
                const title = card.querySelector('h4').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();

                const matchFilter = this.currentFilter === 'all' || cat === this.currentFilter;
                const matchSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm) || tags.includes(searchTerm);

                if (matchFilter && matchSearch) {
                    card.classList.remove('hidden');
                    visible++;
                } else {
                    card.classList.add('hidden');
                }
            });

            const noResults = $('#ancientNoResults');
            if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
        },

        // Open plant detail modal
        openPlantModal(plant) {
            const header = `<h2>${plant.name}</h2><p class="modal-latin">${plant.latin}</p><span class="modal-badge">${plant.category}</span>`;
            const body = `
                <div class="modal-section"><h3>Overview</h3><p>${plant.description}</p></div>
                <div class="modal-section"><h3>Historical Use</h3><p>${plant.history}</p></div>
                <div class="modal-section"><h3>Key Compounds</h3><div class="alkaloid-list">${plant.alkaloids.map(a => `<span class="alkaloid-tag">${a}</span>`).join('')}</div><p>${plant.compounds}</p></div>
                <div class="modal-section"><h3>Traditional Uses</h3><ul>${plant.uses.map(u => `<li>${u}</li>`).join('')}</ul></div>
                <div class="modal-section"><h3>Extraction Process</h3><p>${plant.extraction}</p></div>`;
            this.openInner(header, body);
        },

        // Open equipment detail modal
        openEquipmentModal(equip) {
            const header = `<h2>${equip.name}</h2><span class="modal-badge">${equip.category}</span>`;
            const body = `
                <div class="modal-section"><h3>Overview</h3><p>${equip.description}</p></div>
                <div class="modal-section"><h3>How It Works</h3><ul>${equip.howItWorks.map((s, i) => `<li><strong>Step ${i + 1}:</strong> ${s}</li>`).join('')}</ul></div>
                <div class="modal-section"><h3>Key Advantages</h3><ul>${equip.advantages.map(a => `<li>${a}</li>`).join('')}</ul></div>
                <div class="modal-section"><h3>Applications</h3><p>${equip.applications}</p></div>`;
            this.openInner(header, body);
        },

        openInner(headerHtml, bodyHtml) {
            const header = $('#ancientInnerHeader');
            const body = $('#ancientInnerBody');
            if (header) header.innerHTML = headerHtml;
            if (body) body.innerHTML = bodyHtml;
            if (this.innerModal) {
                this.innerModal.classList.add('active');
                if (body) body.scrollTop = 0;
            }
        },

        closeInner() {
            if (this.innerModal) this.innerModal.classList.remove('active');
        }
    };

    // ==========================================
    // Vial Interactions
    // ==========================================
    let hoverTimeout = null;
    let isHovering = false;

    function initVials() {
        $$('.vial').forEach(vial => {
            vial.addEventListener('mouseenter', () => {
                isHovering = true;
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    if (isHovering) selectVial(vial, true);
                }, 150);
            });
            vial.addEventListener('mouseleave', () => {
                isHovering = false;
                clearTimeout(hoverTimeout);
            });
            vial.addEventListener('click', () => {
                clearTimeout(hoverTimeout);
                selectVial(vial, false);
            });
            vial.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectVial(vial, false); }
            });
        });
    }

    function selectVial(vial, isHover) {
        const product = vial.dataset.product;
        const panel = $('#infoPanel');
        const content = $('.panel-content', panel);
        const template = $(`#product-${product}`);

        if (!isHover && activeVial === vial) { closePanel(); return; }

        if (activeVial && activeVial !== vial) {
            panel.classList.add('switching');
            setTimeout(() => { updatePanelContent(vial, product, template, panel, content); panel.classList.remove('switching'); }, 200);
        } else {
            updatePanelContent(vial, product, template, panel, content);
        }
    }

    function updatePanelContent(vial, product, template, panel, content) {
        $$('.vial').forEach(v => v.classList.remove('active'));
        vial.classList.add('active');
        activeVial = vial;
        if (template) {
            content.innerHTML = template.innerHTML;
            $('.panel-title', panel).textContent = product.toUpperCase();
        }
        panel.classList.add('active');
    }

    function initPanel() {
        const panel = $('#infoPanel');
        const close = $('.panel-close', panel);
        if (close) close.addEventListener('click', closePanel);
    }

    function closePanel() {
        const panel = $('#infoPanel');
        if (!panel) return;
        panel.classList.remove('active');
        $$('.vial').forEach(v => v.classList.remove('active'));
        activeVial = null;
        setTimeout(() => {
            const content = $('.panel-content', panel);
            if (content) content.innerHTML = '<p class="panel-hint">Click a vial to view extract information</p>';
            const title = $('.panel-title', panel);
            if (title) title.textContent = 'SELECT EXTRACT';
        }, 300);
    }

    // ==========================================
    // Contact (overlay for INQUIRE buttons + inline form)
    // ==========================================
    function initContact() {
        const overlay = $('#contactOverlay');
        if (!overlay) return;

        // Close on backdrop click
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeContactOverlay();
        });

        // Form submit for both inline and overlay forms
        const inlineForm = $('#contactForm');
        const overlayForm = $('#contactOverlayForm');
        if (inlineForm) inlineForm.addEventListener('submit', handleSubmit);
        if (overlayForm) overlayForm.addEventListener('submit', handleSubmit);
    }

    function openContactOverlay(product) {
        const overlay = $('#contactOverlay');
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (product) {
            const select = $('#overlayInterestSelect');
            if (select) select.value = product;
        }
        setTimeout(() => {
            const input = $('input', overlay);
            if (input) input.focus();
        }, 100);
    }

    function closeContactOverlay() {
        const overlay = $('#contactOverlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Global functions for template onclick handlers
    window.scrollToContact = function(product) {
        closePanel();
        // Scroll to inline contact section, or open overlay
        const contactSection = $('#contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            // Pre-select interest
            setTimeout(() => {
                const select = $('#interestSelect');
                if (select && product) select.value = product;
            }, 500);
        } else {
            openContactOverlay(product);
        }
    };

    window.closeContactOverlay = closeContactOverlay;

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = $('.submit-btn', form);
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = 'SENDING...';
        btn.disabled = true;

        try {
            await new Promise((res, rej) => { setTimeout(() => Math.random() > 0.1 ? res() : rej(), 1500); });
            btn.textContent = 'SENT';
            form.reset();
            setTimeout(() => {
                closeContactOverlay();
                btn.textContent = original;
                btn.disabled = false;
            }, 1500);
        } catch {
            btn.textContent = 'ERROR';
            setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2000);
        }
    }

    // ==========================================
    // Theme Toggle with Hallucination Effect
    // ==========================================
    function initThemeToggle() {
        const toggle = $('#themeToggle');
        const hallucination = $('#hallucination');
        if (!toggle || !hallucination) return;

        toggle.addEventListener('click', () => { if (!isTripping) triggerHallucination(); });
        toggle.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && !isTripping) { e.preventDefault(); triggerHallucination(); }
        });
    }

    function triggerHallucination() {
        const hallucination = $('#hallucination');
        isTripping = true;
        hallucination.classList.add('active');
        document.body.classList.add('tripping');
        createTripEffects();
        setTimeout(() => switchTheme(), 1500);
        setTimeout(() => {
            hallucination.classList.remove('active');
            document.body.classList.remove('tripping');
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
        for (let i = 0; i < 5; i++) {
            const circle = document.createElement('div');
            circle.className = 'trip-circle-extra';
            circle.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${50+Math.random()*150}px;height:${50+Math.random()*150}px;border:2px solid currentColor;border-radius:50%;animation:tripPulse ${1+Math.random()}s ease-out forwards;animation-delay:${Math.random()*0.5}s;`;
            container.appendChild(circle);
        }
        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            shape.className = 'trip-shape-extra';
            shape.innerHTML = `<svg viewBox="0 0 100 100" style="width:${100+Math.random()*200}px;opacity:0.5;"><polygon points="50,5 95,97.5 5,97.5" fill="none" stroke="currentColor" stroke-width="1"/><polygon points="50,95 5,2.5 95,2.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
            shape.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;transform:translate(-50%,-50%) rotate(${Math.random()*360}deg);animation:tripPulse ${1.5+Math.random()}s ease-out forwards;animation-delay:${Math.random()*0.3}s;`;
            container.appendChild(shape);
        }
    }

    function clearTripEffects() {
        $$('.trip-circle-extra, .trip-shape-extra').forEach(el => el.remove());
    }

    window.toggleTheme = function() { if (!isTripping) triggerHallucination(); };

    // ==========================================
    // Beaker Bubble Animation
    // ==========================================
    function initBeakerBubble() {
        const bubble = $('#beakerBubble');
        const beaker = $('.beaker');
        if (!bubble || !beaker) return;

        const messages = {
            lab: ['Ancient Shamanic Lab', 'Est. 5000 BCE', 'Pure Extraction', 'Lab Tested'],
            shaman: ['Sacred Alchemy', 'Ancient Wisdom', 'Plant Medicine', 'Traditional Methods']
        };
        let messageIndex = 0;

        function showBubble() {
            const themeMessages = messages[currentTheme] || messages.lab;
            const text = $('.bubble-text', bubble);
            if (text) text.textContent = themeMessages[messageIndex];
            messageIndex = (messageIndex + 1) % themeMessages.length;

            beaker.classList.add('bubbling');
            setTimeout(() => {
                bubble.classList.remove('active');
                void bubble.offsetWidth;
                bubble.classList.add('active');
            }, 300);
            setTimeout(() => beaker.classList.remove('bubbling'), 1500);
        }

        setTimeout(showBubble, 2000);
        setInterval(showBubble, 6000);
    }

    // ==========================================
    // Library (inline section)
    // ==========================================
    function initLibrary() {
        const section = $('#library-section');
        if (!section) return;

        // Category tabs
        $$('.tab-btn', section).forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                filterLibraryCards(category);
                $$('.tab-btn', section).forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Search
        const searchInput = $('#librarySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => searchLibrary(e.target.value));
        }
    }

    function filterLibraryCards(category) {
        $$('#libraryGrid .library-card').forEach(card => {
            const cardCat = card.dataset.category;
            const show = category === 'all' || cardCat === category;
            card.classList.toggle('hidden', !show);
        });
    }

    function searchLibrary(query) {
        const searchTerm = query.toLowerCase().trim();
        $$('#libraryGrid .library-card').forEach(card => {
            if (!searchTerm) { card.classList.remove('hidden'); return; }
            const labTitle = card.querySelector('.lab-text')?.textContent.toLowerCase() || '';
            const shamanTitle = card.querySelector('.shaman-text')?.textContent.toLowerCase() || '';
            const labDesc = card.querySelector('.card-desc .lab-text')?.textContent.toLowerCase() || '';
            const shamanDesc = card.querySelector('.card-desc .shaman-text')?.textContent.toLowerCase() || '';
            const matches = labTitle.includes(searchTerm) || shamanTitle.includes(searchTerm) || labDesc.includes(searchTerm) || shamanDesc.includes(searchTerm);
            card.classList.toggle('hidden', !matches);
        });

        if (searchTerm) {
            $$('.tab-btn').forEach(t => t.classList.remove('active'));
            $('.tab-btn[data-category="all"]')?.classList.add('active');
        }
    }

    // ==========================================
    // Library Article Modals
    // ==========================================
    function initArticleModals() {
        const overlay = $('#articleModalOverlay');
        const modalContent = $('#modalContent');
        const modalClose = $('#modalClose');
        const cards = $$('.library-card[data-article]');

        if (!overlay || cards.length === 0) return;

        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const articleId = card.dataset.article;
                const template = document.getElementById(`article-${articleId}`);
                if (template) {
                    const content = template.content.cloneNode(true);
                    modalContent.innerHTML = '';
                    modalContent.appendChild(content);
                    overlay.style.opacity = '0';
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                        overlay.style.transition = 'opacity 0.3s ease';
                        overlay.style.opacity = '1';
                    });
                }
            });
        });

        const closeModal = () => {
            overlay.style.transition = 'opacity 0.25s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.style.opacity = '';
                overlay.style.transition = '';
                document.body.style.overflow = '';
            }, 250);
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
        });
    }

    // ==========================================
    // Back Navigation Drawer
    // ==========================================
    function initBackDrawer() {
        const drawer = $('#backDrawer');
        const toggle = $('#backDrawerToggle');
        if (!drawer || !toggle) return;

        toggle.addEventListener('click', () => drawer.classList.toggle('open'));
        document.addEventListener('click', (e) => {
            if (!drawer.contains(e.target)) drawer.classList.remove('open');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') drawer.classList.remove('open');
        });
    }

    // ==========================================
    // Initialize
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        FontSizeManager.init();
        ParallaxEngine.init();
        ScrollSystem.init();
        RevealAnimations.init();
        AncientLabModule.init();
        initVials();
        initPanel();
        initContact();
        initThemeToggle();
        initBeakerBubble();
        initLibrary();
        initArticleModals();
        initBackDrawer();
    });

})();
