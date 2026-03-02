/**
 * Course App Module - Nored Farms
 *
 * Handles: course listing, enrollment triggers, dashboard rendering,
 * Stripe checkout initiation, and enrollment status checks.
 *
 * Depends on: supabase-config.js, auth.js
 */

/* ── Course Listing ── */

async function fetchPublishedCourses() {
    const sb = getSupabase();
    const { data } = await sb
        .from('courses')
        .select('id, slug, title, description, min_tier, lesson_count')
        .eq('is_published', true)
        .order('min_tier');
    return data || [];
}

async function fetchUserEnrollments(userId) {
    const sb = getSupabase();
    const { data } = await sb
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);
    return data || [];
}

async function fetchUserCertificates(userId) {
    const sb = getSupabase();
    const { data } = await sb
        .from('certificates')
        .select('*')
        .eq('user_id', userId);
    return data || [];
}

/* ── Dashboard Rendering ── */

function renderDashboardCourses(enrollments, certificates) {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;

    if (enrollments.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                <h2>No Courses Yet</h2>
                <p>You haven't enrolled in any courses. Browse our catalog to get started with botanical education.</p>
                <a href="catalog.html" class="course-card-btn course-card-btn-primary" style="display:inline-flex; width:auto;">Browse Courses</a>
            </div>
        `;
        return;
    }

    const certMap = {};
    certificates.forEach(c => { certMap[c.course_id] = c; });

    grid.innerHTML = enrollments.map(enrollment => {
        const cert = certMap[enrollment.course_id];
        const progress = enrollment.progress_percent || 0;
        const completed = enrollment.completed_lessons || 0;
        const total = enrollment.lesson_count || 0;

        return `
            <div class="course-card">
                <span class="course-card-badge">Tier ${enrollment.tier_level}</span>
                <h3>${enrollment.course_title}</h3>
                <p class="course-card-desc">${completed} of ${total} lessons completed</p>
                <div class="progress-bar-container">
                    <div class="progress-bar-label">
                        <span>Progress</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="course-card-actions">
                    <a href="course.html?slug=${enrollment.course_slug}" class="course-card-btn course-card-btn-primary">
                        ${progress > 0 && progress < 100 ? 'Continue' : progress >= 100 ? 'Review' : 'Start'}
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    </a>
                    ${cert ? `
                        <a href="certificate.html?id=${cert.certificate_number}" class="course-card-btn course-card-btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Certificate
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/* ── Catalog Rendering ── */

function renderCatalogCourses(courses, enrolledCourseIds) {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    grid.innerHTML = courses.map(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        const tierNames = { 1: 'Home Grower', 2: 'Advanced', 3: 'Business', 4: 'Industrial' };

        return `
            <div class="course-card">
                <span class="course-card-badge">Tier ${course.min_tier} - ${tierNames[course.min_tier] || ''}</span>
                <h3>${course.title}</h3>
                <p class="course-card-desc">${course.description || ''}</p>
                <div class="course-meta" style="margin-bottom:1.25rem;">
                    <div class="course-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        ${course.lesson_count} lessons
                    </div>
                </div>
                <div class="course-card-actions">
                    ${isEnrolled
                        ? `<a href="course.html?slug=${course.slug}" class="course-card-btn course-card-btn-primary">Go to Course</a>`
                        : `<a href="course.html?slug=${course.slug}" class="course-card-btn course-card-btn-secondary">View Details</a>
                           <a href="../classes.html" class="course-card-btn course-card-btn-primary">Enroll</a>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

/* ── Stripe Checkout for Course Tiers ── */

async function startCourseCheckout(tierId) {
    const user = await getUser();
    if (!user) {
        sessionStorage.setItem('petx_pending_tier', String(tierId));
        window.location.href = '/courses/login.html';
        return;
    }

    try {
        const response = await fetch('/api/stripe-course-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tierId,
                courseSlug: 'all',
                userId: user.id,
                userEmail: user.email
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('No checkout URL returned:', data);
            alert('Unable to start checkout. Please try again.');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Unable to start checkout. Please try again.');
    }
}
