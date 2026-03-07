/* ============================================
   Nored Farms - Laboratory Experience
   Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initLabItems();
    initModals();
    initRevealAnimations();
    initFloatingMolecules();
    initContactForm();
    initParticleEffects();
    initBackDrawer();
});

/* ============================================
   Back Navigation Drawer
   ============================================ */
function initBackDrawer() {
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
}

/* ============================================
   Onboarding System (Global Function)
   ============================================ */
function dismissOnboarding() {
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        // Store that user has seen onboarding
        localStorage.setItem('purextracts-onboarding-seen', 'true');
    }
}

function checkOnboarding() {
    const seen = localStorage.getItem('purextracts-onboarding-seen');
    const overlay = document.getElementById('onboardingOverlay');

    if (seen && overlay) {
        overlay.classList.add('hidden');
    } else if (overlay) {
        // Auto-dismiss after 8 seconds if user doesn't interact
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 8000);
    }
}

// Run onboarding check when DOM is ready
document.addEventListener('DOMContentLoaded', checkOnboarding);

/* ============================================
   Scroll to Contact (Global Function)
   ============================================ */
function scrollToContact(product) {
    // Close any open modals first
    closeAllModals();

    // Find the contact section
    const contactSection = document.getElementById('contact') || document.querySelector('.contact-section');

    if (contactSection) {
        // Smooth scroll to contact
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Pre-fill the message field if it exists
        setTimeout(() => {
            const messageField = document.querySelector('#message') || document.querySelector('textarea[name="message"]');
            if (messageField && product) {
                const productNames = {
                    'kanna': 'Kanna Extract',
                    'kava': 'Kava Extract',
                    'lotus': 'Blue Lotus Extract',
                    'nootropic': 'Nootropic Blend'
                };
                const productName = productNames[product] || product;
                messageField.value = `I'm interested in learning more about your ${productName}. Please send me pricing and availability information.`;
                messageField.focus();
            }
        }, 800);
    }
}

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
    const nav = document.querySelector('.nav') || document.querySelector('.lab-nav');
    const mobileToggle = document.querySelector('.nav-mobile-toggle') || document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links') || document.getElementById('navLinks');

    // Scroll effect
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hide/show nav on scroll
        if (currentScroll > lastScroll && currentScroll > 200) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');

            // Animate hamburger
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = nav.offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Lab Items - Interactive Elements
   ============================================ */
function initLabItems() {
    const labItems = document.querySelectorAll('.lab-item');

    labItems.forEach(item => {
        // Add hover sound effect (visual feedback instead)
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        // Click interaction
        item.addEventListener('click', () => {
            // Support both data-item and data-product/data-section attributes
            const itemType = item.dataset.item || item.dataset.product || item.dataset.section;

            // Add click animation
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);

            // Open corresponding modal or action
            if (itemType) {
                handleLabItemClick(itemType, item);
            }
        });

        // Keyboard accessibility
        if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
        }
        item.setAttribute('role', 'button');

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });

    // Initialize beaker bubbles animation
    animateBeakerBubbles();
}

function handleLabItemClick(itemType, element) {
    // Map lab items to modals - supports multiple naming conventions
    const modalMap = {
        // Original naming
        'kanna-plant': 'kanna-modal',
        'lotus-plant': 'lotus-modal',
        'kanna-beaker': 'kanna-modal',
        'kava-beaker': 'kava-modal',
        'lotus-beaker': 'lotus-modal',
        'nootropic-beaker': 'nootropic-modal',
        // HTML naming (data-product values)
        'kanna': 'kanna-modal',
        'kanna-extract': 'kanna-modal',
        'kava': 'kava-modal',
        'kava-extract': 'kava-modal',
        'lotus': 'lotus-modal',
        'lotus-extract': 'lotus-modal',
        'nootropic': 'nootropic-modal',
        'nootropic-extract': 'nootropic-modal',
        // Section links
        'microscope': null,
        'test-tubes': null,
        'research': null,
        'products': null
    };

    const modalId = modalMap[itemType];

    if (modalId) {
        openModal(modalId);
    } else if (itemType === 'microscope' || itemType === 'research') {
        // Scroll to research section
        const researchSection = document.getElementById('research');
        if (researchSection) {
            researchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else if (itemType === 'test-tubes' || itemType === 'products') {
        // Show compound analysis view / scroll to products
        showCompoundAnalysis();
    }
}

function animateBeakerBubbles() {
    const beakers = document.querySelectorAll('.beaker-svg');

    beakers.forEach(beaker => {
        // Add random bubble generation
        setInterval(() => {
            if (Math.random() > 0.7) {
                createBubble(beaker);
            }
        }, 1000);
    });
}

function createBubble(beaker) {
    const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const startX = 25 + Math.random() * 30;

    bubble.setAttribute('cx', startX);
    bubble.setAttribute('cy', '85');
    bubble.setAttribute('r', 2 + Math.random() * 3);
    bubble.setAttribute('class', 'dynamic-bubble');
    bubble.style.fill = 'rgba(255, 255, 255, 0.4)';
    bubble.style.animation = 'bubble-rise 2s ease-out forwards';

    beaker.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 2000);
}

function showCompoundAnalysis() {
    // Create a temporary overlay with compound information
    const compounds = [
        { name: 'Mesembrine', color: '#D4A574', percentage: '66%' },
        { name: 'Kavalactones', color: '#10B981', percentage: '82%' },
        { name: 'Aporphine', color: '#8B5CF6', percentage: '45%' },
        { name: 'Alpha-GPC', color: '#06B6D4', percentage: '95%' }
    ];

    // Animate to products section for now
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Highlight product cards sequentially
        const cards = productsSection.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4)';

                setTimeout(() => {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                }, 500);
            }, index * 200);
        });
    }
}

/* ============================================
   Modals
   ============================================ */
function initModals() {
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const productCards = document.querySelectorAll('.product-card');
    const closeButtons = document.querySelectorAll('.modal-close');
    const productButtons = document.querySelectorAll('[data-modal]');

    // Product card click opens modal
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if clicked on a button with its own modal trigger
            if (e.target.closest('[data-modal]')) return;

            const modalId = card.dataset.modal || card.dataset.product;
            if (modalId) {
                openModal(modalId + '-modal');
            }
        });
    });

    // Buttons with data-modal attribute
    productButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = btn.dataset.modal;
            if (modalId) {
                openModal(modalId + '-modal');
            }
        });
    });

    // Close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Click outside to close (modal overlay pattern)
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    // Click backdrop to close (HTML pattern)
    const backdrop = document.getElementById('modalBackdrop') || document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeAllModals();
        });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openModal(modalId) {
    // Support both overlay pattern and direct modal pattern
    let overlay = document.getElementById(modalId);
    let modal = overlay;
    const backdrop = document.getElementById('modalBackdrop') || document.querySelector('.modal-backdrop');

    // Check if this is an overlay (contains .modal child) or direct modal
    if (overlay && overlay.classList.contains('modal-overlay')) {
        modal = overlay.querySelector('.modal');
    } else if (overlay && overlay.classList.contains('modal')) {
        // Direct modal - show backdrop separately
        if (backdrop) {
            backdrop.classList.add('active');
        }
    }

    if (overlay || modal) {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Show modal with animation
        if (overlay) overlay.classList.add('active');
        if (modal && modal !== overlay) modal.classList.add('active');

        // Focus management
        const targetModal = modal || overlay;
        const focusableElements = targetModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 300);
        }

        // Track open state
        targetModal.setAttribute('aria-hidden', 'false');
    }
}

function closeAllModals() {
    // Close overlay-style modals
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    });

    // Close direct modals
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });

    // Hide backdrop
    const backdrop = document.getElementById('modalBackdrop') || document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
    }

    // Restore body scroll
    document.body.style.overflow = '';
}

/* ============================================
   Reveal Animations (Intersection Observer)
   ============================================ */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Optional: Stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        observer.observe(element);
    });

    // Also observe section headers
    document.querySelectorAll('.section-header, .product-card, .timeline-step, .microscope-card').forEach(el => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            observer.observe(el);
        }
    });
}

/* ============================================
   Floating Molecules Enhancement
   ============================================ */
function initFloatingMolecules() {
    const container = document.querySelector('.molecules-container') || document.querySelector('.floating-molecules');
    if (!container) return;

    // Add more dynamic molecules on scroll
    let moleculeCount = 8;
    const maxMolecules = 15;

    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);

        // Add molecules as user scrolls
        if (scrollPercent > 0.3 && moleculeCount < maxMolecules) {
            addDynamicMolecule(container);
            moleculeCount++;
        }
    }, 500));

    // Mouse interaction with molecules
    document.addEventListener('mousemove', throttle((e) => {
        const molecules = container.querySelectorAll('.molecule');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        molecules.forEach(molecule => {
            const rect = molecule.getBoundingClientRect();
            const molX = rect.left + rect.width / 2;
            const molY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(mouseX - molX, 2) + Math.pow(mouseY - molY, 2)
            );

            // Subtle push effect when mouse is near
            if (distance < 150) {
                const angle = Math.atan2(molY - mouseY, molX - mouseX);
                const push = (150 - distance) / 15;

                molecule.style.transform = `translate(${Math.cos(angle) * push}px, ${Math.sin(angle) * push}px)`;

                setTimeout(() => {
                    molecule.style.transform = '';
                }, 300);
            }
        });
    }, 50));
}

function addDynamicMolecule(container) {
    const colors = ['#D4A574', '#10B981', '#8B5CF6', '#06B6D4'];
    const molecule = document.createElement('div');

    molecule.className = 'molecule';
    molecule.style.cssText = `
        width: ${10 + Math.random() * 15}px;
        height: ${10 + Math.random() * 15}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-delay: ${-Math.random() * 20}s;
        animation-duration: ${20 + Math.random() * 10}s;
    `;

    container.appendChild(molecule);
}

/* ============================================
   Particle Effects
   ============================================ */
function initParticleEffects() {
    // Add particles on click for interactive elements
    document.querySelectorAll('.lab-item, .product-card, .btn-primary').forEach(element => {
        element.addEventListener('click', (e) => {
            createClickParticles(e.clientX, e.clientY, element);
        });
    });
}

function createClickParticles(x, y, element) {
    const colors = ['#D4A574', '#10B981', '#8B5CF6', '#06B6D4'];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;

        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
            opacity: 1;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        document.body.appendChild(particle);

        // Animate particle
        requestAnimationFrame(() => {
            particle.style.left = `${x + Math.cos(angle) * velocity}px`;
            particle.style.top = `${y + Math.sin(angle) * velocity}px`;
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0)';
        });

        // Remove particle
        setTimeout(() => {
            particle.remove();
        }, 600);
    }
}

/* ============================================
   Contact Form
   ============================================ */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Collect checkboxes
        const interests = [];
        form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            interests.push(cb.value);
        });
        data.interests = interests;

        // Simulate form submission (replace with actual API call)
        try {
            await simulateFormSubmission(data);

            // Success state
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';

            // Reset form
            form.reset();

            // Show success message
            showNotification('Thank you! We\'ll be in touch soon.', 'success');

        } catch (error) {
            submitBtn.textContent = 'Error - Try Again';
            submitBtn.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)';
            showNotification('Something went wrong. Please try again.', 'error');
        }

        // Reset button after delay
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
    });

    // Input validation visual feedback
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && input.checkValidity()) {
                input.style.borderColor = '#10B981';
            } else if (input.value) {
                input.style.borderColor = '#DC2626';
            }
        });

        input.addEventListener('focus', () => {
            input.style.borderColor = '';
        });
    });
}

function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve(data);
            } else {
                reject(new Error('Simulated error'));
            }
        }, 1500);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#DC2626' : '#3B82F6';

    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/* ============================================
   Utility Functions
   ============================================ */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ============================================
   Performance Optimizations
   ============================================ */
// Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-normal', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
}

/* ============================================
   Easter Eggs & Delight
   ============================================ */
// Konami code easter egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateLabMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateLabMode() {
    // Fun animation burst
    const colors = ['#D4A574', '#10B981', '#8B5CF6', '#06B6D4'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: ${5 + Math.random() * 15}px;
                height: ${5 + Math.random() * 15}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                left: ${Math.random() * window.innerWidth}px;
                top: ${window.innerHeight + 50}px;
                pointer-events: none;
                z-index: 9999;
                transition: all ${2 + Math.random()}s cubic-bezier(0.16, 1, 0.3, 1);
            `;

            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                particle.style.top = `${-100}px`;
                particle.style.opacity = '0';
            });

            setTimeout(() => particle.remove(), 3000);
        }, i * 30);
    }

    showNotification('Lab Mode Activated! 🧪', 'success');
}

/* ============================================
   Initialize on Load
   ============================================ */
window.addEventListener('load', () => {
    // Remove loading state if any
    document.body.classList.add('loaded');

    // Initialize lazy loading
    initLazyLoading();

    // Performance mark
    if (window.performance) {
        const loadTime = window.performance.now();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeAllModals,
        showNotification
    };
}
