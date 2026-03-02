# Seed.com Design Reference for Nored Farms

Extracted design system analysis from seed.com to guide Nored Farms visual refresh.

---

## Color Palette

### Primary Colors
| Role | Value | Notes |
|------|-------|-------|
| Primary Accent | `#8b5cf6` (Purple-600) | CTAs, active states, focus rings |
| Secondary Blue | `#3b82f6` | Links, secondary actions |
| Green Accent | `#059669` | Success states, eco/health cues |
| Pink Accent | `#ec4899` | Highlights, badges |

### Backgrounds & Surfaces
| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Page BG | `#ffffff` | `#171717` / `oklch(20% .012 264)` |
| Surface | `#f9fafb` (gray-50) | `#262626` (gray-800) |
| Text Primary | `#111827` (gray-900) | `#f9fafb` (gray-50) |
| Text Secondary | `#6b7280` (gray-500) | `#9ca3af` (gray-400) |

### Mapping to Nored Farms
| Seed Token | PETX Equivalent | Suggested Value |
|------------|-----------------|-----------------|
| Purple-600 | `--accent` | Keep PETX gold/amber or shift to a botanical green |
| Gray-900 | `--text-primary` | `#1a1a2e` (current PETX dark) |
| White BG | `--bg-primary` | `#faf9f6` (warm off-white, botanical feel) |
| Gray-50 | `--bg-secondary` | `#f0ede8` (warm gray) |

---

## Typography System

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Scale
| Token | Size | Use |
|-------|------|-----|
| xs | `0.75rem` (12px) | Captions, meta |
| sm | `0.875rem` (14px) | Body small, labels |
| base | `1rem` (16px) | Body text |
| lg | `1.125rem` (18px) | Lead paragraphs |
| xl | `1.25rem` (20px) | Section intros |
| 2xl | `1.5rem` (24px) | H3 headings |
| 3xl | `1.875rem` (30px) | H2 headings |
| 4xl | `2.25rem` (36px) | H1 headings |
| 5xl | `3rem` (48px) | Hero headings |
| 6xl | `3.75rem` (60px) | Display text |

### Weights & Spacing
- **Medium** (500): Body text, nav links
- **Semibold** (600): Subheadings, buttons
- **Bold** (700): Headings, emphasis
- **Letter-spacing**: `tracking-tight` (-0.025em) for headings, `tracking-wide` (0.025em) for labels/caps

---

## Side Menu / Navigation (Key Feature)

### Structure
Seed uses a **full-panel slide-out mobile menu** with the following pattern:

```
[Fixed Top Bar]
  [Logo (left)] [Nav Links (center/right, desktop)] [Hamburger (right, mobile)]

[Side Panel - Mobile] (slides from left)
  translateX(-100%) -> translateX(0)
  Full viewport height
  Background overlay on content
```

### Implementation Details
```css
/* Sticky top nav with GPU acceleration */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  transform: translate3d(0, 0, 0); /* GPU layer */
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

/* Mobile side panel */
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  overflow-y: auto;
  background: #ffffff;
  padding: 2rem;
}

.side-menu.open {
  transform: translateX(0);
}

/* Content overlay */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 99;
}

.menu-overlay.active {
  opacity: 1;
  visibility: visible;
}
```

### Menu Interior Layout
- Large, clean nav links with generous padding (1rem+ vertical)
- Font-weight: 500-600 on links
- Subtle hover: color shift or underline animation
- Nested sections with smaller text / indentation
- CTA button at bottom of menu (e.g., "Shop Now")
- Close button (X) top-right of panel

---

## Layout & Grid

### Breakpoints
| Name | Width | Columns |
|------|-------|---------|
| sm | `40rem` (640px) | 1 |
| md | `48rem` (768px) | 2 |
| lg | `64rem` (1024px) | 2-3 |
| xl | `80rem` (1280px) | 3-4 |
| 2xl | `96rem` (1536px) | 4+ |

### Spacing Scale
Base unit: `0.25rem` (4px)
- **4** = `1rem` (16px) - standard gap
- **6** = `1.5rem` (24px) - section padding
- **8** = `2rem` (32px) - large gaps
- **12** = `3rem` (48px) - section margins
- **24** = `6rem` (96px) - hero spacing

### Container
- Max-width with auto margins
- Responsive padding: `1rem` (mobile) -> `2rem` (desktop)

---

## Animations & Transitions

### Default Timing
```css
transition-duration: 0.15s;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Key Animations
| Pattern | Properties | Values |
|---------|------------|--------|
| Fade in up | opacity, transform | `0 -> 1`, `translateY(20px) -> 0` |
| Stagger delay | transition-delay | `0.1s, 0.2s, 0.3s... 0.8s` |
| Hover scale | transform | `scale(1.05)` to `scale(1.1)` |
| Hover lift | transform | `translateY(-2px)` |
| Card image zoom | transform | `scale(1.05)` within overflow:hidden |
| Button shine | background-position | Left-to-right gradient sweep |

### Button Hover Effect (Inline Shine)
```css
.btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}
.btn:hover::after {
  left: 100%;
}
```

---

## Interactive Elements

### Buttons
- Border-radius: `0.5rem` (8px)
- Focus: 2px ring offset with purple (`indigo-600`)
- Inline shine effect on hover
- Padding: `0.75rem 1.5rem` typical

### Cards
- Border-radius: `1.5rem` (24px) for larger elements
- Layered shadows: `shadow-md` through `shadow-2xl`
- Image zoom on hover (1.05x scale, overflow hidden)
- Hover lift: `translateY(-2px)` + shadow enhancement

### Sliders/Carousels
- Grab cursor for drag interaction
- Centered dot indicators
- Active dot: `#8b5cf6`, 28px wide (pill shape)
- Inactive dot: smaller, muted color
- Desktop: navigation arrows appear on hover (opacity transition 0.3s)

---

## Design Philosophy (for PETX alignment)

### Seed's Approach
1. **Scientific minimalism** - Clean, lots of whitespace, data-driven aesthetic
2. **Micro/macro imagery** - Connecting small (cellular) with large (planetary)
3. **Premium positioning** - Minimalist design = premium feel
4. **Education-forward** - Design serves to explain complex topics simply
5. **Modernist sensibilities** - Tech-startup level polish for a health brand

### How PETX Can Adapt This
1. **Botanical minimalism** - Replace cellular imagery with botanical/extraction motifs
2. **Side menu navigation** - Full-panel slide-out for immersive browsing
3. **Clean typography** - Inter or similar geometric sans for body, keep Cinzel for display
4. **Generous whitespace** - Let content breathe, reduce visual clutter
5. **Subtle animations** - Fade-in-up on scroll, hover lifts on cards
6. **Premium palette** - Warm neutrals + a single strong accent color
7. **Education-forward** - Articles and research library front and center

---

## Quick Implementation Checklist

- [ ] Implement side-panel slide menu (translateX pattern)
- [ ] Add backdrop-filter blur to sticky nav
- [ ] Apply fade-in-up scroll animations to content sections
- [ ] Update card components with rounded corners + hover lift
- [ ] Add button shine hover effect
- [ ] Increase whitespace between sections (6rem+)
- [ ] Consider light/dark mode toggle
- [ ] Update mobile menu to full-panel instead of dropdown
