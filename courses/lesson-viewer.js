/**
 * Lesson Viewer - Nored Farms Course Platform
 *
 * Handles: lesson fetching, sidebar nav, progress tracking, scroll resume,
 * mark complete, next lesson navigation, and auto-certificate trigger.
 *
 * Depends on: supabase-config.js, auth.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    initAuthListener();

    const params = new URLSearchParams(window.location.search);
    const courseSlug = params.get('course');
    const lessonSlug = params.get('lesson');

    if (!courseSlug || !lessonSlug) {
        window.location.href = 'catalog.html';
        return;
    }

    const sb = getSupabase();
    const user = await getUser();

    // Fetch course
    const { data: course } = await sb
        .from('courses')
        .select('id, slug, title, lesson_count')
        .eq('slug', courseSlug)
        .eq('is_published', true)
        .single();

    if (!course) {
        document.getElementById('lessonTitle').textContent = 'Course not found';
        return;
    }

    // Fetch all lessons for sidebar
    const { data: allLessons } = await sb
        .from('lessons')
        .select('id, slug, title, sort_order, estimated_minutes, is_free_preview')
        .eq('course_id', course.id)
        .order('sort_order');

    // Fetch current lesson
    const { data: lesson, error: lessonError } = await sb
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .eq('slug', lessonSlug)
        .single();

    if (lessonError || !lesson) {
        // Check if it's a gating issue
        if (lessonError && lessonError.code === 'PGRST116') {
            // No rows returned — could be RLS blocking
            document.getElementById('gatedContent').hidden = false;
            document.getElementById('lessonLayout').hidden = true;
            return;
        }
        document.getElementById('lessonTitle').textContent = 'Lesson not found';
        return;
    }

    // Check enrollment (for non-preview lessons)
    let enrolled = false;
    let progressMap = {};

    if (user) {
        const { data: enrollment } = await sb
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .eq('is_active', true)
            .single();

        enrolled = !!enrollment;

        if (enrolled) {
            const { data: progress } = await sb
                .from('lesson_progress')
                .select('lesson_id, is_completed')
                .eq('user_id', user.id)
                .eq('course_id', course.id);

            if (progress) {
                progress.forEach(p => { progressMap[p.lesson_id] = p.is_completed; });
            }
        }
    }

    // Gate check
    if (!lesson.is_free_preview && !enrolled) {
        document.getElementById('gatedContent').hidden = false;
        document.getElementById('lessonLayout').hidden = true;
        return;
    }

    // Show lesson layout
    document.getElementById('gatedContent').hidden = true;
    document.getElementById('lessonLayout').hidden = false;

    // Populate page
    document.title = lesson.title + ' | Nored Farms';
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonTime').querySelector('span').textContent = lesson.estimated_minutes + ' min read';
    document.getElementById('lessonBody').innerHTML = lesson.content_html || '<p>Lesson content is being prepared. Check back soon.</p>';

    // Breadcrumb
    const breadcrumbCourse = document.getElementById('breadcrumbCourse');
    breadcrumbCourse.href = `course.html?slug=${courseSlug}`;
    breadcrumbCourse.textContent = course.title;
    document.getElementById('breadcrumbLesson').textContent = lesson.title;

    // Sidebar
    document.getElementById('sidebarCourseTitle').textContent = course.title;
    const completedCount = Object.values(progressMap).filter(Boolean).length;
    document.getElementById('sidebarProgress').textContent = `${completedCount} / ${course.lesson_count} completed`;

    const sidebarNav = document.getElementById('sidebarLessonNav');
    if (allLessons) {
        sidebarNav.innerHTML = allLessons.map((l, i) => {
            const isActive = l.slug === lessonSlug;
            const isCompleted = progressMap[l.id];
            const cls = [
                'sidebar-lesson-link',
                isActive ? 'active' : '',
                isCompleted ? 'completed' : ''
            ].filter(Boolean).join(' ');

            return `
                <a href="lesson.html?course=${courseSlug}&lesson=${l.slug}" class="${cls}">
                    <span class="sidebar-lesson-num">${isCompleted ? '&#10003;' : i + 1}</span>
                    <span>${l.title}</span>
                </a>
            `;
        }).join('');
    }

    // Next lesson link
    const currentIndex = allLessons ? allLessons.findIndex(l => l.slug === lessonSlug) : -1;
    const nextLesson = allLessons && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    const nextLink = document.getElementById('nextLessonLink');
    if (nextLesson) {
        nextLink.href = `lesson.html?course=${courseSlug}&lesson=${nextLesson.slug}`;
        nextLink.hidden = false;
    }

    // Mark complete button
    const markBtn = document.getElementById('markCompleteBtn');
    const isAlreadyCompleted = progressMap[lesson.id];

    if (isAlreadyCompleted) {
        markBtn.classList.add('completed');
        markBtn.querySelector('span').textContent = 'Completed';
    }

    if (!enrolled || !user) {
        markBtn.hidden = true;
    }

    markBtn.addEventListener('click', async () => {
        if (markBtn.classList.contains('completed') || !user) return;

        const { error } = await sb.from('lesson_progress').upsert({
            user_id: user.id,
            lesson_id: lesson.id,
            course_id: course.id,
            is_completed: true,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

        if (!error) {
            markBtn.classList.add('completed');
            markBtn.querySelector('span').textContent = 'Completed';
            progressMap[lesson.id] = true;

            // Update sidebar count
            const newCount = Object.values(progressMap).filter(Boolean).length;
            document.getElementById('sidebarProgress').textContent = `${newCount} / ${course.lesson_count} completed`;

            // Update sidebar link
            const activeLink = sidebarNav.querySelector('.sidebar-lesson-link.active');
            if (activeLink) {
                activeLink.classList.add('completed');
                activeLink.querySelector('.sidebar-lesson-num').innerHTML = '&#10003;';
            }

            // Check if all lessons are completed -> auto-generate certificate
            if (newCount >= course.lesson_count) {
                await generateCertificateIfEligible(user.id, course.id, courseSlug);
            }
        }
    });

    // Scroll position save (debounced, every 5s)
    if (user && enrolled) {
        // Restore scroll position
        const { data: savedProgress } = await sb
            .from('lesson_progress')
            .select('scroll_position')
            .eq('user_id', user.id)
            .eq('lesson_id', lesson.id)
            .single();

        if (savedProgress && savedProgress.scroll_position > 0) {
            const contentArea = document.getElementById('lessonContentArea');
            setTimeout(() => {
                contentArea.scrollTop = savedProgress.scroll_position;
            }, 300);
        }

        // Save scroll position
        let scrollTimeout;
        const contentArea = document.getElementById('lessonContentArea');
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(async () => {
                const scrollPos = window.scrollY || document.documentElement.scrollTop;
                await sb.from('lesson_progress').upsert({
                    user_id: user.id,
                    lesson_id: lesson.id,
                    course_id: course.id,
                    last_accessed_at: new Date().toISOString(),
                    scroll_position: scrollPos
                }, { onConflict: 'user_id,lesson_id' });
            }, 5000);
        });
    }
});

/**
 * Auto-generate certificate when all lessons are completed
 */
async function generateCertificateIfEligible(userId, courseId, courseSlug) {
    const sb = getSupabase();

    // Check if certificate already exists
    const { data: existing } = await sb
        .from('certificates')
        .select('id, certificate_number')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

    if (existing) return; // Already has certificate

    // Generate certificate number: PETX-DND-YYYY-NNNN
    const prefix = courseSlug === 'dandelion-extraction' ? 'DND' : courseSlug.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 9000) + 1000;
    const certNumber = `PETX-${prefix}-${year}-${seq}`;

    const { error } = await sb.from('certificates').insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: certNumber
    });

    if (!error) {
        // Show congratulations
        const footer = document.getElementById('lessonFooter');
        const banner = document.createElement('div');
        banner.className = 'success-banner-inner';
        banner.style.marginTop = '1rem';
        banner.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Congratulations! You've completed all lessons. <a href="certificate.html?id=${certNumber}" style="color: inherit; font-weight: 700; margin-left: 0.5rem;">View your certificate</a>
        `;
        footer.appendChild(banner);
    }
}
