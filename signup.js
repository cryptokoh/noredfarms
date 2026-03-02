/**
 * Nored Farms - Email Signup Modal System
 * Handles email collection, localStorage tracking, and timed popup display
 */

// Signup Tracker - Manages subscription state
const SignupTracker = {
    isSubscribed: () => localStorage.getItem('noredfarms-subscribed') === 'true',

    isDismissed: () => {
        const dismissed = localStorage.getItem('noredfarms-dismissed');
        if (!dismissed) return false;
        // Don't show again for 7 days after dismissal
        return (Date.now() - parseInt(dismissed)) < 7 * 24 * 60 * 60 * 1000;
    },

    setSubscribed: (email) => {
        localStorage.setItem('noredfarms-subscribed', 'true');
        localStorage.setItem('noredfarms-email', email);
    },

    setDismissed: () => {
        localStorage.setItem('noredfarms-dismissed', Date.now().toString());
    },

    shouldShowPopup: () => !SignupTracker.isSubscribed() && !SignupTracker.isDismissed()
};

// Signup Modal Controller
const SignupModal = {
    modalElement: null,
    timeoutId: null,

    // Initialize the modal system
    init() {
        // If already subscribed, redirect to welcome page
        if (SignupTracker.isSubscribed() && window.location.pathname.endsWith('index.html') ||
            SignupTracker.isSubscribed() && window.location.pathname === '/') {
            // Don't auto-redirect, let them browse
        }

        this.createModal();
        this.bindEvents();

        // Show popup after 8 seconds if conditions are met
        if (SignupTracker.shouldShowPopup()) {
            this.timeoutId = setTimeout(() => {
                this.open();
            }, 8000);
        }

        // Bind hero signup form
        this.bindHeroSignup();

        // Bind mobile signup button
        this.bindMobileSignup();
    },

    // Create the modal HTML
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'signup-modal';
        modal.id = 'signupModal';
        modal.innerHTML = `
            <div class="signup-overlay" id="signupOverlay"></div>
            <div class="signup-content">
                <button class="signup-close" id="signupClose" aria-label="Close signup">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                <div class="signup-icon">
                    <svg viewBox="0 0 40 40" fill="none">
                        <path d="M20 4C20 4 8 12 8 22C8 28.627 13.373 34 20 34C26.627 34 32 28.627 32 22C32 12 20 4 20 4Z" fill="currentColor" opacity="0.2"/>
                        <path d="M20 8C20 8 12 14 12 22C12 26.418 15.582 30 20 30C24.418 30 28 26.418 28 22C28 14 20 8 20 8Z" fill="currentColor" opacity="0.4"/>
                        <path d="M20 12C20 12 16 16 16 22C16 24.209 17.791 26 20 26C22.209 26 24 24.209 24 22C24 16 20 12 20 12Z" fill="currentColor"/>
                    </svg>
                </div>

                <h2 class="signup-title">Join the Nored Farms Community</h2>
                <p class="signup-subtitle">
                    Be first to know when we launch. Get exclusive access to botanical education,
                    early product releases, and 15% off your first order.
                </p>

                <form class="signup-form" id="signupForm">
                    <div class="signup-input-group">
                        <input
                            type="email"
                            id="signupEmail"
                            placeholder="Enter your email"
                            required
                            autocomplete="email"
                        >
                        <button type="submit" class="btn btn-primary">
                            <span>Join Waitlist</span>
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                    <p class="signup-privacy">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                        </svg>
                        We respect your privacy. Unsubscribe anytime.
                    </p>
                </form>

                <div class="signup-success" id="signupSuccess" style="display: none;">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h3>Welcome to the Community!</h3>
                    <p>You're on the list. Watch your inbox for updates and your exclusive discount.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;
    },

    // Bind event listeners
    bindEvents() {
        // Close button
        const closeBtn = document.getElementById('signupClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.dismiss();
            });
        }

        // Overlay click
        const overlay = document.getElementById('signupOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.dismiss();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalElement?.classList.contains('open')) {
                this.dismiss();
            }
        });

        // Form submission
        const form = document.getElementById('signupForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    },

    // Bind hero signup form
    bindHeroSignup() {
        const heroForm = document.getElementById('heroSignupForm');
        if (heroForm) {
            heroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('heroEmail');
                const email = emailInput?.value;
                if (!email) return;

                const button = heroForm.querySelector('button');
                const originalText = button.innerHTML;

                // Show loading state
                button.innerHTML = '<span>Joining...</span>';
                button.disabled = true;

                // Simulate API call (replace with actual API in production)
                setTimeout(() => {
                    SignupTracker.setSubscribed(email);
                    button.innerHTML = '<span>Welcome!</span>';
                    console.log('Hero signup:', email);

                    // Redirect to welcome page
                    setTimeout(() => {
                        window.location.href = 'welcome.html';
                    }, 800);
                }, 1000);
            });
        }
    },

    // Bind mobile signup button
    bindMobileSignup() {
        const mobileBtn = document.getElementById('mobileSignupBtn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }
    },

    // Handle form submission
    handleSubmit() {
        const emailInput = document.getElementById('signupEmail');
        const form = document.getElementById('signupForm');
        const success = document.getElementById('signupSuccess');
        const email = emailInput?.value;

        if (!email) return;

        // Show loading state on button
        const button = form.querySelector('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<span>Joining...</span>';
        button.disabled = true;

        // Simulate API call (replace with actual API in production)
        setTimeout(() => {
            SignupTracker.setSubscribed(email);

            // Show success message
            if (form && success) {
                form.style.display = 'none';
                success.style.display = 'block';
            }

            console.log('Modal signup:', email);

            // Redirect to welcome page after showing success
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 1500);
        }, 1000);
    },

    // Open modal
    open() {
        if (!this.modalElement) return;

        // Cancel timeout if manually opened
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.modalElement.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Focus email input
        setTimeout(() => {
            const emailInput = document.getElementById('signupEmail');
            if (emailInput) emailInput.focus();
        }, 300);
    },

    // Close modal (without marking as dismissed)
    close() {
        if (!this.modalElement) return;

        this.modalElement.classList.remove('open');
        document.body.style.overflow = '';
    },

    // Dismiss modal (marks as dismissed for 7 days)
    dismiss() {
        SignupTracker.setDismissed();
        this.close();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SignupModal.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SignupTracker, SignupModal };
}
