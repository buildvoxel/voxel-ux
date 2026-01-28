# Voxel Design System — Modern Gradient Edition

> "Dynamic precision" — A bold, ultra-modern design language that commands attention.

---

## Design Philosophy

Voxel's visual identity embraces the energy of modern product development. Fluid gradient meshes, vibrant color interactions, and confident typography create a sense of forward momentum. This is the aesthetic of the future: bold without being chaotic, precise without being sterile.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Bold** | Vibrant gradients and strong color choices that command attention. |
| **Dynamic** | Fluid color transitions that suggest motion and progress. |
| **Modern** | Cutting-edge aesthetic that positions Voxel as a forward-thinking platform. |
| **Precise** | Despite the boldness, every element is intentionally placed. |

---

## Color Palette

### Primary Brand Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Vivid Teal** | `#0D9488` | 13, 148, 136 | `--color-primary` | Primary CTAs, key actions |
| Bright Teal | `#14B8A6` | 20, 184, 166 | `--color-primary-light` | Hover states, gradients |
| Cyan Glow | `#2DD4BF` | 45, 212, 191 | `--color-primary-bright` | Highlights, accents |
| Deep Teal | `#0F766E` | 15, 118, 110 | `--color-primary-dark` | Active/pressed states |

### Secondary Brand Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Electric Violet** | `#7C3AED` | 124, 58, 237 | `--color-secondary` | Secondary actions, accents |
| Bright Violet | `#8B5CF6` | 139, 92, 246 | `--color-secondary-light` | Hover, gradients |
| Soft Violet | `#A78BFA` | 167, 139, 250 | `--color-secondary-bright` | Highlights |
| Deep Violet | `#6D28D9` | 109, 40, 217 | `--color-secondary-dark` | Active/pressed states |

### Accent Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Sky Blue** | `#0EA5E9` | 14, 165, 233 | `--color-accent` | Tertiary accents, info |
| Light Sky | `#38BDF8` | 56, 189, 248 | `--color-accent-light` | Gradients, highlights |
| Bright Cyan | `#22D3EE` | 34, 211, 238 | `--color-accent-bright` | Special highlights |
| Deep Sky | `#0284C7` | 2, 132, 199 | `--color-accent-dark` | Pressed states |

### Neutral Palette

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Void** | `#030712` | 3, 7, 18 | `--color-bg-dark` | Dark mode, nav bar |
| Deep Space | `#0F172A` | 15, 23, 42 | `--color-text-primary` | Primary text |
| Slate 800 | `#1E293B` | 30, 41, 59 | `--color-surface-dark` | Dark cards |
| Slate 700 | `#334155` | 51, 65, 85 | `--color-text-secondary` | Secondary text |
| Slate 500 | `#64748B` | 100, 116, 139 | `--color-text-tertiary` | Tertiary text |
| Slate 300 | `#CBD5E1` | 203, 213, 225 | `--color-border` | Borders |
| Slate 100 | `#F1F5F9` | 241, 245, 249 | `--color-bg-secondary` | Secondary background |
| Snow | `#FAFBFC` | 250, 251, 252 | `--color-bg-primary` | Primary background |
| White | `#FFFFFF` | 255, 255, 255 | `--color-surface` | Cards, panels |

### Semantic Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Emerald | `#059669` | 5, 150, 105 | `--color-success` | Success states |
| Emerald Light | `#D1FAE5` | 209, 250, 229 | `--color-success-bg` | Success backgrounds |
| Amber | `#D97706` | 217, 119, 6 | `--color-warning` | Warning states |
| Amber Light | `#FEF3C7` | 254, 243, 199 | `--color-warning-bg` | Warning backgrounds |
| Rose | `#E11D48` | 225, 29, 72 | `--color-error` | Error states |
| Rose Light | `#FFE4E6` | 255, 228, 230 | `--color-error-bg` | Error backgrounds |

---

## Gradient System

The heart of the Modern Gradient identity. Use these gradients boldly.

### Primary Gradients

```css
/* Hero Gradient - Main brand gradient */
.gradient-hero {
  background: linear-gradient(135deg, #0D9488 0%, #7C3AED 50%, #0EA5E9 100%);
}

/* Teal to Violet - Most common */
.gradient-teal-violet {
  background: linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%);
}

/* Teal to Sky - Fresh, energetic */
.gradient-teal-sky {
  background: linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%);
}

/* Violet to Sky - Cool, sophisticated */
.gradient-violet-sky {
  background: linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%);
}

/* Full Spectrum - Maximum impact */
.gradient-spectrum {
  background: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 25%, #7C3AED 50%, #8B5CF6 75%, #38BDF8 100%);
}
```

### Gradient Mesh Backgrounds

```css
/* Subtle mesh for page backgrounds */
.gradient-mesh-subtle {
  background-color: #FAFBFC;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.12), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.10), transparent);
}

/* Medium mesh - More presence */
.gradient-mesh-medium {
  background-color: #FAFBFC;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.25), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.20), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.18), transparent);
}

/* Bold mesh - Maximum impact */
.gradient-mesh-bold {
  background-color: #FAFBFC;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.35), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.30), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.25), transparent);
}

/* Dark mode mesh */
.gradient-mesh-dark {
  background-color: #030712;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.20), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.18), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.15), transparent);
}
```

### Animated Gradient (Optional)

```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-animated {
  background: linear-gradient(135deg, #14B8A6, #7C3AED, #0EA5E9, #14B8A6);
  background-size: 300% 300%;
  animation: gradient-shift 8s ease infinite;
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-spectrum {
  background: linear-gradient(135deg, #2DD4BF 0%, #7C3AED 50%, #38BDF8 100%);
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
font-family: 'Cabinet Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body / UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace / Code */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Font Installation

**Cabinet Grotesk** (from Fontshare - free):
```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">
```

**Inter** (from Google Fonts):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Combined:**
```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| Display | Cabinet Grotesk | 48px / 3rem | 700 | 1.1 | -0.03em |
| H1 | Cabinet Grotesk | 36px / 2.25rem | 700 | 1.15 | -0.02em |
| H2 | Cabinet Grotesk | 30px / 1.875rem | 700 | 1.2 | -0.02em |
| H3 | Cabinet Grotesk | 24px / 1.5rem | 600 | 1.25 | -0.01em |
| H4 | Cabinet Grotesk | 20px / 1.25rem | 600 | 1.3 | -0.01em |
| H5 | Inter | 16px / 1rem | 600 | 1.4 | 0 |
| Body Large | Inter | 18px / 1.125rem | 400 | 1.6 | 0 |
| Body | Inter | 16px / 1rem | 400 | 1.5 | 0 |
| Body Small | Inter | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | Inter | 12px / 0.75rem | 500 | 1.4 | 0.01em |
| Overline | Inter | 11px / 0.6875rem | 600 | 1.4 | 0.08em |

### Typography CSS

```css
.display {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #0F172A;
}

h1, .h1 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #0F172A;
}

h2, .h2 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #0F172A;
}

h3, .h3 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #0F172A;
}

body, .body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #0F172A;
}

.text-secondary {
  color: #64748B;
}

.overline {
  font-family: 'Inter', sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748B;
}
```

---

## Button Hierarchy

### Primary Button (Gradient)
Main CTAs with bold gradient treatment.

```css
.btn-primary {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}
```

**Tailwind:**
```html
<button class="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5">
  Primary Action
</button>
```

### Secondary Button (Gradient)
Supporting actions with violet gradient.

```css
.btn-secondary {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
  transform: translateY(-1px);
}
```

**Tailwind:**
```html
<button class="bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
  Secondary Action
</button>
```

### Tertiary Button (Outline with Gradient Border)
```css
.btn-tertiary {
  position: relative;
  background: #FFFFFF;
  color: #0F172A;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  background-clip: padding-box;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tertiary::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: -2px;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, #14B8A6, #7C3AED);
  z-index: -1;
}

.btn-tertiary:hover {
  background: #F1F5F9;
}
```

**Simplified Tailwind (solid border):**
```html
<button class="bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm px-6 py-3 rounded-lg border-2 border-slate-200 hover:border-teal-500 transition-all">
  Tertiary Action
</button>
```

### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #14B8A6;
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
  background: rgba(20, 184, 166, 0.1);
  color: #0D9488;
}
```

**Tailwind:**
```html
<button class="text-teal-500 hover:text-teal-600 hover:bg-teal-500/10 font-semibold text-sm px-6 py-3 rounded-lg transition-all">
  Ghost Action
</button>
```

### Destructive Button
```css
.btn-destructive {
  background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
}

.btn-destructive:hover {
  box-shadow: 0 4px 16px rgba(225, 29, 72, 0.4);
  transform: translateY(-1px);
}
```

---

## Icon Guidelines

### Icon Colors by Context

| Context | Color | Hex | Usage |
|---------|-------|-----|-------|
| Default | Slate 500 | `#64748B` | Navigation, labels |
| Emphasis | Slate 900 | `#0F172A` | Active states, key info |
| Teal | Vivid Teal | `#0D9488` | Primary interactive |
| Violet | Electric Violet | `#7C3AED` | Secondary interactive |
| Sky | Sky Blue | `#0EA5E9` | Tertiary/info |
| On Dark | White | `#FFFFFF` | Icons on dark backgrounds |
| On Gradient | White | `#FFFFFF` | Icons on gradient backgrounds |

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
| 0 | Void | `#030712` | Dark overlays, modals backdrop |
| 1 | Snow + Mesh | `#FAFBFC` + gradient mesh | Main page background |
| 2 | White | `#FFFFFF` | Cards, panels, modals |
| 3 | Slate 100 | `#F1F5F9` | Inset elements, inputs |

### Dark Mode Backgrounds

| Level | Name | Value | Usage |
|-------|------|-------|-------|
| 0 | Void | `#030712` | Page background |
| 1 | Void + Mesh | `#030712` + gradient mesh | Main page background |
| 2 | Slate 800 | `#1E293B` | Cards, panels |
| 3 | Slate 700 | `#334155` | Inset elements |

---

## Card Component

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-gradient-border {
  position: relative;
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
}

.card-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #14B8A6, #7C3AED);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
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
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.card-icon svg {
  stroke: #FFFFFF;
}

.card-title {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0F172A;
}

.card-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #64748B;
}
```

### Card with Gradient Top Border

```css
.card-accent {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  overflow: hidden;
}

.card-accent::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #14B8A6 0%, #7C3AED 50%, #0EA5E9 100%);
}

.card-accent-content {
  padding: 1.5rem;
}
```

---

## Badge / Status Components

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.badge-success {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
  color: #059669;
  border: 1px solid rgba(5, 150, 105, 0.3);
}

.badge-warning {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
  color: #D97706;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.badge-error {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%);
  color: #E11D48;
  border: 1px solid rgba(225, 29, 72, 0.3);
}

.badge-info {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%);
  color: #0EA5E9;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.badge-teal {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(45, 212, 191, 0.15) 100%);
  color: #0D9488;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.badge-violet {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  color: #7C3AED;
  border: 1px solid rgba(124, 58, 237, 0.3);
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
  color: #0F172A;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: #94A3B8;
}

.input:hover {
  border-color: #CBD5E1;
}

.input:focus {
  outline: none;
  border-color: #14B8A6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.15);
}

.input-gradient-focus:focus {
  border-image: linear-gradient(135deg, #14B8A6, #7C3AED) 1;
}

.input-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 0.5rem;
}
```

---

## Navigation Bar

```css
.navbar {
  background: #030712;
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
  background: linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(20, 184, 166, 0.3);
}

.navbar-title {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
}

.navbar-nav {
  display: flex;
  gap: 0.5rem;
}

.navbar-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #94A3B8;
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
  background: rgba(20, 184, 166, 0.2);
}
```

---

## CSS Variables (Complete Reference)

```css
:root {
  /* Primary - Teal */
  --color-primary: #0D9488;
  --color-primary-light: #14B8A6;
  --color-primary-bright: #2DD4BF;
  --color-primary-dark: #0F766E;
  
  /* Secondary - Violet */
  --color-secondary: #7C3AED;
  --color-secondary-light: #8B5CF6;
  --color-secondary-bright: #A78BFA;
  --color-secondary-dark: #6D28D9;
  
  /* Accent - Sky Blue */
  --color-accent: #0EA5E9;
  --color-accent-light: #38BDF8;
  --color-accent-bright: #22D3EE;
  --color-accent-dark: #0284C7;
  
  /* Neutrals */
  --color-void: #030712;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;
  --color-bg-primary: #FAFBFC;
  --color-bg-secondary: #F1F5F9;
  --color-surface: #FFFFFF;
  --color-surface-dark: #1E293B;
  
  /* Semantic */
  --color-success: #059669;
  --color-success-bg: #D1FAE5;
  --color-warning: #D97706;
  --color-warning-bg: #FEF3C7;
  --color-error: #E11D48;
  --color-error-bg: #FFE4E6;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%);
  --gradient-teal: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  --gradient-violet: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  --gradient-spectrum: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 25%, #7C3AED 50%, #8B5CF6 75%, #38BDF8 100%);
  
  /* Typography */
  --font-display: 'Cabinet Grotesk', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
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
  --shadow-glow-teal: 0 4px 16px rgba(13, 148, 136, 0.4);
  --shadow-glow-violet: 0 4px 16px rgba(124, 58, 237, 0.4);
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
          'teal': {
            DEFAULT: '#0D9488',
            light: '#14B8A6',
            bright: '#2DD4BF',
            dark: '#0F766E',
          },
          'violet': {
            DEFAULT: '#7C3AED',
            light: '#8B5CF6',
            bright: '#A78BFA',
            dark: '#6D28D9',
          },
          'sky': {
            DEFAULT: '#0EA5E9',
            light: '#38BDF8',
            bright: '#22D3EE',
            dark: '#0284C7',
          },
          'void': '#030712',
          'snow': '#FAFBFC',
        },
      },
      fontFamily: {
        'display': ['Cabinet Grotesk', '-apple-system', 'sans-serif'],
        'body': ['Inter', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%)',
        'gradient-teal': 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        'gradient-violet': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'gradient-spectrum': 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 25%, #7C3AED 50%, #8B5CF6 75%, #38BDF8 100%)',
        'mesh-subtle': `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.12), transparent),
          radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.10), transparent)
        `,
        'mesh-bold': `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.35), transparent),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.30), transparent),
          radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.25), transparent)
        `,
      },
      boxShadow: {
        'glow-teal': '0 4px 16px rgba(13, 148, 136, 0.4)',
        'glow-violet': '0 4px 16px rgba(124, 58, 237, 0.4)',
        'glow-sky': '0 4px 16px rgba(14, 165, 233, 0.4)',
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
<button class="bg-gradient-to-br from-voxel-teal-light to-voxel-teal text-white font-semibold px-6 py-3 rounded-lg shadow-glow-teal hover:shadow-xl transition-all hover:-translate-y-0.5">
  Build Prototype
</button>

<!-- Card with gradient top border -->
<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
  <div class="h-1 bg-gradient-spectrum"></div>
  <div class="p-6">
    <h3 class="font-display text-xl font-semibold text-slate-900">Card Title</h3>
  </div>
</div>

<!-- Gradient text -->
<h1 class="font-display text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
  Build with certainty
</h1>

<!-- Navigation -->
<nav class="bg-voxel-void px-6 py-3.5 border-b border-white/10">
  <div class="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-teal">
    <!-- Icon -->
  </div>
</nav>

<!-- Badge -->
<span class="bg-gradient-to-r from-teal-500/15 to-teal-400/15 text-voxel-teal text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30">
  Validated
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
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --gradient-primary: linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%);
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #FAFBFC;
      background-image:
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.12), transparent),
        radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.10), transparent);
      min-height: 100vh;
      color: #0F172A;
    }
    
    h1, h2, h3, h4 {
      font-family: 'Cabinet Grotesk', sans-serif;
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav style="background: #030712; padding: 0.875rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; background: linear-gradient(135deg, #14B8A6, #7C3AED); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(20,184,166,0.3);">
        <!-- Logo icon -->
      </div>
      <span style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 1.25rem; font-weight: 700; color: white;">Voxel</span>
    </div>
    <button style="background: linear-gradient(135deg, #14B8A6, #0D9488); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(13,148,136,0.3);">
      New Prototype
    </button>
  </nav>
  
  <!-- Main Content -->
  <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
    <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem;">Prototypes</h1>
    <p style="color: #64748B; margin-bottom: 2rem;">3 active prototypes in this workspace</p>
    <!-- Content here -->
  </main>
</body>
</html>
```

---

## Do's and Don'ts

### Do ✓
- Use bold gradients on primary CTAs and key elements
- Apply the gradient mesh background on main pages
- Use Cabinet Grotesk for impactful headlines
- Add subtle glow shadows to interactive elements
- Use the three-color system (teal, violet, sky) intentionally
- Create visual hierarchy with gradient intensity
- Use dark mode (void) for navigation and contrast

### Don't ✗
- Don't use gradients on everything — reserve for emphasis
- Don't mix warm and cool tones outside the palette
- Don't use gray text on gradient backgrounds
- Don't apply animations to every element
- Don't forget to add sufficient contrast for accessibility
- Don't use multiple gradient directions in the same view
- Don't make buttons compete — one primary per section

---

## Gradient Accessibility

When using gradients with text, ensure sufficient contrast:

| Background | Minimum Text Color |
|------------|-------------------|
| Gradient buttons | White (#FFFFFF) |
| Gradient mesh (light) | Slate 900 (#0F172A) |
| Gradient mesh (dark) | White (#FFFFFF) |
| Gradient text | Not for body copy — display only |

---

*Voxel Design System v1.0 — Modern Gradient Edition*
