/**
 * Age Verification System for Nored Farms
 *
 * Shows a 21+ age gate modal on first visit.
 * Stores verification in localStorage for 30 days.
 */

(function() {
    'use strict';

    const AGE_VERIFIED_KEY = 'noredfarms_age_verified';
    const VERIFICATION_EXPIRY_DAYS = 30;
    const DENY_REDIRECT_URL = 'https://www.google.com';

    // Check if user has already verified their age
    function isAgeVerified() {
        const verification = localStorage.getItem(AGE_VERIFIED_KEY);
        if (!verification) return false;

        try {
            const data = JSON.parse(verification);
            const expiryDate = new Date(data.expiry);
            if (expiryDate > new Date()) {
                return true;
            }
            // Expired, remove it
            localStorage.removeItem(AGE_VERIFIED_KEY);
            return false;
        } catch (e) {
            localStorage.removeItem(AGE_VERIFIED_KEY);
            return false;
        }
    }

    // Set age verification with expiry
    function setAgeVerified() {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + VERIFICATION_EXPIRY_DAYS);

        const data = {
            verified: true,
            timestamp: new Date().toISOString(),
            expiry: expiry.toISOString()
        };

        localStorage.setItem(AGE_VERIFIED_KEY, JSON.stringify(data));
    }

    // Create the age gate modal HTML
    function createAgeGateModal() {
        const modal = document.createElement('div');
        modal.id = 'ageGateOverlay';
        modal.className = 'age-gate-overlay';
        modal.innerHTML = `
            <div class="age-gate-modal" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle">
                <div class="age-gate-logo">
                    <svg class="age-gate-logo-icon" viewBox="0 0 40 40" fill="none">
                        <path d="M20 4C20 4 8 12 8 22C8 28.627 13.373 34 20 34C26.627 34 32 28.627 32 22C32 12 20 4 20 4Z" fill="currentColor" opacity="0.2"/>
                        <path d="M20 8C20 8 12 14 12 22C12 26.418 15.582 30 20 30C24.418 30 28 26.418 28 22C28 14 20 8 20 8Z" fill="currentColor" opacity="0.4"/>
                        <path d="M20 12C20 12 16 16 16 22C16 24.209 17.791 26 20 26C22.209 26 24 24.209 24 22C24 16 20 12 20 12Z" fill="currentColor"/>
                    </svg>
                    <span class="age-gate-logo-text">Nored Farms<span class="age-gate-logo-suffix">TX</span></span>
                </div>

                <div class="age-gate-badge">
                    <span>21+</span>
                </div>

                <h2 class="age-gate-title" id="ageGateTitle">Age Verification Required</h2>

                <p class="age-gate-text">
                    This website contains products intended for adults only.
                    By entering, you confirm that you are at least 21 years of age.
                </p>

                <div class="age-gate-buttons">
                    <button class="age-gate-btn age-gate-btn-confirm" id="ageGateConfirm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Yes, I am 21 or older
                    </button>
                    <button class="age-gate-btn age-gate-btn-deny" id="ageGateDeny">
                        No, I am under 21
                    </button>
                </div>

                <p class="age-gate-disclaimer">
                    By clicking "Yes", you agree to our
                    <a href="/terms.html">Terms of Service</a> and confirm you are of legal age
                    to purchase botanical products in your jurisdiction.
                </p>
            </div>
        `;

        return modal;
    }

    // Handle confirm button click
    function handleConfirm() {
        setAgeVerified();
        const overlay = document.getElementById('ageGateOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            document.body.classList.remove('age-gate-active');

            // Remove from DOM after animation
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    // Handle deny button click
    function handleDeny() {
        window.location.href = DENY_REDIRECT_URL;
    }

    // Initialize the age gate
    function init() {
        // Skip if already verified
        if (isAgeVerified()) {
            return;
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showAgeGate);
        } else {
            showAgeGate();
        }
    }

    // Show the age gate modal
    function showAgeGate() {
        // Create and append modal
        const modal = createAgeGateModal();
        document.body.appendChild(modal);
        document.body.classList.add('age-gate-active');

        // Add event listeners
        document.getElementById('ageGateConfirm').addEventListener('click', handleConfirm);
        document.getElementById('ageGateDeny').addEventListener('click', handleDeny);

        // Handle keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Don't allow escape to close - must make a choice
                e.preventDefault();
            }
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });

        // Prevent clicking outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                // Shake animation to indicate they must choose
                const modalContent = modal.querySelector('.age-gate-modal');
                modalContent.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    modalContent.style.animation = '';
                }, 500);
            }
        });

        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Focus the confirm button for accessibility
        setTimeout(() => {
            document.getElementById('ageGateConfirm').focus();
        }, 100);
    }

    // Start the age verification
    init();
})();
