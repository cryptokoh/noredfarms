#!/usr/bin/env python3
"""
Build Search Index for Pure Extracts TX
Scans all public HTML pages and regenerates the PAGES array in site-search.js.

Usage:
    python3 build-search-index.py          # Preview changes
    python3 build-search-index.py --write  # Write to site-search.js
"""

import os
import re
import sys
import json
import html

ROOT = os.path.dirname(os.path.abspath(__file__))
SEARCH_JS = os.path.join(ROOT, 'site-search.js')

# Pages to skip (internal/dev pages, not public content)
SKIP_FILES = {
    'design-index.html', 'prd.html', 'font-demo.html', 'seo.html',
    'success.html', 'cancel.html',
}

# Directories to skip entirely
SKIP_DIRS = {'styles', 'plants', 'node_modules', '.git'}

# Category detection rules (order matters - first match wins)
CATEGORY_RULES = [
    # Path-based (subdirectories first)
    (lambda p, t: 'products/' in p, 'Products'),
    (lambda p, t: 'classroom/' in p, 'Classroom'),
    # Root pages are always "Pages" (no subdirectory in path)
    (lambda p, t: '/' not in p, 'Pages'),
    # Content-based keywords in title (articles only at this point)
    (lambda p, t: any(w in t.lower() for w in ['kratom']), 'Kratom'),
    (lambda p, t: any(w in t.lower() for w in ['kava', 'kavalactone']), 'Kava'),
    (lambda p, t: any(w in t.lower() for w in ['blue lotus', 'nymphaea']), 'Blue Lotus'),
    (lambda p, t: any(w in t.lower() for w in ['cannabis', 'hemp', 'thc', 'cbd']), 'Cannabis'),
    (lambda p, t: any(w in t.lower() for w in ['prickly pear', 'agarita', 'persimmon', 'yaupon', 'yucca', 'davis mountain', 'texas native']), 'Texas Natives'),
    (lambda p, t: any(w in t.lower() for w in ['extraction method', 'alkaloid', 'adaptogen', 'dosing', 'coa', 'monograph', 'compound', 'science']), 'Science'),
    (lambda p, t: 'articles/' in p, 'Guides'),  # Default for articles
    (lambda p, t: True, 'Pages'),  # Default fallback
]

# Stop words to exclude from auto-generated keywords
STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'how', 'what', 'which', 'who', 'whom', 'why', 'where',
    'when', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'about', 'above', 'after', 'before', 'between',
    'into', 'through', 'during', 'up', 'down', 'out', 'off', 'over', 'under',
    'pure', 'extracts', 'guide', 'cultivation', 'growing', 'complete',
}


def extract_title(content):
    """Extract text from <title> tag, strip site suffix."""
    m = re.search(r'<title[^>]*>(.*?)</title>', content, re.DOTALL | re.IGNORECASE)
    if not m:
        return None
    title = html.unescape(m.group(1).strip())
    # Strip common suffixes like " | Pure Extracts TX" or " - Pure Extracts TX"
    title = re.sub(r'\s*[\|–—-]\s*Pure Extracts.*$', '', title, flags=re.IGNORECASE)
    return title.strip()


def extract_meta_description(content):
    """Extract meta description content."""
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    if not m:
        m = re.search(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', content, re.IGNORECASE)
    if m:
        return html.unescape(m.group(1).strip())
    return ''


def extract_h1(content):
    """Extract first h1 text as fallback for title."""
    m = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL | re.IGNORECASE)
    if m:
        text = re.sub(r'<[^>]+>', '', m.group(1))
        return html.unescape(text.strip())
    return None


def generate_keywords(title, desc, filepath):
    """Generate keyword list from title, description, and filename."""
    kw = set()

    # Words from filename
    basename = os.path.splitext(os.path.basename(filepath))[0]
    for word in re.split(r'[-_]', basename):
        if word.lower() not in STOP_WORDS and len(word) > 2:
            kw.add(word.lower())

    # Words from title
    for word in re.split(r'\s+', title):
        clean = re.sub(r'[^\w]', '', word).lower()
        if clean and clean not in STOP_WORDS and len(clean) > 2:
            kw.add(clean)

    # Key words from description (first 2-word phrases and important single words)
    if desc:
        desc_words = re.findall(r'\b\w{3,}\b', desc.lower())
        for w in desc_words:
            if w not in STOP_WORDS:
                kw.add(w)

    # Cap at 6 keywords
    return sorted(list(kw))[:6]


def detect_category(relpath, title):
    """Detect page category based on path and title content."""
    for rule_fn, cat in CATEGORY_RULES:
        if rule_fn(relpath, title):
            return cat
    return 'Pages'


def scan_pages():
    """Scan all public HTML pages and build the index."""
    pages = []
    seen_urls = set()

    # Scan root + subdirectories
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Skip non-content directories
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]

        rel_dir = os.path.relpath(dirpath, ROOT)
        if rel_dir == '.':
            rel_dir = ''

        # Only index root, articles/, products/, classroom/
        if rel_dir and not rel_dir.startswith(('articles', 'products', 'classroom')):
            continue

        for fname in sorted(filenames):
            if not fname.endswith('.html'):
                continue
            if fname in SKIP_FILES:
                continue

            filepath = os.path.join(dirpath, fname)
            relpath = os.path.relpath(filepath, ROOT)

            # Build the URL as used in search (relative to root)
            url = relpath

            if url in seen_urls:
                continue
            seen_urls.add(url)

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except Exception:
                continue

            title = extract_title(content)
            if not title:
                title = extract_h1(content)
            if not title:
                # Generate from filename
                title = os.path.splitext(fname)[0].replace('-', ' ').title()

            desc = extract_meta_description(content)
            if not desc:
                desc = title  # Fallback

            cat = detect_category(relpath, title)
            kw = generate_keywords(title, desc, relpath)

            pages.append({
                'title': title,
                'url': url,
                'desc': desc[:100],  # Truncate long descriptions
                'cat': cat,
                'kw': kw,
            })

    # Sort: Pages first, then Products, Classroom, then articles alphabetically
    cat_order = {'Pages': 0, 'Products': 1, 'Classroom': 2}
    pages.sort(key=lambda p: (cat_order.get(p['cat'], 3), p['cat'], p['title']))

    return pages


def format_pages_array(pages):
    """Format pages as JS array for embedding in site-search.js."""
    lines = []
    lines.append('    var PAGES = [')
    for i, p in enumerate(pages):
        kw_str = json.dumps(p['kw'])
        title_esc = p['title'].replace('"', '\\"')
        desc_esc = p['desc'].replace('"', '\\"')
        comma = ',' if i < len(pages) - 1 else ''
        lines.append(
            f'        {{ title: "{title_esc}", url: "{p["url"]}", '
            f'desc: "{desc_esc}", cat: "{p["cat"]}", kw: {kw_str} }}{comma}'
        )
    lines.append('    ];')
    return '\n'.join(lines)


def update_search_js(pages_block):
    """Replace the PAGES array in site-search.js."""
    with open(SEARCH_JS, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match from "var PAGES = [" to the closing "];"
    pattern = r'    var PAGES = \[.*?\];'
    replacement = pages_block

    new_content, count = re.subn(pattern, replacement, content, count=1, flags=re.DOTALL)
    if count == 0:
        print("ERROR: Could not find PAGES array in site-search.js")
        sys.exit(1)

    return new_content


def main():
    write_mode = '--write' in sys.argv

    pages = scan_pages()
    pages_block = format_pages_array(pages)

    # Collect all categories for CAT_COLORS check
    cats = sorted(set(p['cat'] for p in pages))

    print(f"Found {len(pages)} pages across {len(cats)} categories:")
    for cat in cats:
        count = sum(1 for p in pages if p['cat'] == cat)
        print(f"  {cat}: {count}")
    print()

    if write_mode:
        new_content = update_search_js(pages_block)
        with open(SEARCH_JS, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {SEARCH_JS}")
        print("New categories to add to CAT_COLORS (if any):")
        existing_cats = {'Pages', 'Products', 'Kratom', 'Kava', 'Blue Lotus', 'Science', 'Guides', 'Texas Natives', 'Cannabis', 'Classroom'}
        new_cats = set(cats) - existing_cats
        if new_cats:
            for c in new_cats:
                print(f'  "{c}": "#hexcolor",')
        else:
            print("  (none)")
    else:
        print("Preview (run with --write to update site-search.js):\n")
        print(pages_block)
        print(f"\nCategories found: {', '.join(cats)}")


if __name__ == '__main__':
    main()
