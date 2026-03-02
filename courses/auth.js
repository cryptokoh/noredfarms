/**
 * Auth Module - Nored Farms Course Platform
 *
 * Handles signup, login, magic link, password reset, session guard, and nav state.
 * Depends on: supabase-config.js (getSupabase)
 */

/* ── Auth API ── */

async function signUp(email, password, displayName) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName || email.split('@')[0] }
        }
    });
    return { data, error };
}

async function logIn(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    return { data, error };
}

async function sendMagicLink(email) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/courses/dashboard.html' }
    });
    return { data, error };
}

async function resetPassword(email) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/courses/login.html?reset=true'
    });
    return { data, error };
}

async function logOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
    window.location.href = '/courses/login.html';
}

async function getSession() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session;
}

async function getUser() {
    const session = await getSession();
    return session ? session.user : null;
}

async function getProfile() {
    const user = await getUser();
    if (!user) return null;
    const sb = getSupabase();
    const { data } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    return data;
}

/* ── Session Guard ── */

async function requireAuth(redirectUrl) {
    const session = await getSession();
    if (!session) {
        const returnTo = redirectUrl || window.location.href;
        sessionStorage.setItem('petx_return_to', returnTo);
        window.location.href = '/courses/login.html';
        return null;
    }
    return session;
}

/* ── Nav Auth State ── */

function updateNavAuthState(user) {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    // Remove any previously injected auth links
    navLinks.querySelectorAll('.nav-link-auth').forEach(el => el.remove());

    if (user) {
        const dashLink = document.createElement('a');
        dashLink.href = '/courses/dashboard.html';
        dashLink.className = 'nav-link nav-link-auth';
        dashLink.textContent = 'My Courses';

        // Insert before the CTA link (Contact Us)
        const ctaLink = navLinks.querySelector('.nav-link-cta');
        if (ctaLink) {
            navLinks.insertBefore(dashLink, ctaLink);
        } else {
            navLinks.appendChild(dashLink);
        }
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = '/courses/login.html';
        loginLink.className = 'nav-link nav-link-auth';
        loginLink.textContent = 'Login';

        const ctaLink = navLinks.querySelector('.nav-link-cta');
        if (ctaLink) {
            navLinks.insertBefore(loginLink, ctaLink);
        } else {
            navLinks.appendChild(loginLink);
        }
    }
}

/* ── Auth State Listener ── */

function initAuthListener() {
    const sb = getSupabase();
    sb.auth.onAuthStateChange((event, session) => {
        updateNavAuthState(session ? session.user : null);
    });

    // Set initial state
    getUser().then(user => updateNavAuthState(user));
}
