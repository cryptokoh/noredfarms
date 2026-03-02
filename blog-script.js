/**
 * Nored Farms - Blog & Education Scripts
 * Handles search, filtering, and blog-specific interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initBlogSearch();
    initBlogCategories();
    initBlogNewsletter();
    initBlogAnimations();
});

/**
 * Blog Search Functionality
 */
function initBlogSearch() {
    const searchInput = document.getElementById('blogSearch');
    const blogCards = document.querySelectorAll('.blog-card');
    const featuredCard = document.querySelector('.featured-card');

    if (!searchInput) return;

    // Debounced search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filterBySearch(query, blogCards, featuredCard);
        }, 300);
    });

    // Clear search on escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterBySearch('', blogCards, featuredCard);
        }
    });
}

/**
 * Filter articles by search query
 */
function filterBySearch(query, blogCards, featuredCard) {
    let visibleCount = 0;

    // Filter blog cards
    blogCards.forEach(card => {
        const title = card.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.blog-card-excerpt')?.textContent.toLowerCase() || '';
        const category = card.dataset.category?.toLowerCase() || '';

        const matches = !query ||
            title.includes(query) ||
            excerpt.includes(query) ||
            category.includes(query);

        if (matches) {
            card.classList.remove('hidden');
            card.style.opacity = '1';
            visibleCount++;
        } else {
            card.classList.add('hidden');
            card.style.opacity = '0';
        }
    });

    // Handle featured card
    if (featuredCard) {
        const featuredTitle = featuredCard.querySelector('.featured-title')?.textContent.toLowerCase() || '';
        const featuredExcerpt = featuredCard.querySelector('.featured-excerpt')?.textContent.toLowerCase() || '';
        const featuredCategory = featuredCard.dataset.category?.toLowerCase() || '';

        const featuredMatches = !query ||
            featuredTitle.includes(query) ||
            featuredExcerpt.includes(query) ||
            featuredCategory.includes(query);

        featuredCard.style.display = featuredMatches ? 'grid' : 'none';
    }

    // Show "no results" message if needed
    updateNoResultsMessage(visibleCount, query);
}

/**
 * Blog Category Filtering
 */
function initBlogCategories() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const blogCards = document.querySelectorAll('.blog-card');
    const featuredCard = document.querySelector('.featured-card');

    if (!categoryTabs.length) return;

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update active state
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter articles
            filterByCategory(category, blogCards, featuredCard);

            // Clear search
            const searchInput = document.getElementById('blogSearch');
            if (searchInput) {
                searchInput.value = '';
            }

            // Update URL
            updateURL(category);
        });
    });

    // Handle URL params on load
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        const targetTab = document.querySelector(`.category-tab[data-category="${categoryParam}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }
}

/**
 * Filter articles by category
 */
function filterByCategory(category, blogCards, featuredCard) {
    let visibleIndex = 0;

    blogCards.forEach((card, index) => {
        const cardCategory = card.dataset.category;
        const shouldShow = category === 'all' || cardCategory === category;

        if (shouldShow) {
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
            card.classList.add('hidden');
        }
    });

    // Handle featured card
    if (featuredCard) {
        const featuredCategory = featuredCard.dataset.category;
        const showFeatured = category === 'all' || featuredCategory === category;

        if (showFeatured) {
            featuredCard.style.display = 'grid';
            featuredCard.style.opacity = '0';
            setTimeout(() => {
                featuredCard.style.transition = 'opacity 0.5s ease';
                featuredCard.style.opacity = '1';
            }, 100);
        } else {
            featuredCard.style.display = 'none';
        }
    }
}

/**
 * Update URL with category parameter
 */
function updateURL(category) {
    const url = new URL(window.location);
    if (category === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', category);
    }
    history.pushState({}, '', url);
}

/**
 * Show/hide "no results" message
 */
function updateNoResultsMessage(visibleCount, query) {
    let noResults = document.getElementById('noResultsMessage');

    if (visibleCount === 0 && query) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noResultsMessage';
            noResults.className = 'no-results-message';
            noResults.innerHTML = `
                <div class="no-results-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <h3>No articles found</h3>
                    <p>Try adjusting your search or browse by category</p>
                </div>
            `;

            // Add styles dynamically
            noResults.style.cssText = `
                text-align: center;
                padding: var(--spacing-3xl);
                color: var(--color-text-muted);
            `;

            const blogGrid = document.getElementById('blogGrid');
            if (blogGrid) {
                blogGrid.parentNode.insertBefore(noResults, blogGrid.nextSibling);
            }
        }
        noResults.style.display = 'block';
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

/**
 * Blog Newsletter Form
 */
function initBlogNewsletter() {
    const form = document.getElementById('blogNewsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');
        const originalText = button.innerHTML;
        const email = emailInput.value;

        // Validate email
        if (!isValidEmail(email)) {
            showFormError(emailInput, 'Please enter a valid email address');
            return;
        }

        // Show loading state
        button.innerHTML = '<span>Subscribing...</span>';
        button.disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success
        button.innerHTML = '<span>Subscribed!</span>';
        form.reset();

        // Show success message
        showSuccessToast('You\'re subscribed! Check your inbox for a confirmation.');

        // Reset button
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 3000);

        console.log('Blog newsletter signup:', email);
    });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show form error
 */
function showFormError(input, message) {
    input.style.borderColor = '#ef4444';

    // Remove existing error
    const existingError = input.parentNode.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Add error message
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    error.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    input.parentNode.appendChild(error);

    // Clear on input
    input.addEventListener('input', () => {
        input.style.borderColor = '';
        error.remove();
    }, { once: true });
}

/**
 * Show success toast notification
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remove after delay
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Blog Animations
 */
function initBlogAnimations() {
    // Intersection Observer for reveal animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe blog cards
    document.querySelectorAll('.blog-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        revealObserver.observe(card);
    });

    // Featured card animation
    const featuredCard = document.querySelector('.featured-card');
    if (featuredCard) {
        featuredCard.style.opacity = '0';
        featuredCard.style.transform = 'translateY(30px)';
        featuredCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            featuredCard.style.opacity = '1';
            featuredCard.style.transform = 'translateY(0)';
        }, 200);
    }
}

/**
 * Load More Articles (placeholder for future implementation)
 */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', async () => {
        const originalText = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<span>Loading...</span>';
        loadMoreBtn.disabled = true;

        // Simulate loading more articles
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, this would fetch more articles from an API
        // and append them to the blog grid

        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;

        console.log('Load more articles requested');
    });
}

// Initialize load more
document.addEventListener('DOMContentLoaded', initLoadMore);
