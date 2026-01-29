# Voxel Design System — Electric Indigo & Mint Edition

> "Technical but approachable" — A modern, innovative design language that balances sophistication with freshness.

---

## Design Philosophy

Voxel's visual identity combines the authority of deep indigo with the fresh optimism of mint. This pairing creates a fintech-inspired aesthetic that feels both trustworthy and forward-thinking. The result is a platform that professionals take seriously while finding genuinely enjoyable to use.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Innovative** | Fresh color combinations that signal forward-thinking technology. |
| **Balanced** | Two distinct colors create visual variety without chaos. |
| **Approachable** | Mint accents soften the technical authority of indigo. |
| **Polished** | Refined gradients and subtle shadows create a premium feel. |

---

## Color Palette

### Primary Brand Colors — Indigo

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Indigo Light | `#6366F1` | 99, 102, 241 | `--color-primary-light` | Hover states, gradients |
| **Electric Indigo** | `#4F46E5` | 79, 70, 229 | `--color-primary` | Primary CTAs, key actions |
| Indigo Dark | `#3730A3` | 55, 48, 163 | `--color-primary-dark` | Active/pressed states |
| Deep Indigo | `#1E1B4B` | 30, 27, 75 | `--color-primary-deep` | Dark backgrounds, nav |

### Accent Colors — Mint

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Mint Light | `#6EE7B7` | 110, 231, 183 | `--color-accent-light` | Highlights, gradients |
| **Fresh Mint** | `#34D399` | 52, 211, 153 | `--color-accent` | Accent CTAs, success states |
| Mint Medium | `#10B981` | 16, 185, 129 | `--color-accent-medium` | Hover states |
| Mint Dark | `#059669` | 5, 150, 105 | `--color-accent-dark` | Active/pressed, text |

### Neutral Palette

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Deep Indigo** | `#1E1B4B` | 30, 27, 75 | `--color-bg-dark` | Navigation, dark mode |
| Indigo 900 | `#312E81` | 49, 46, 129 | `--color-surface-dark` | Dark cards |
| Gray 700 | `#374151` | 55, 65, 81 | `--color-text-secondary` | Secondary text |
| Gray 500 | `#6B7280` | 107, 114, 128 | `--color-text-tertiary` | Tertiary text, placeholders |
| Gray 300 | `#D1D5DB` | 209, 213, 219 | `--color-border` | Borders, dividers |
| Gray 100 | `#F3F4F6` | 243, 244, 246 | `--color-bg-secondary` | Secondary backgrounds |
| **Snow** | `#FAFBFF` | 250, 251, 255 | `--color-bg-primary` | Primary background |
| White | `#FFFFFF` | 255, 255, 255 | `--color-surface` | Cards, panels, modals |

### Semantic Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Success | `#059669` | 5, 150, 105 | `--color-success` | Success states (uses Mint Dark) |
| Success Background | `#D1FAE5` | 209, 250, 229 | `--color-success-bg` | Success badges |
| Warning | `#D97706` | 217, 119, 6 | `--color-warning` | Warning states |
| Warning Background | `#FEF3C7` | 254, 243, 199 | `--color-warning-bg` | Warning badges |
| Error | `#DC2626` | 220, 38, 38 | `--color-error` | Error states |
| Error Background | `#FEE2E2` | 254, 226, 226 | `--color-error-bg` | Error badges |
| Info | `#4F46E5` | 79, 70, 229 | `--color-info` | Info states (uses Primary) |
| Info Background | `#EEF2FF` | 238, 242, 255 | `--color-info-bg` | Info badges |

---

## Gradient System

### Primary Gradients

```css
/* Indigo to Mint - Hero gradient, main brand */
.gradient-primary {
  background: linear-gradient(135deg, #4F46E5 0%, #34D399 100%);
}

/* Indigo only - Buttons, UI elements */
.gradient-indigo {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
}

/* Mint only - Accent buttons, highlights */
.gradient-mint {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

/* Reverse - Mint to Indigo */
.gradient-reverse {
  background: linear-gradient(135deg, #34D399 0%, #4F46E5 100%);
}

/* Subtle - Lighter version for backgrounds */
.gradient-subtle {
  background: linear-gradient(135deg, #6366F1 0%, #6EE7B7 100%);
}
```

### Gradient Mesh Backgrounds

```css
/* Subtle mesh - Default page background */
.gradient-mesh-subtle {
  background-color: #FAFBFF;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.10), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.08), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.06), transparent);
}

/* Medium mesh - More presence */
.gradient-mesh-medium {
  background-color: #FAFBFF;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.18), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.15), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.12), transparent);
}

/* Bold mesh - Hero sections, marketing */
.gradient-mesh-bold {
  background-color: #FAFBFF;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.25), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.20), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.15), transparent);
}

/* Dark mode mesh */
.gradient-mesh-dark {
  background-color: #1E1B4B;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99, 102, 241, 0.20), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.15), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(79, 70, 229, 0.12), transparent);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #4F46E5 0%, #34D399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-indigo {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Typography

### Font Stack

```css
/* Display / Headers */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body / UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace / Code */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Font Installation

**Google Fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Or via CSS import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display | 48px / 3rem | 800 | 1.1 | -0.03em |
| H1 | 36px / 2.25rem | 700 | 1.15 | -0.02em |
| H2 | 30px / 1.875rem | 700 | 1.2 | -0.02em |
| H3 | 24px / 1.5rem | 600 | 1.25 | -0.01em |
| H4 | 20px / 1.25rem | 600 | 1.3 | -0.01em |
| H5 | 16px / 1rem | 600 | 1.4 | 0 |
| Body Large | 18px / 1.125rem | 400 | 1.6 | 0 |
| Body | 16px / 1rem | 400 | 1.5 | 0 |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.01em |
| Overline | 11px / 0.6875rem | 600 | 1.4 | 0.08em |

### Typography CSS

```css
.display {
  font-family: 'Inter', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #1E1B4B;
}

h1, .h1 {
  font-family: 'Inter', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #1E1B4B;
}

h2, .h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #1E1B4B;
}

h3, .h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #1E1B4B;
}

body, .body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #374151;
}

.text-secondary {
  color: #6B7280;
}

.overline {
  font-family: 'Inter', sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6B7280;
}
```

---

## Button Hierarchy

### Primary Button (Indigo Gradient)
Main CTAs, form submissions, key actions.

```css
.btn-primary {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.35);
}

.btn-primary:disabled {
  background: #D1D5DB;
  box-shadow: none;
  cursor: not-allowed;
}
```

**Tailwind:**
```html
<button class="bg-gradient-to-br from-indigo-600 to-indigo-500 hover:shadow-xl text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg shadow-indigo-500/35 transition-all hover:-translate-y-0.5">
  Primary Action
</button>
```

### Accent Button (Mint Gradient)
Secondary important actions, success confirmations.

```css
.btn-accent {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(52, 211, 153, 0.35);
}

.btn-accent:hover {
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.45);
  transform: translateY(-1px);
}
```

**Tailwind:**
```html
<button class="bg-gradient-to-br from-emerald-400 to-emerald-500 hover:shadow-xl text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg shadow-emerald-500/35 transition-all hover:-translate-y-0.5">
  Accent Action
</button>
```

### Secondary Button (Outline)
Supporting actions, cancel, back.

```css
.btn-secondary {
  background: #FFFFFF;
  color: #1E1B4B;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 2px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #4F46E5;
  background: #FAFBFF;
}

.btn-secondary:active {
  background: #EEF2FF;
}
```

**Tailwind:**
```html
<button class="bg-white hover:bg-indigo-50 text-indigo-950 font-semibold text-sm px-6 py-3 rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all">
  Secondary Action
</button>
```

### Ghost Button
Inline actions, links, navigation.

```css
.btn-ghost {
  background: transparent;
  color: #4F46E5;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(79, 70, 229, 0.1);
  color: #3730A3;
}
```

**Tailwind:**
```html
<button class="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10 font-semibold text-sm px-6 py-3 rounded-lg transition-all">
  Ghost Action
</button>
```

### Destructive Button
Delete, remove, dangerous actions.

```css
.btn-destructive {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

.btn-destructive:hover {
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45);
  transform: translateY(-1px);
}
```

---

## Icon Guidelines

### Icon Colors by Context

| Context | Color | Hex | Usage |
|---------|-------|-----|-------|
| Default | Gray 500 | `#6B7280` | Navigation, labels |
| Emphasis | Deep Indigo | `#1E1B4B` | Active states, key info |
| Primary | Electric Indigo | `#4F46E5` | Interactive, clickable |
| Accent | Fresh Mint | `#34D399` | Success, highlights |
| On Dark | White | `#FFFFFF` | Icons on dark backgrounds |
| On Gradient | White | `#FFFFFF` | Icons on gradient backgrounds |
| Muted | Gray 300 | `#D1D5DB` | Disabled, decorative |

### Icon Sizing

| Size | Pixels | Use Case |
|------|--------|----------|
| xs | 14px | Inline with small text |
| sm | 16px | Buttons, inputs |
| md | 20px | Default UI icons |
| lg | 24px | Navigation, cards |
| xl | 32px | Feature highlights |
| 2xl | 40px | Hero sections |

---

## Background System

### Light Mode Backgrounds

| Level | Name | Value | Usage |
|-------|------|-------|-------|
| 0 | Deep Indigo | `#1E1B4B` | Dark overlays, modals backdrop |
| 1 | Snow + Mesh | `#FAFBFF` + gradient mesh | Main page background |
| 2 | White | `#FFFFFF` | Cards, panels, modals |
| 3 | Gray 100 | `#F3F4F6` | Inset elements, inputs |

### Dark Mode Backgrounds

| Level | Name | Value | Usage |
|-------|------|-------|-------|
| 0 | Deep Indigo | `#1E1B4B` | Page background |
| 1 | Deep Indigo + Mesh | `#1E1B4B` + gradient mesh | Main page background |
| 2 | Indigo 900 | `#312E81` | Cards, panels |
| 3 | Indigo 800 | `#3730A3` | Inset elements |

---

## Card Component

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-gradient-bar {
  position: relative;
  overflow: hidden;
}

.card-gradient-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4F46E5 0%, #34D399 100%);
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
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.card-icon svg {
  stroke: #FFFFFF;
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1E1B4B;
}

.card-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #6B7280;
}
```

### Card HTML Example

```html
<div class="card card-gradient-bar">
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
  <p class="text-gray-600 text-sm mb-4">New analytics dashboard with improved data visualization.</p>
  <button class="btn-primary w-full">Open Prototype</button>
</div>
```

---

## Badge / Status Components

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.badge-primary {
  background: rgba(79, 70, 229, 0.15);
  color: #4F46E5;
  border: 1px solid rgba(79, 70, 229, 0.3);
}

.badge-accent {
  background: rgba(52, 211, 153, 0.15);
  color: #059669;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.badge-success {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
  border: 1px solid rgba(5, 150, 105, 0.3);
}

.badge-warning {
  background: rgba(217, 119, 6, 0.15);
  color: #D97706;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.badge-error {
  background: rgba(220, 38, 38, 0.15);
  color: #DC2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.badge-neutral {
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}
```

---

## Input Fields

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #1E1B4B;
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: #9CA3AF;
}

.input:hover {
  border-color: #D1D5DB;
}

.input:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.input:disabled {
  background: #F3F4F6;
  color: #9CA3AF;
  cursor: not-allowed;
}

.input-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1E1B4B;
  margin-bottom: 0.5rem;
}

.input-error {
  border-color: #DC2626;
}

.input-error:focus {
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.input-success {
  border-color: #059669;
}

.input-success:focus {
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
}
```

---

## Navigation Bar

```css
.navbar {
  background: #1E1B4B;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-logo {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #4F46E5 0%, #34D399 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.4);
}

.navbar-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.02em;
}

.navbar-nav {
  display: flex;
  gap: 0.25rem;
}

.navbar-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #A5B4FC;
  text-decoration: none;
  padding: 0.5rem 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.navbar-link:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
}

.navbar-link.active {
  color: #FFFFFF;
  background: rgba(79, 70, 229, 0.3);
}
```

---

## CSS Variables (Complete Reference)

```css
:root {
  /* Primary - Indigo */
  --color-primary: #4F46E5;
  --color-primary-light: #6366F1;
  --color-primary-dark: #3730A3;
  --color-primary-deep: #1E1B4B;
  
  /* Accent - Mint */
  --color-accent: #34D399;
  --color-accent-light: #6EE7B7;
  --color-accent-medium: #10B981;
  --color-accent-dark: #059669;
  
  /* Neutrals */
  --color-text-primary: #1E1B4B;
  --color-text-secondary: #374151;
  --color-text-tertiary: #6B7280;
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;
  --color-bg-primary: #FAFBFF;
  --color-bg-secondary: #F3F4F6;
  --color-bg-dark: #1E1B4B;
  --color-surface: #FFFFFF;
  --color-surface-dark: #312E81;
  
  /* Semantic */
  --color-success: #059669;
  --color-success-bg: #D1FAE5;
  --color-warning: #D97706;
  --color-warning-bg: #FEF3C7;
  --color-error: #DC2626;
  --color-error-bg: #FEE2E2;
  --color-info: #4F46E5;
  --color-info-bg: #EEF2FF;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #4F46E5 0%, #34D399 100%);
  --gradient-indigo: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  --gradient-mint: linear-gradient(135deg, #34D399 0%, #10B981 100%);
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-glow-indigo: 0 4px 14px rgba(79, 70, 229, 0.35);
  --shadow-glow-mint: 0 4px 14px rgba(52, 211, 153, 0.35);
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
          'indigo': {
            DEFAULT: '#4F46E5',
            light: '#6366F1',
            dark: '#3730A3',
            deep: '#1E1B4B',
          },
          'mint': {
            DEFAULT: '#34D399',
            light: '#6EE7B7',
            medium: '#10B981',
            dark: '#059669',
          },
          'snow': '#FAFBFF',
        },
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #34D399 100%)',
        'gradient-indigo': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        'gradient-mint': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
        'mesh-subtle': `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.10), transparent),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.08), transparent),
          radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.06), transparent)
        `,
        'mesh-bold': `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.25), transparent),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.20), transparent),
          radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.15), transparent)
        `,
      },
      boxShadow: {
        'glow-indigo': '0 4px 14px rgba(79, 70, 229, 0.35)',
        'glow-mint': '0 4px 14px rgba(52, 211, 153, 0.35)',
        'glow-indigo-lg': '0 6px 20px rgba(79, 70, 229, 0.45)',
        'glow-mint-lg': '0 6px 20px rgba(52, 211, 153, 0.45)',
      },
    },
  },
}
```

### Tailwind Usage Examples

```html
<!-- Page with gradient mesh background -->
<div class="min-h-screen bg-voxel-snow bg-mesh-subtle">

<!-- Primary gradient button -->
<button class="bg-gradient-indigo text-white font-semibold px-6 py-3 rounded-lg shadow-glow-indigo hover:shadow-glow-indigo-lg transition-all hover:-translate-y-0.5">
  Build Prototype
</button>

<!-- Accent button -->
<button class="bg-gradient-mint text-white font-semibold px-6 py-3 rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg transition-all hover:-translate-y-0.5">
  Validate
</button>

<!-- Card with gradient top bar -->
<div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
  <div class="h-1 bg-gradient-primary"></div>
  <div class="p-6">
    <h3 class="text-lg font-semibold text-voxel-indigo-deep">Card Title</h3>
  </div>
</div>

<!-- Gradient text -->
<h1 class="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
  Build with certainty
</h1>

<!-- Navigation -->
<nav class="bg-voxel-indigo-deep px-6 py-3.5 border-b border-white/10">
  <div class="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-indigo">
    <!-- Icon -->
  </div>
</nav>

<!-- Badge -->
<span class="bg-indigo-500/15 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30">
  In Review
</span>
```

---

## Full Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voxel App</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #4F46E5;
      --color-accent: #34D399;
      --color-bg-dark: #1E1B4B;
      --color-bg-primary: #FAFBFF;
      --color-border: #E5E7EB;
      --color-text-primary: #1E1B4B;
      --color-text-secondary: #6B7280;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: var(--color-bg-primary);
      background-image:
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.12), transparent),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.10), transparent),
        radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.08), transparent);
      min-height: 100vh;
      color: var(--color-text-primary);
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav style="background: var(--color-bg-dark); padding: 0.875rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; background: linear-gradient(135deg, #4F46E5, #34D399); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(79,70,229,0.4);">
        <!-- Logo icon -->
      </div>
      <span style="font-size: 1.25rem; font-weight: 700; color: white; letter-spacing: -0.02em;">Voxel</span>
    </div>
    <button style="background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 10px rgba(79,70,229,0.35);">
      New Prototype
    </button>
  </nav>
  
  <!-- Main Content -->
  <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
    <h1 style="font-size: 2.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem;">Prototypes</h1>
    <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">3 active prototypes in this workspace</p>
    <!-- Content here -->
  </main>
</body>
</html>
```

---

## Do's and Don'ts

### Do ✓
- Use the gradient mesh background on main content areas
- Apply indigo for primary actions, mint for accent/success
- Use gradient buttons with glow shadows for CTAs
- Maintain the indigo→mint gradient direction (135deg)
- Keep cards on white with subtle borders
- Use pill badges with semi-transparent backgrounds

### Don't ✗
- Don't use pure black (#000000) — use Deep Indigo
- Don't overuse mint — reserve for accents and success states
- Don't mix multiple gradient directions in one view
- Don't apply gradients to body text (display/headers only)
- Don't use the mesh pattern inside cards or modals
- Don't forget the glow shadow on gradient buttons

---

## Accessibility Notes

| Element | Contrast Ratio | WCAG Level |
|---------|---------------|------------|
| Indigo on White | 4.7:1 | AA |
| Deep Indigo on White | 12.6:1 | AAA |
| White on Indigo | 4.7:1 | AA |
| Mint Dark on White | 3.9:1 | AA (large text) |
| White on Mint | 2.4:1 | Use only for large text/icons |

**Recommendation:** For body text, prefer Deep Indigo (#1E1B4B) or Gray 700 (#374151) to ensure AAA compliance. Use Electric Indigo (#4F46E5) for interactive elements and headings.

---

*Voxel Design System v1.0 — Electric Indigo & Mint Edition*
