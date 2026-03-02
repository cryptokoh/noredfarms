/* ============================================
   Ancient Ruins Garden Lab - JavaScript
   Zone navigation, modals, search, and ambient effects
   ============================================ */

// ============================================
// Data: Plant and Equipment Information
// ============================================

const plantData = {
    kratom: {
        name: 'Kratom',
        latin: 'Mitragyna speciosa',
        category: 'Adaptogen',
        description: 'Kratom is a tropical evergreen tree native to Southeast Asia, belonging to the coffee family (Rubiaceae). Its leaves have been used for centuries by indigenous peoples for their unique properties.',
        history: 'Traditional use dates back hundreds of years in Thailand, Malaysia, and Indonesia. Workers would chew the leaves to enhance endurance and alleviate fatigue during long work days.',
        alkaloids: ['Mitragynine', '7-Hydroxymitragynine', 'Speciogynine', 'Paynantheine', 'Speciociliatine'],
        compounds: 'Contains over 40 identified alkaloids, with mitragynine being the most abundant (approximately 66% of alkaloid content). The alkaloid profile varies significantly based on vein color, growing region, and processing method.',
        uses: [
            'Traditional energy support',
            'Natural mood enhancement',
            'Focus and concentration aid',
            'Relaxation at higher amounts'
        ],
        extraction: 'We use supercritical CO2 extraction to preserve the full alkaloid spectrum while removing plant waxes and chlorophyll. This produces a clean, potent extract with consistent alkaloid ratios.'
    },
    kava: {
        name: 'Kava',
        latin: 'Piper methysticum',
        category: 'Relaxant',
        description: 'Kava is a plant native to the western Pacific islands where it has been consumed for over 3,000 years. The root is used to produce a ceremonial drink known for its calming properties.',
        history: 'Central to Pacific Island cultures, kava ceremonies mark important social and religious occasions. It was traditionally prepared by chewing or grinding the root and mixing with water.',
        alkaloids: ['Kavain', 'Dihydrokavain', 'Methysticin', 'Dihydromethysticin', 'Yangonin', 'Desmethoxyyangonin'],
        compounds: 'Contains kavalactones - a family of lactone compounds responsible for its effects. Noble kava varieties contain higher ratios of desirable kavalactones and lower levels of potentially problematic compounds.',
        uses: [
            'Natural relaxation without sedation',
            'Social anxiety support',
            'Sleep quality improvement',
            'Muscle tension relief'
        ],
        extraction: 'Our extraction process uses food-grade ethanol to extract kavalactones while maintaining the traditional "chemotype" balance that Pacific islanders have selected for over generations.'
    },
    'blue-lotus': {
        name: 'Blue Lotus',
        latin: 'Nymphaea caerulea',
        category: 'Nootropic',
        description: 'Blue Lotus is an aquatic flower that was sacred to ancient Egyptians. Depicted extensively in their art and hieroglyphics, it was associated with the sun god Ra and spiritual enlightenment.',
        history: 'The ancient Egyptians consumed blue lotus in wine and used it in religious ceremonies. It appears in countless temple paintings and was found in Tutankhamun\'s tomb.',
        alkaloids: ['Aporphine', 'Nuciferine', 'Nornuciferine'],
        compounds: 'Contains apomorphine alkaloids that interact with dopamine receptors, as well as nuciferine which has been studied for its effects on serotonin receptors. The flower also contains antioxidant flavonoids.',
        uses: [
            'Lucid dream enhancement',
            'Meditative state support',
            'Mild euphoria and relaxation',
            'Creative visualization aid'
        ],
        extraction: 'We use a gentle water-based extraction followed by alcohol extraction to capture both water-soluble and fat-soluble compounds, preserving the flower\'s delicate aromatic compounds.'
    },
    ashwagandha: {
        name: 'Ashwagandha',
        latin: 'Withania somnifera',
        category: 'Adaptogen',
        description: 'Ashwagandha, also known as "Indian Ginseng" or "Winter Cherry," is one of the most important herbs in Ayurvedic medicine. Its name means "smell of the horse," referring to both its unique smell and its ability to impart vigor.',
        history: 'Used in Ayurvedic medicine for over 3,000 years, ashwagandha has been prescribed for numerous conditions. It\'s classified as a "Rasayana" - a rejuvenating tonic that promotes longevity.',
        alkaloids: ['Withanolide A', 'Withaferin A', 'Withanolide D', 'Withanone'],
        compounds: 'The root contains withanolides - steroidal lactones unique to this plant. Modern research has identified over 35 different withanolides, each with distinct properties.',
        uses: [
            'Stress adaptation support',
            'Cognitive function enhancement',
            'Physical endurance improvement',
            'Sleep quality optimization'
        ],
        extraction: 'Our full-spectrum extract is standardized to contain 5% withanolides while maintaining the plant\'s natural compound ratios. We use a dual extraction process combining water and ethanol.'
    },
    'lions-mane': {
        name: "Lion's Mane",
        latin: 'Hericium erinaceus',
        category: 'Nootropic Mushroom',
        description: 'Lion\'s Mane is a culinary and medicinal mushroom with a distinctive appearance resembling a lion\'s mane or a cascading waterfall. It grows on hardwood trees throughout North America, Europe, and Asia.',
        history: 'Used in Traditional Chinese Medicine for centuries to support digestive health and as a general tonic. Buddhist monks reportedly used it to enhance focus during meditation.',
        alkaloids: ['Hericenones', 'Erinacines', 'Beta-glucans', 'Polysaccharides'],
        compounds: 'Contains unique compounds called hericenones and erinacines that have been shown to stimulate Nerve Growth Factor (NGF) synthesis. Also rich in beta-glucans for immune support.',
        uses: [
            'Cognitive function and memory support',
            'Nerve health and regeneration',
            'Mood balance and mental clarity',
            'Immune system modulation'
        ],
        extraction: 'We use a dual-extraction method combining hot water extraction (for polysaccharides) and alcohol extraction (for hericenones and erinacines) to capture the full range of beneficial compounds.'
    },
    passionflower: {
        name: 'Passionflower',
        latin: 'Passiflora incarnata',
        category: 'Relaxant',
        description: 'Passionflower is a climbing vine native to the southeastern United States. Its intricate flower was named by Spanish missionaries who saw religious symbolism in its structure.',
        history: 'Native Americans used passionflower for wounds, earaches, and liver problems. European herbalists adopted it in the 1500s for anxiety and insomnia after learning of its use from indigenous peoples.',
        alkaloids: ['Harmine', 'Harmaline', 'Harmol', 'Chrysin', 'Vitexin'],
        compounds: 'Contains flavonoids (chrysin, vitexin) and harmala alkaloids that modulate GABA receptors. The synergy between these compounds is believed to be more effective than isolated constituents.',
        uses: [
            'Natural anxiety relief',
            'Sleep onset improvement',
            'Nervous system calming',
            'Muscle relaxation support'
        ],
        extraction: 'Our extraction preserves the delicate flavonoid compounds using a low-temperature ethanol process, yielding a clean extract with optimal levels of both flavonoids and alkaloids.'
    }
};

const equipmentData = {
    'co2-extractor': {
        name: 'CO2 Extraction System',
        category: 'Primary Extraction',
        description: 'Supercritical CO2 extraction uses carbon dioxide at high pressure and specific temperatures to act as a solvent, extracting valuable compounds from plant material without leaving chemical residues.',
        howItWorks: [
            'CO2 is compressed beyond its critical point (1071 psi, 31°C) where it becomes a "supercritical fluid"',
            'In this state, CO2 has properties of both a liquid and a gas, allowing it to penetrate plant material',
            'The supercritical CO2 dissolves target compounds (alkaloids, terpenes, etc.)',
            'Pressure is then reduced, causing CO2 to return to gas and evaporate, leaving pure extract',
            'The CO2 is recaptured and recycled for the next batch'
        ],
        advantages: [
            'No chemical solvent residues',
            'Selective extraction through pressure/temperature adjustment',
            'Preserves heat-sensitive compounds',
            'Produces clean, high-purity extracts',
            'Environmentally friendly and sustainable'
        ],
        applications: 'Ideal for extracting kratom alkaloids, preserving terpene profiles, and creating full-spectrum botanical extracts with precise compound ratios.'
    },
    distillation: {
        name: 'Distillation Apparatus',
        category: 'Purification',
        description: 'Distillation separates compounds based on their different boiling points. By carefully controlling temperature, we can isolate specific fractions of an extract or purify crude extractions.',
        howItWorks: [
            'Crude extract is heated in a boiling flask',
            'Compounds vaporize at their respective boiling points',
            'Vapor travels through a condenser where it cools and returns to liquid',
            'Different fractions are collected at different temperature ranges',
            'The result is purified extracts with targeted compound profiles'
        ],
        advantages: [
            'Separates compounds by volatility',
            'Can isolate specific alkaloids or terpenes',
            'Removes unwanted compounds like chlorophyll',
            'Produces highly concentrated extracts',
            'Scalable from laboratory to production'
        ],
        applications: 'Used to refine CO2 extracts, isolate essential oils, and create concentrated single-compound isolates for precise formulation.'
    },
    chromatography: {
        name: 'Chromatography Column',
        category: 'Separation',
        description: 'Chromatography separates compounds based on how they interact with a stationary phase (the column packing) versus a mobile phase (the solvent). Different compounds move through the column at different rates.',
        howItWorks: [
            'Extract is dissolved in a solvent and loaded onto the column',
            'The column contains a stationary phase (silica gel, alumina, etc.)',
            'Solvent is passed through, carrying compounds at different rates',
            'Compounds with more affinity for the stationary phase move slower',
            'Fractions are collected as they exit the column'
        ],
        advantages: [
            'High-resolution separation of similar compounds',
            'Can isolate individual alkaloids',
            'Scalable from analytical to preparative',
            'Reproducible results',
            'Essential for creating pure isolates'
        ],
        applications: 'Used to separate and purify individual alkaloids like mitragynine, or to create standardized extracts with specific compound ratios.'
    },
    testing: {
        name: 'HPLC Analysis System',
        category: 'Quality Control',
        description: 'High-Performance Liquid Chromatography (HPLC) is the gold standard for analyzing botanical extracts. It identifies and quantifies specific compounds with high precision and accuracy.',
        howItWorks: [
            'Sample is dissolved and injected into a flowing solvent stream',
            'The sample passes through a high-pressure column',
            'Compounds separate based on their chemical properties',
            'A detector measures compounds as they exit the column',
            'Software compares results to known standards for identification'
        ],
        advantages: [
            'Precise quantification (down to parts per million)',
            'Identifies specific alkaloids and compounds',
            'Detects contaminants and adulterants',
            'Creates a chemical fingerprint of each batch',
            'Ensures consistency across production runs'
        ],
        applications: 'Every batch of our extracts is tested for alkaloid content, purity, and absence of contaminants. HPLC results are included in our Certificates of Analysis.'
    }
};

// ============================================
// DOM Elements
// ============================================

const zoneNav = document.getElementById('zoneNav');
const zones = document.querySelectorAll('.zone');
const zoneBtns = document.querySelectorAll('.zone-btn');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalHeader = document.getElementById('modalHeader');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const librarySearch = document.getElementById('librarySearch');
const libraryGrid = document.getElementById('libraryGrid');
const libraryNoResults = document.getElementById('libraryNoResults');
const filterTabs = document.querySelectorAll('.filter-tab');

// ============================================
// Zone Navigation
// ============================================

function switchZone(targetZone) {
    // Update zone buttons
    zoneBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.zone === targetZone);
    });

    // Update zones
    zones.forEach(zone => {
        const isTarget = zone.id === `zone-${targetZone}`;
        zone.classList.toggle('active', isTarget);
    });

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Zone button clicks
zoneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchZone(btn.dataset.zone);
    });
});

// Continue buttons within zones
document.querySelectorAll('.zone-continue-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchZone(btn.dataset.target);
    });
});

// ============================================
// Modal System
// ============================================

function openModal(headerContent, bodyContent) {
    modalHeader.innerHTML = headerContent;
    modalBody.innerHTML = bodyContent;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Reset scroll position
    modalBody.scrollTop = 0;
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ============================================
// Plant Cards
// ============================================

document.querySelectorAll('.plant-card').forEach(card => {
    card.addEventListener('click', () => {
        const plantId = card.dataset.plant;
        const plant = plantData[plantId];

        if (plant) {
            const header = `
                <div class="modal-icon plants">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22V8"/>
                        <path d="M5 12H2a10 10 0 0020 0h-3"/>
                        <path d="M12 8a4.5 4.5 0 01-4.5 4.5 4.5 4.5 0 010-9 4.5 4.5 0 014.5 4.5z"/>
                        <path d="M12 8a4.5 4.5 0 004.5 4.5 4.5 4.5 0 000-9A4.5 4.5 0 0012 8z"/>
                    </svg>
                </div>
                <h2>${plant.name}</h2>
                <p class="modal-latin">${plant.latin}</p>
                <div class="modal-category-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22V8"/>
                        <path d="M5 12H2a10 10 0 0020 0h-3"/>
                    </svg>
                    Botanical Species
                </div>
            `;

            const body = `
                <div class="modal-section">
                    <h3>Overview</h3>
                    <p>${plant.description}</p>
                </div>

                <div class="modal-section">
                    <h3>Historical Use</h3>
                    <div class="modal-highlight">
                        <p>${plant.history}</p>
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Key Alkaloids & Compounds</h3>
                    <div class="alkaloid-list">
                        ${plant.alkaloids.map(a => `<span class="alkaloid-item">${a}</span>`).join('')}
                    </div>
                    <p>${plant.compounds}</p>
                </div>

                <div class="modal-section">
                    <h3>Traditional Uses</h3>
                    <ul>
                        ${plant.uses.map(use => `<li>${use}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-section">
                    <h3>Our Extraction Process</h3>
                    <p>${plant.extraction}</p>
                </div>
            `;
            openModal(header, body);
        }
    });
});

// ============================================
// Equipment Cards
// ============================================

document.querySelectorAll('.equipment-card').forEach(card => {
    card.addEventListener('click', () => {
        const equipmentId = card.dataset.equipment;
        const equipment = equipmentData[equipmentId];

        if (equipment) {
            const header = `
                <div class="modal-icon equipment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                </div>
                <h2>${equipment.name}</h2>
                <p class="modal-latin">${equipment.category}</p>
                <div class="modal-category-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Lab Equipment
                </div>
            `;

            const body = `
                <div class="modal-section">
                    <h3>Overview</h3>
                    <p>${equipment.description}</p>
                </div>

                <div class="modal-section">
                    <h3>How It Works</h3>
                    <ul>
                        ${equipment.howItWorks.map((step, i) => `<li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-section">
                    <h3>Key Advantages</h3>
                    <div class="modal-stats">
                        ${equipment.advantages.slice(0, 3).map(adv => `
                            <div class="modal-stat">
                                <div class="modal-stat-value">✓</div>
                                <div class="modal-stat-label">${adv.split(' ').slice(0, 3).join(' ')}</div>
                            </div>
                        `).join('')}
                    </div>
                    <ul>
                        ${equipment.advantages.map(adv => `<li>${adv}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-section">
                    <h3>Applications</h3>
                    <div class="modal-highlight">
                        <p>${equipment.applications}</p>
                    </div>
                </div>
            `;
            openModal(header, body);
        }
    });
});

// ============================================
// Library Search & Filter
// ============================================

let currentFilter = 'all';

function filterLibrary() {
    const searchTerm = librarySearch ? librarySearch.value.toLowerCase().trim() : '';
    const cards = libraryGrid.querySelectorAll('.library-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const category = card.dataset.category;
        const tags = card.dataset.tags || '';
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();

        const matchesFilter = currentFilter === 'all' || category === currentFilter;
        const matchesSearch = searchTerm === '' ||
            title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            tags.includes(searchTerm);

        if (matchesFilter && matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Show/hide no results message
    if (libraryNoResults) {
        libraryNoResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

if (librarySearch) {
    librarySearch.addEventListener('input', filterLibrary);
}

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        filterLibrary();
    });
});

// ============================================
// Ambient Effects: Pollen Particles
// ============================================

function createPollenParticles() {
    const container = document.getElementById('pollenParticles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'pollen';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        particle.style.opacity = `${0.2 + Math.random() * 0.3}`;
        container.appendChild(particle);
    }
}

// Initialize pollen particles
createPollenParticles();

// ============================================
// Library Card Click Handlers
// ============================================

// Helper to get icon class and svg for category
function getCategoryIcon(category) {
    const icons = {
        plants: {
            class: 'plants',
            svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22V8"/>
                <path d="M5 12H2a10 10 0 0020 0h-3"/>
                <path d="M12 8a4.5 4.5 0 01-4.5 4.5 4.5 4.5 0 010-9 4.5 4.5 0 014.5 4.5z"/>
                <path d="M12 8a4.5 4.5 0 004.5 4.5 4.5 4.5 0 000-9A4.5 4.5 0 0012 8z"/>
            </svg>`,
            label: 'Botanical Species'
        },
        equipment: {
            class: 'equipment',
            svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>`,
            label: 'Lab Equipment'
        },
        processes: {
            class: 'processes',
            svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4.5 12.75l6 6 9-13.5"/>
            </svg>`,
            label: 'Process'
        },
        research: {
            class: 'research',
            svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>`,
            label: 'Research'
        }
    };
    return icons[category] || icons.research;
}

document.querySelectorAll('.library-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        const title = card.querySelector('h3').textContent;
        const iconInfo = getCategoryIcon(category);

        // For plants, try to find matching plant data
        if (category === 'plants') {
            const plantKey = Object.keys(plantData).find(key => {
                const plant = plantData[key];
                return title.includes(plant.name);
            });

            if (plantKey) {
                const plant = plantData[plantKey];
                const header = `
                    <div class="modal-icon ${iconInfo.class}">${iconInfo.svg}</div>
                    <h2>${plant.name}</h2>
                    <p class="modal-latin">${plant.latin}</p>
                    <div class="modal-category-badge">${iconInfo.svg}${iconInfo.label}</div>
                `;
                const body = `
                    <div class="modal-section">
                        <h3>Overview</h3>
                        <p>${plant.description}</p>
                    </div>
                    <div class="modal-section">
                        <h3>Key Compounds</h3>
                        <div class="alkaloid-list">
                            ${plant.alkaloids.map(a => `<span class="alkaloid-item">${a}</span>`).join('')}
                        </div>
                    </div>
                    <div class="modal-section">
                        <h3>Traditional Uses</h3>
                        <ul>
                            ${plant.uses.map(use => `<li>${use}</li>`).join('')}
                        </ul>
                    </div>
                `;
                openModal(header, body);
                return;
            }
        }

        // For equipment/processes, try to find matching data
        if (category === 'equipment' || category === 'processes') {
            const equipKey = Object.keys(equipmentData).find(key => {
                const equip = equipmentData[key];
                return title.includes(equip.name) || equip.name.includes(title.split(' ')[0]);
            });

            if (equipKey) {
                const equipment = equipmentData[equipKey];
                const header = `
                    <div class="modal-icon ${iconInfo.class}">${iconInfo.svg}</div>
                    <h2>${equipment.name}</h2>
                    <p class="modal-latin">${equipment.category}</p>
                    <div class="modal-category-badge">${iconInfo.svg}${iconInfo.label}</div>
                `;
                const body = `
                    <div class="modal-section">
                        <h3>Overview</h3>
                        <p>${equipment.description}</p>
                    </div>
                    <div class="modal-section">
                        <h3>How It Works</h3>
                        <ul>
                            ${equipment.howItWorks.map((step, i) => `<li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="modal-section">
                        <h3>Key Advantages</h3>
                        <ul>
                            ${equipment.advantages.map(adv => `<li>${adv}</li>`).join('')}
                        </ul>
                    </div>
                `;
                openModal(header, body);
                return;
            }
        }

        // Default modal for items without detailed data
        const description = card.querySelector('p').textContent;
        const header = `
            <div class="modal-icon ${iconInfo.class}">${iconInfo.svg}</div>
            <h2>${title}</h2>
            <div class="modal-category-badge">${iconInfo.svg}${iconInfo.label}</div>
        `;
        const body = `
            <div class="modal-section">
                <h3>Overview</h3>
                <p>${description}</p>
            </div>
            <div class="modal-section">
                <div class="modal-highlight">
                    <p>Detailed content for this topic is coming soon. Check back for in-depth information about ${title.toLowerCase()}.</p>
                </div>
            </div>
        `;
        openModal(header, body);
    });
});

// ============================================
// Keyboard Navigation
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        const currentIndex = Array.from(zoneBtns).findIndex(btn => btn.classList.contains('active'));
        const nextIndex = (currentIndex + 1) % zoneBtns.length;
        switchZone(zoneBtns[nextIndex].dataset.zone);
    } else if (e.key === 'ArrowLeft') {
        const currentIndex = Array.from(zoneBtns).findIndex(btn => btn.classList.contains('active'));
        const prevIndex = (currentIndex - 1 + zoneBtns.length) % zoneBtns.length;
        switchZone(zoneBtns[prevIndex].dataset.zone);
    }
});

// ============================================
// URL Hash Navigation
// ============================================

function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && ['garden', 'ruins', 'lab', 'library'].includes(hash)) {
        switchZone(hash);
    }
}

window.addEventListener('hashchange', handleHashChange);

// Check hash on load
if (window.location.hash) {
    handleHashChange();
}

// ============================================
// Initialize
// ============================================

console.log('Ancient Ruins Garden Lab initialized');
