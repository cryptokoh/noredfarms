/* ============================================
   Nored Farms - Shipping Cost Estimator
   Self-injecting module
   ============================================ */

(function() {
    'use strict';

    // Build modal HTML
    var modalHTML = '<div class="shipping-overlay" id="shippingOverlay">' +
        '<div class="shipping-modal">' +
        '<div class="shipping-modal-header">' +
        '<h3>Estimate Shipping</h3>' +
        '<button class="shipping-modal-close" id="shippingClose" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button></div>' +
        '<div class="shipping-modal-body">' +
        '<div class="shipping-form-group">' +
        '<label for="shipZip">Your ZIP Code</label>' +
        '<input type="text" id="shipZip" placeholder="e.g. 78602" maxlength="5" pattern="[0-9]{5}">' +
        '</div>' +
        '<div class="shipping-form-group">' +
        '<label for="shipWeight">Package Size</label>' +
        '<select id="shipWeight">' +
        '<option value="small">Small Package (under 1 lb)</option>' +
        '<option value="medium">Medium Package (1-3 lbs)</option>' +
        '<option value="large">Large Package (3-5 lbs)</option>' +
        '<option value="plants">Live Plants (special handling)</option>' +
        '</select></div>' +
        '<button class="shipping-calc-btn" id="shippingCalcBtn">Calculate Shipping</button>' +
        '<div class="shipping-results" id="shippingResults" style="display:none;"></div>' +
        '</div></div></div>';

    // Inject modal
    var container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container.firstChild);

    // Inject trigger buttons near product content
    var productPages = document.querySelectorAll('.product-card, .product-hero, .product-grid');
    var triggerPlaced = false;

    // Also check if we're on a product page
    var isProductPage = window.location.pathname.indexOf('/products/') !== -1;

    if (productPages.length > 0 || isProductPage) {
        // Find a good place to put the trigger
        var target = document.querySelector('.product-hero') || document.querySelector('.product-grid');
        if (target) {
            var triggerDiv = document.createElement('div');
            triggerDiv.style.marginTop = '0.75rem';
            triggerDiv.innerHTML = '<button class="shipping-trigger" data-shipping-trigger>' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' +
                '<span>Estimate Shipping Cost</span></button>';
            target.parentNode.insertBefore(triggerDiv, target.nextSibling);
            triggerPlaced = true;
        }
    }

    // Elements
    var overlay = document.getElementById('shippingOverlay');
    var closeBtn = document.getElementById('shippingClose');
    var calcBtn = document.getElementById('shippingCalcBtn');
    var resultsDiv = document.getElementById('shippingResults');
    var zipInput = document.getElementById('shipZip');

    function openShipping() {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        zipInput.focus();
    }

    function closeShipping() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Bind trigger clicks
    document.addEventListener('click', function(e) {
        var trigger = e.target.closest('[data-shipping-trigger]');
        if (trigger) {
            e.preventDefault();
            openShipping();
        }
    });

    closeBtn.addEventListener('click', closeShipping);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeShipping();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeShipping();
    });

    // Shipping calculation
    calcBtn.addEventListener('click', function() {
        var zip = zipInput.value.trim();
        if (!/^\d{5}$/.test(zip)) {
            zipInput.style.borderColor = '#ef4444';
            return;
        }
        zipInput.style.borderColor = '';

        var weight = document.getElementById('shipWeight').value;
        var zipPrefix = parseInt(zip.substring(0, 2));

        // Zone-based rates (from Texas ZIP 78602)
        var base;
        if (zipPrefix >= 73 && zipPrefix <= 79) {
            base = 5.99; // Local TX
        } else if ((zipPrefix >= 35 && zipPrefix <= 49) || (zipPrefix >= 50 && zipPrefix <= 58) || (zipPrefix >= 60 && zipPrefix <= 72)) {
            base = 8.99; // South/Central US
        } else if (zipPrefix >= 1 && zipPrefix <= 34) {
            base = 11.99; // East Coast
        } else {
            base = 12.99; // West Coast
        }

        // Weight multipliers
        var multipliers = { small: 1, medium: 1.5, large: 2, plants: 2.5 };
        var mult = multipliers[weight] || 1;

        var standard = (base * mult).toFixed(2);
        var priority = (base * mult * 1.6).toFixed(2);
        var express = (base * mult * 2.2).toFixed(2);

        var isPlants = weight === 'plants';
        var freeStandard = false; // Would check cart total > $75

        var html = '<h4>Estimated Shipping Rates</h4>';

        html += '<div class="shipping-option">' +
            '<div class="shipping-option-info"><h5>Standard Shipping</h5><p>5-7 business days</p></div>' +
            '<span class="shipping-option-price">$' + standard + '</span></div>';

        html += '<div class="shipping-option">' +
            '<div class="shipping-option-info"><h5>Priority Shipping</h5><p>2-3 business days</p></div>' +
            '<span class="shipping-option-price">$' + priority + '</span></div>';

        html += '<div class="shipping-option">' +
            '<div class="shipping-option-info"><h5>Express Shipping</h5><p>1-2 business days</p></div>' +
            '<span class="shipping-option-price">$' + express + '</span></div>';

        html += '<div class="shipping-note">';
        html += 'Orders over $75 qualify for <strong>free Standard shipping</strong>.';
        if (isPlants) {
            html += '<br>Live plants ship <strong>Monday-Wednesday only</strong> to ensure plant health. Includes heat/cold pack as needed.';
        }
        html += '</div>';

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    });

    // Allow Enter key in ZIP field
    zipInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calcBtn.click();
        }
    });
})();
