/**
 * Nored Farms - Favorites System
 * Toggle heart buttons on any element with [data-favoriteable].
 * Depends on: supabase-config.js, auth.js
 */

const Favorites = {
    _cache: new Map(),

    async toggle(itemType, itemId, itemTitle, itemUrl, itemMeta) {
        const user = await getUser();
        if (!user) {
            const redirect = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = '/courses/login.html?redirect=' + redirect;
            return;
        }
        const sb = getSupabase();
        const key = itemType + ':' + itemId;

        if (this._cache.get(key)) {
            // Remove favorite
            await sb.from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('item_type', itemType)
                .eq('item_id', itemId);
            this._cache.set(key, false);
        } else {
            // Add favorite
            await sb.from('favorites').upsert({
                user_id: user.id,
                item_type: itemType,
                item_id: itemId,
                item_title: itemTitle,
                item_url: itemUrl,
                item_meta: itemMeta || {}
            }, { onConflict: 'user_id,item_type,item_id' });
            this._cache.set(key, true);
        }
        return this._cache.get(key);
    },

    async loadUserFavorites() {
        const user = await getUser();
        if (!user) return;
        const sb = getSupabase();
        const { data } = await sb.from('favorites')
            .select('item_type, item_id')
            .eq('user_id', user.id);
        if (data) {
            data.forEach(f => this._cache.set(f.item_type + ':' + f.item_id, true));
        }
    },

    isFavorited(itemType, itemId) {
        return !!this._cache.get(itemType + ':' + itemId);
    },

    async renderButtons() {
        await this.loadUserFavorites();

        document.querySelectorAll('[data-favoriteable]').forEach(el => {
            if (el.querySelector('.fav-btn')) return; // already rendered

            const type = el.dataset.favType || 'product';
            const id = el.dataset.favId || el.dataset.productId || '';
            const title = el.dataset.favTitle || el.querySelector('h3')?.textContent || '';
            const url = el.dataset.favUrl || window.location.pathname;
            const price = el.dataset.price || '';
            const category = el.dataset.category || el.dataset.favCategory || '';
            const meta = {};
            if (price) meta.price = price;
            if (category) meta.category = category;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'fav-btn';
            btn.setAttribute('aria-label', 'Toggle favorite');
            btn.innerHTML = this.isFavorited(type, id) ? this._filledHeart() : this._outlineHeart();
            if (this.isFavorited(type, id)) btn.classList.add('fav-active');

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const nowFav = await this.toggle(type, id, title, url, meta);
                btn.innerHTML = nowFav ? this._filledHeart() : this._outlineHeart();
                btn.classList.toggle('fav-active', nowFav);
            });

            // Position relative if not already
            const pos = getComputedStyle(el).position;
            if (pos === 'static') el.style.position = 'relative';
            el.appendChild(btn);
        });
    },

    _outlineHeart() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    },

    _filledHeart() {
        return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    }
};

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth to be ready, then render
    if (typeof getSupabase !== 'undefined') {
        setTimeout(() => Favorites.renderButtons(), 300);
    }
});
