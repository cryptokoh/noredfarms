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

        // Add role-based links (async, non-blocking)
        _injectRoleLinks(navLinks, ctaLink);
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

/* ── Role-Based Nav Links ── */

let _roleLinksInjected = false;

async function _injectRoleLinks(navLinks, ctaLink) {
    if (_roleLinksInjected) return;
    try {
        const profile = await getProfile();
        if (!profile) return;
        _roleLinksInjected = true;

        // Remove any existing role links
        navLinks.querySelectorAll('.nav-link-role').forEach(el => el.remove());

        const insertBefore = ctaLink || null;

        if (profile.role === 'wholesale' || profile.role === 'admin') {
            const wsLink = document.createElement('a');
            wsLink.href = '/wholesale/dashboard.html';
            wsLink.className = 'nav-link-auth nav-link-role';
            wsLink.textContent = 'Wholesale';
            if (insertBefore) navLinks.insertBefore(wsLink, insertBefore);
            else navLinks.appendChild(wsLink);
        }

        if (profile.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin/';
            adminLink.className = 'nav-link-auth nav-link-role';
            adminLink.textContent = 'Admin';
            if (insertBefore) navLinks.insertBefore(adminLink, insertBefore);
            else navLinks.appendChild(adminLink);
        }
    } catch (e) {
        // Profile fetch failed — skip role links silently
    }
}

/* ── Auth State Listener ── */

function initAuthListener() {
    const sb = getSupabase();
    sb.auth.onAuthStateChange((event, session) => {
        _roleLinksInjected = false;
        updateNavAuthState(session ? session.user : null);
    });

    // Set initial state
    getUser().then(user => updateNavAuthState(user));
}

/* ── Wholesale & Admin Guards ── */

/**
 * Require wholesale access: logged in + role=wholesale + account approved + active.
 * Redirects to login or wholesale application if not qualified.
 */
async function requireWholesaleAuth() {
    const session = await requireAuth('/wholesale/index.html');
    if (!session) return null;

    const profile = await getProfile();
    if (!profile || (profile.role !== 'wholesale' && profile.role !== 'admin')) {
        window.location.href = '/wholesale/index.html';
        return null;
    }

    const account = await getWholesaleAccount();
    if (!account || account.application_status !== 'approved') {
        window.location.href = '/wholesale/index.html';
        return null;
    }

    return { session, profile, account };
}

/**
 * Require admin access: logged in + role=admin.
 * Redirects to homepage if not admin.
 */
async function requireAdminAuth() {
    const session = await requireAuth('/courses/login.html');
    if (!session) return null;

    const profile = await getProfile();
    if (!profile || profile.role !== 'admin') {
        window.location.href = '/';
        return null;
    }

    return { session, profile };
}

/**
 * Fetch the wholesale_accounts row for the current user.
 * Returns null if not found or not logged in.
 */
async function getWholesaleAccount() {
    const user = await getUser();
    if (!user) return null;
    const sb = getSupabase();
    const { data } = await sb
        .from('wholesale_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();
    return data;
}

/**
 * Lightweight init for public pages (not gated).
 * Sets up session listener + updates nav auth state.
 */
function initSiteAuth() {
    initAuthListener();
}
