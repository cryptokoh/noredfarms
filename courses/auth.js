/**
 * Auth Module - Nored Farms (Site-Wide)
 *
 * Handles signup, login, magic link, password reset, session guard, and nav state.
 * Works on both course pages and main site pages.
 * Depends on: supabase-config.js (getSupabase)
 */

/* ── Auth API ── */

const SITE_URL = 'https://noredfarms.netlify.app';

async function signUp(email, password, displayName) {
    const sb = getSupabase();
    const name = displayName || email.split('@')[0];
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: name },
            emailRedirectTo: SITE_URL + '/courses/dashboard.html'
        }
    });
    // Fallback: upsert profile in case the DB trigger didn't run
    if (data?.user && !error) {
        await sb.from('profiles').upsert({
            id: data.user.id,
            email: email,
            display_name: name
        }, { onConflict: 'id' }).select();
    }
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
        options: { emailRedirectTo: SITE_URL + '/courses/dashboard.html' }
    });
    return { data, error };
}

async function resetPassword(email) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: SITE_URL + '/courses/login.html?reset=true'
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
        sessionStorage.setItem('nored_return_to', returnTo);
        window.location.href = '/courses/login.html';
        return null;
    }
    return session;
}

/* ── Nav Auth State ── */

function updateNavAuthState(user) {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    // Remove the static Login link and any previously injected auth links
    navLinks.querySelectorAll('.nav-link-auth').forEach(el => el.remove());
    // Remove static Login link (present in all page templates)
    navLinks.querySelectorAll('a').forEach(a => {
        if (a.textContent.trim() === 'Login' && !a.classList.contains('nav-link-auth')) {
            a.remove();
        }
    });

    const ctaLink = navLinks.querySelector('.nav-cta');
    const currentPath = window.location.pathname;
    const redirectParam = encodeURIComponent(currentPath + window.location.search);

    if (user) {
        // Logged in: show Account link
        const accountLink = document.createElement('a');
        accountLink.href = '/account/dashboard.html';
        accountLink.className = 'nav-link-auth';
        accountLink.textContent = 'Account';

        if (ctaLink) {
            navLinks.insertBefore(accountLink, ctaLink);
        } else {
            navLinks.appendChild(accountLink);
        }
    } else {
        // Logged out: show Sign In text link + Sign Up pill button
        const signInLink = document.createElement('a');
        signInLink.href = '/courses/login.html?redirect=' + redirectParam;
        signInLink.className = 'nav-link-auth';
        signInLink.textContent = 'Sign In';

        const signUpLink = document.createElement('a');
        signUpLink.href = '/courses/login.html?mode=signup&redirect=' + redirectParam;
        signUpLink.className = 'nav-link-auth nav-auth-signup';
        signUpLink.textContent = 'Sign Up';

        if (ctaLink) {
            navLinks.insertBefore(signInLink, ctaLink);
            navLinks.insertBefore(signUpLink, ctaLink);
        } else {
            navLinks.appendChild(signInLink);
            navLinks.appendChild(signUpLink);
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

/**
 * Lightweight init for public pages (not gated).
 * Sets up session listener + updates nav auth state.
 */
function initSiteAuth() {
    initAuthListener();
}
