# Voxel Design System — Craftsman Edition

> "Precision meets warmth" — A design language for infrastructure-grade product development tools.

---

## Design Philosophy

Voxel's visual identity draws from architectural blueprints and master craftsmanship. The mathematical grid signals engineering precision while the warm palette communicates quality and care. This is the aesthetic of a master craftsman's workshop: precise measurements, quality materials, timeless execution.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Precision** | Mathematical grid foundations. Every element placed with intention. |
| **Warmth** | Warm neutrals that feel human, not clinical. Quality over sterility. |
| **Confidence** | High contrast, clear hierarchy. No ambiguity in actions or information. |
| **Timelessness** | Classic typography and restrained palette that won't feel dated. |

---

## Color Palette

### Primary Brand Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Aged Brass** | `#B8860B` | 184, 134, 11 | `--color-primary` | Primary CTAs, key actions |
| Antique Gold | `#D4A84B` | 212, 168, 75 | `--color-primary-light` | Hover states, highlights |
| Deep Gold | `#996F00` | 153, 111, 0 | `--color-primary-dark` | Active/pressed states |

### Neutral Palette

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Parchment** | `#FBF9F4` | 251, 249, 244 | `--color-bg-primary` | Primary background |
| Warm Linen | `#F5F3EE` | 245, 243, 238 | `--color-bg-secondary` | Secondary background, insets |
| Grid Line | `#E8E4DD` | 232, 228, 221 | `--color-grid` | Grid lines, subtle dividers |
| Warm Border | `#D6D3CD` | 214, 211, 205 | `--color-border` | Card borders, input borders |
| Walnut | `#57534E` | 87, 83, 78 | `--color-text-secondary` | Secondary text, captions |
| **Espresso** | `#292524` | 41, 37, 36 | `--color-text-primary` | Primary text, headers |
| Deep Charcoal | `#1C1917` | 28, 25, 23 | `--color-bg-dark` | Nav bar, dark UI elements |
| White | `#FFFFFF` | 255, 255, 255 | `--color-surface` | Cards, panels, modals |

### Semantic Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Olive Success | `#4D7C0F` | 77, 124, 15 | `--color-success` | Success states, validated |
| Success Background | `#ECFCCB` | 236, 252, 203 | `--color-success-bg` | Success badges, highlights |
| Amber Warning | `#92400E` | 146, 64, 14 | `--color-warning` | Warning states, in review |
| Warning Background | `#FEF3C7` | 254, 243, 199 | `--color-warning-bg` | Warning badges |
| Brick Error | `#991B1B` | 153, 27, 27 | `--color-error` | Error states, destructive |
| Error Background | `#FEE2E2` | 254, 226, 226 | `--color-error-bg` | Error badges |
| Slate Info | `#1E40AF` | 30, 64, 175 | `--color-info` | Info states, help |
| Info Background | `#DBEAFE` | 219, 234, 254 | `--color-info-bg` | Info badges |

---

## Typography

### Font Stack

```css
/* Display / Headers */
font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;

/* Body / UI */
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace / Code */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Font Installation

**Google Fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

**Or via CSS import:**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| H1 | Instrument Serif | 36px / 2.25rem | 400 | 1.2 | -0.02em |
| H2 | Instrument Serif | 30px / 1.875rem | 400 | 1.25 | -0.01em |
| H3 | Instrument Serif | 24px / 1.5rem | 400 | 1.3 | 0 |
| H4 | DM Sans | 20px / 1.25rem | 600 | 1.4 | 0 |
| H5 | DM Sans | 16px / 1rem | 600 | 1.4 | 0 |
| Body Large | DM Sans | 18px / 1.125rem | 400 | 1.6 | 0 |
| Body | DM Sans | 16px / 1rem | 400 | 1.5 | 0 |
| Body Small | DM Sans | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | DM Sans | 12px / 0.75rem | 400 | 1.4 | 0.01em |
| Overline | DM Sans | 12px / 0.75rem | 600 | 1.4 | 0.05em |

### Typography CSS

```css
h1, .h1 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 2.25rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #292524;
}

h2, .h2 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1.875rem;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #292524;
}

h3, .h3 {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.3;
  color: #292524;
}

body, .body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #292524;
}

.text-secondary {
  color: #57534E;
}

.overline {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #57534E;
}
```

---

## Mathematical Grid Background

The signature Voxel background pattern. A subtle mathematical grid on warm parchment that signals precision and intentionality.

### CSS Implementation

```css
.voxel-grid-bg {
  background-color: #FBF9F4;
  background-image:
    linear-gradient(to right, #E8E4DD 1px, transparent 1px),
    linear-gradient(to bottom, #E8E4DD 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Tailwind Custom Class

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'voxel-grid': `
          linear-gradient(to right, #E8E4DD 1px, transparent 1px),
          linear-gradient(to bottom, #E8E4DD 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-24': '24px 24px',
      },
    },
  },
}

// Usage: className="bg-[#FBF9F4] bg-voxel-grid bg-grid-24"
```

### Grid Density Options

| Density | Size | Use Case |
|---------|------|----------|
| Fine | 16px | Dense data interfaces, tables |
| Standard | 24px | Default for most views |
| Coarse | 32px | Marketing pages, hero sections |

```css
/* Fine grid */
.voxel-grid-fine { background-size: 16px 16px; }

/* Standard grid (default) */
.voxel-grid-standard { background-size: 24px 24px; }

/* Coarse grid */
.voxel-grid-coarse { background-size: 32px 32px; }
```

---

## Button Hierarchy

### Primary Button
Main CTAs, form submissions, key actions ("Build", "Create", "Open")

```css
.btn-primary {
  background-color: #B8860B;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #996F00;
}

.btn-primary:active {
  background-color: #7A5900;
}

.btn-primary:disabled {
  background-color: #D6D3CD;
  color: #57534E;
  cursor: not-allowed;
}
```

**Tailwind:**
```html
<button class="bg-[#B8860B] hover:bg-[#996F00] active:bg-[#7A5900] text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors">
  Primary Action
</button>
```

### Secondary Button
Supporting actions, alternative paths ("Share", "Export", "Settings")

```css
.btn-secondary {
  background-color: #1C1917;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: #292524;
}
```

**Tailwind:**
```html
<button class="bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors">
  Secondary Action
</button>
```

### Tertiary Button
Cancel, dismiss, low-emphasis actions

```css
.btn-tertiary {
  background-color: #FFFFFF;
  color: #292524;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #D6D3CD;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tertiary:hover {
  background-color: #F5F3EE;
  border-color: #B8860B;
}
```

**Tailwind:**
```html
<button class="bg-white hover:bg-[#F5F3EE] text-[#292524] font-medium text-sm px-5 py-2.5 rounded-lg border border-[#D6D3CD] hover:border-[#B8860B] transition-all">
  Tertiary Action
</button>
```

### Ghost Button
Inline actions, links, navigation

```css
.btn-ghost {
  background-color: transparent;
  color: #B8860B;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background-color: #FBF9F4;
  color: #996F00;
}
```

**Tailwind:**
```html
<button class="text-[#B8860B] hover:text-[#996F00] hover:bg-[#FBF9F4] font-medium text-sm px-5 py-2.5 rounded-lg transition-all">
  Ghost Action
</button>
```

### Destructive Button
Delete, remove, dangerous actions

```css
.btn-destructive {
  background-color: #991B1B;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-destructive:hover {
  background-color: #7F1D1D;
}
```

---

## Icon Guidelines

### Icon Colors by Context

| Context | Color | Hex | Usage |
|---------|-------|-----|-------|
| Default | Walnut | `#57534E` | Navigation icons, labels |
| Emphasis | Espresso | `#292524` | Active states, key info |
| Interactive | Aged Brass | `#B8860B` | Clickable, actionable |
| On Dark | Aged Brass | `#B8860B` | Icons on dark backgrounds |
| Muted | Grid Line | `#E8E4DD` | Decorative, disabled |

### Icon Sizing

| Size | Pixels | Use Case |
|------|--------|----------|
| xs | 12px | Inline with small text |
| sm | 16px | Buttons, inputs |
| md | 20px | Default UI icons |
| lg | 24px | Navigation, cards |
| xl | 32px | Feature highlights |

---

## Background Hierarchy

| Level | Name | Hex | Usage |
|-------|------|-----|-------|
| 0 | Deep Charcoal | `#1C1917` | Navigation bar, dark overlays, modals backdrop |
| 1 | Parchment + Grid | `#FBF9F4` | Main page background with grid pattern |
| 2 | White | `#FFFFFF` | Cards, panels, modals, dropdowns |
| 3 | Warm Linen | `#F5F3EE` | Inset elements, code blocks, input fields |

---

## Card Component

```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #D6D3CD;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #1C1917;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon svg {
  stroke: #B8860B;
}

.card-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
  color: #292524;
}

.card-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #57534E;
}
```

### Card HTML Example

```html
<div class="card">
  <div class="card-header">
    <div class="card-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 15h6"/>
      </svg>
    </div>
    <div>
      <div class="card-title">Dashboard Redesign</div>
      <div class="card-subtitle">3 variants · Updated 2h ago</div>
    </div>
  </div>
  <p class="card-description">New analytics dashboard with improved data visualization.</p>
  <div class="card-badges">
    <span class="badge badge-success">Validated</span>
  </div>
  <button class="btn-primary w-full">Open</button>
</div>
```

---

## Badge / Status Components

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.25rem;
}

.badge-success {
  background-color: #ECFCCB;
  color: #4D7C0F;
}

.badge-warning {
  background-color: #FEF3C7;
  color: #92400E;
}

.badge-error {
  background-color: #FEE2E2;
  color: #991B1B;
}

.badge-info {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.badge-neutral {
  background-color: #F5F3EE;
  color: #57534E;
}
```

---

## Input Fields

```css
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #292524;
  background-color: #FFFFFF;
  border: 1px solid #D6D3CD;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: #57534E;
}

.input:hover {
  border-color: #B8860B;
}

.input:focus {
  outline: none;
  border-color: #B8860B;
  box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
}

.input:disabled {
  background-color: #F5F3EE;
  color: #57534E;
  cursor: not-allowed;
}

.input-label {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #292524;
  margin-bottom: 0.375rem;
}
```

---

## Navigation Bar

```css
.navbar {
  background-color: #1C1917;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-logo {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: #B8860B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1.125rem;
  font-weight: 400;
  color: #FFFFFF;
}

.navbar-nav {
  display: flex;
  gap: 1rem;
}

.navbar-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #A8A29E;
  text-decoration: none;
  transition: color 0.2s ease;
}

.navbar-link:hover,
.navbar-link.active {
  color: #FFFFFF;
}
```

---

## CSS Variables (Complete Reference)

```css
:root {
  /* Primary Brand */
  --color-primary: #B8860B;
  --color-primary-light: #D4A84B;
  --color-primary-dark: #996F00;
  
  /* Neutrals - Backgrounds */
  --color-bg-primary: #FBF9F4;
  --color-bg-secondary: #F5F3EE;
  --color-bg-dark: #1C1917;
  --color-surface: #FFFFFF;
  
  /* Neutrals - Text */
  --color-text-primary: #292524;
  --color-text-secondary: #57534E;
  
  /* Neutrals - Borders & Grid */
  --color-border: #D6D3CD;
  --color-grid: #E8E4DD;
  
  /* Semantic - Success */
  --color-success: #4D7C0F;
  --color-success-bg: #ECFCCB;
  
  /* Semantic - Warning */
  --color-warning: #92400E;
  --color-warning-bg: #FEF3C7;
  
  /* Semantic - Error */
  --color-error: #991B1B;
  --color-error-bg: #FEE2E2;
  
  /* Semantic - Info */
  --color-info: #1E40AF;
  --color-info-bg: #DBEAFE;
  
  /* Typography */
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Grid */
  --grid-size: 24px;
  --grid-color: #E8E4DD;
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'voxel': {
          'brass': '#B8860B',
          'brass-light': '#D4A84B',
          'brass-dark': '#996F00',
          'parchment': '#FBF9F4',
          'linen': '#F5F3EE',
          'grid': '#E8E4DD',
          'border': '#D6D3CD',
          'walnut': '#57534E',
          'espresso': '#292524',
          'charcoal': '#1C1917',
        },
        'semantic': {
          'success': '#4D7C0F',
          'success-bg': '#ECFCCB',
          'warning': '#92400E',
          'warning-bg': '#FEF3C7',
          'error': '#991B1B',
          'error-bg': '#FEE2E2',
          'info': '#1E40AF',
          'info-bg': '#DBEAFE',
        },
      },
      fontFamily: {
        'display': ['Instrument Serif', 'Georgia', 'serif'],
        'body': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'voxel-grid': `
          linear-gradient(to right, #E8E4DD 1px, transparent 1px),
          linear-gradient(to bottom, #E8E4DD 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-16': '16px 16px',
        'grid-24': '24px 24px',
        'grid-32': '32px 32px',
      },
    },
  },
}
```

### Tailwind Usage Examples

```html
<!-- Page with grid background -->
<div class="min-h-screen bg-voxel-parchment bg-voxel-grid bg-grid-24">

<!-- Primary button -->
<button class="bg-voxel-brass hover:bg-voxel-brass-dark text-white font-medium px-5 py-2.5 rounded-lg">
  Build Prototype
</button>

<!-- Card -->
<div class="bg-white border border-voxel-border rounded-xl p-5 shadow-sm">
  <h3 class="font-display text-xl text-voxel-espresso">Card Title</h3>
  <p class="font-body text-voxel-walnut">Card description</p>
</div>

<!-- Navigation -->
<nav class="bg-voxel-charcoal px-6 py-3">
  <span class="font-display text-white">Voxel</span>
</nav>

<!-- Badge -->
<span class="bg-semantic-success-bg text-semantic-success text-xs font-medium px-2 py-1 rounded">
  Validated
</span>
```

---

## Component Quick Reference

### Full Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voxel App</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #B8860B;
      --color-bg-primary: #FBF9F4;
      --color-bg-dark: #1C1917;
      --color-grid: #E8E4DD;
      --color-border: #D6D3CD;
      --color-text-primary: #292524;
      --color-text-secondary: #57534E;
    }
    
    body {
      font-family: 'DM Sans', sans-serif;
      margin: 0;
      background-color: var(--color-bg-primary);
      background-image:
        linear-gradient(to right, var(--color-grid) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-grid) 1px, transparent 1px);
      background-size: 24px 24px;
      min-height: 100vh;
    }
    
    h1, h2, h3 {
      font-family: 'Instrument Serif', Georgia, serif;
      font-weight: 400;
      color: var(--color-text-primary);
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav style="background-color: var(--color-bg-dark); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <div style="width: 2rem; height: 2rem; border-radius: 0.5rem; background-color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
        <!-- Logo icon -->
      </div>
      <span style="font-family: 'Instrument Serif', serif; color: white;">Voxel</span>
    </div>
    <button style="background-color: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
      New Prototype
    </button>
  </nav>
  
  <!-- Main Content -->
  <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
    <h1>Prototypes</h1>
    <!-- Content here -->
  </main>
</body>
</html>
```

---

## Do's and Don'ts

### Do ✓
- Use the mathematical grid background on main content areas
- Apply Instrument Serif for headers and titles
- Use Aged Brass (#B8860B) for primary actions only
- Maintain warm neutrals throughout
- Keep cards on white with warm border color
- Use olive green for success states (fits the warm palette)

### Don't ✗
- Don't use pure black (#000000) — use Espresso or Charcoal
- Don't use cool grays — stick to warm stone tones
- Don't overuse the brass/gold color — reserve for CTAs
- Don't mix serif and sans-serif randomly — follow the hierarchy
- Don't use the grid pattern inside cards or modals
- Don't use bright/saturated colors that clash with the warm palette

---

*Voxel Design System v1.0 — Craftsman Edition*
