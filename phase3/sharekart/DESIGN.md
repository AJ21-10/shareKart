---
name: Sharekart
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  price-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  price-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2: 0.125rem
  space-4: 0.25rem
  space-6: 0.375rem
  space-8: 0.5rem
  space-12: 0.75rem
  space-16: 1rem
  space-20: 1.25rem
  space-24: 1.5rem
  space-32: 2rem
  space-48: 3rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1rem
  container-max: 1240px
---

## Brand & Style

This design system is engineered specifically for practical, high-utility Indian commerce. It rejects startup tropes such as glassmorphism, floating decorative gradient blobs, and oversized empty whitespace in favor of density, immediate visual reassurance, and explicit utility. 

The aesthetic is grounded, straightforward, and robust—tailored to build immediate trust across diverse cohorts buying, selling, and renting pre-owned and unused goods across Indian tier-1, tier-2, and tier-3 cities.

### Design Principles
- **Direct & Legible Utility:** Every pixel must convey actionable information. Information density is prioritized over decorative whitespace so buyers can scan prices, locations, and condition tags instantly.
- **Trust Through Evidence:** Verification badges (Aadhaar, Phone, Identity), clear security deposit structures, and transparent distance indicators are presented with crisp borders and authoritative contrast.
- **Network- & Device-Resilient Performance:** Flat, solid surface tokens, zero expensive backdrop-filter calculations, and optimized layout boundaries ensure flawless rendering on budget Android devices and variable network environments.

## Colors

The palette uses high-contrast, functional pigments designed for daylight legibility and immediate comprehension.

### Core Roles
- **Primary (`#0F172A` - Deep Navy):** Represents stability and authority. Used for high-emphasis text, primary headers, global top navigation, utility bars, main transaction CTAs (e.g., "Buy Now", "Post Free Ad"), and structural footers.
- **Secondary (`#059669` - Trust Green):** Directly represents monetary transaction safety, verified identity (Aadhaar Verified), rental availability badges, and positive completion states. Used for the dedicated "Rent Now" action to separate renting from buying.
- **Tertiary (`#F59E0B` - Amber Gold):** Reserved for attention, assurance signals, security deposit terms, star ratings, deal highlights, and intermediate statuses.
- **Neutral (`#64748B` - Slate):** Anchors secondary data such as kilometer distances, timestamps, and seller tenure.
- **Base Surfaces & Outlines:** Canvas base is `#F8FAFC`, card backgrounds are crisp `#FFFFFF`, and structural boundaries use a dependable `#E2E8F0` border.

## Typography

Inter serves across all type roles to provide neutral, systematic legibility across various screen resolutions.

### Typography Guidelines
- **Strict Floor at 13px:** To avoid illegibility on small mobile displays, no body copy or metadata is set below 13px (`body-sm`). The only exception is the `badge` role (12px bold uppercase/title case) confined to small verification tags.
- **Indian Rupee (₹) Presentation:** Currency figures always inherit tabular figures (`tnum`) and heavy weights (`fontWeight: 700`). Rental prices must always pair with clear periodic denominators (e.g., `₹450 / day` or `₹2,200 / mo`).
- **Hierarchy Anchoring:** Headlines use tight letter-spacing to prevent visual leakage in dense listing grids.

## Layout & Spacing

Layout follows an 8pt base grid with selective 4pt sub-steps for dense metadata rows (such as chips, distance tags, and condition indicators).

### Breakpoints & Responsive Grids
- **Mobile (< 640px):** 4-column fluid layout with `gutter-mobile` (12px) and 12px outer page padding. Product listing grids display in either a compact 2-column card format or full-width stacked list view for search results.
- **Tablet (640px - 1023px):** 8-column layout with 16px gutters and 24px margins. Product feeds flow into 3 columns.
- **Desktop (≥ 1024px):** 12-column layout conforming to `container-max: 1240px` with 16px gutters and auto-centered side margins. Marketplace browsing displays 4 product cards per row, with a persistent 280px left-hand facet filter drawer.

## Elevation & Depth

Visual hierarchy is maintained through crisp container borders and low-spread, neutral elevation rather than diffused ambient shadows.

- **Level 0 (Flat/Base):** `background-color: #F8FAFC`, no shadow, borders where required using `#E2E8F0`. Used for app canvas and unselected states.
- **Level 1 (Cards & Inputs):** `background-color: #FFFFFF`, border: `1px solid #E2E8F0`, shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.06)`. This keeps individual marketplace tiles distinct against the `#F8FAFC` canvas.
- **Level 2 (Hovered Cards & Popovers):** Border: `1px solid #CBD5E1`, shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Location Drawers, Sticky Bottom Action Bars):** Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.08)`.

## Shapes

The roundedness tier is set to **1 (Soft)**. Elements use structured, disciplined corner radiuses to reinforce a functional, dependable look.

- Base input fields, buttons, and product cards use `0.375rem` (6px) or `0.25rem` (4px).
- Badges and micro-tags (e.g., "Used - Like New", "Aadhaar Verified") use `0.25rem` (4px) or pill shapes when representing dynamic filters.
- Image containers inside product cards clip strictly at `0.375rem` (6px) on top corners to stay flush with the card boundary.

## Components

### 1. Navigation & Unified Search Header
- **Top Utility Bar:** High-contrast `#0F172A` background containing the primary wordmark, city/micro-market selector ("📍 Gandhinagar, Sector 7"), a category browse trigger, and a prominent "Post Free Ad" button.
- **Search Bar with Integrated Location Picker:** A combined input with an elevation level of 1.
  - Left Segment: City/Radius dropdown with clear pin icon and chevron.
  - Divider: `1px solid #E2E8F0` vertical separator.
  - Right Segment: Autocomplete search input ("Find smartphones, bikes, furniture...") with a right-aligned `#0F172A` search button.

### 2. Product Marketplace Card
- **Structure:** Solid `#FFFFFF` surface with `1px solid #E2E8F0` border and Level 1 elevation.
- **Media Canvas:** 4:3 ratio image with a top-left chip: `Rent` (Green `#059669` fill, white text) or `Sale` (Navy `#0F172A` fill, white text). Top-right heart button with subtle border for wishlist.
- **Pricing Row:** Highlighted via `price-md` in `#0F172A`. Rent listings display the base period (`₹499 / day` or `₹1,800 / mo`), with security deposit notes (`Deposit: ₹2,000`) styled in `body-sm` neutral.
- **Product Title & Specs:** 2-line clamped title in `body-md` bold, followed by a condition tag (e.g., `Used - Excellent`, styled as `#F1F5F9` background with `#334155` text).
- **Location & Distance Indicator:** Single-line metadata string: `📍 Sector 21 · 2.8 km away` set in `#64748B` (`body-sm`).
- **Footer Strip:** Left-aligned seller tag featuring an Aadhaar Verified badge (`#ECFDF5` background, `#059669` icon and text) and post age (`2 days ago`).

### 3. Action Buttons
- **Primary CTA ("Buy Now" / "Post Ad"):** Solid `#0F172A` background, `#FFFFFF` text, `0.375rem` radius, bold label. Hover state darkens to `#020617`.
- **Secondary CTA ("Rent Now"):** Solid `#059669` background, `#FFFFFF` text, high-contrast visual cue distinguishing rental workflows from direct purchases.
- **Tertiary / Outlined ("Chat with Seller" / "Call"):** `#FFFFFF` surface, `1.5px solid #0F172A`, text in `#0F172A`.

### 4. Verification & Trust Badges
- **Aadhaar Verified:** Inline chip with an ID check icon, `#ECFDF5` background, `1px solid #A7F3D0` border, and `#065F46` label.
- **Payment & Escrow Security Seal:** Formatted container highlighting Razorpay/UPI Escrow protection with an amber shield (`#F59E0B`), ensuring the user knows their deposit is protected until physical inspection.

### 5. Form Controls & Filter Chips
- **Inputs:** Crisp `#FFFFFF` background, `1px solid #CBD5E1` resting border, shifting to `2px solid #0F172A` on focus. Helper text remains strictly at 13px minimum.
- **Filter Chips (Quick Refinements):** `#FFFFFF` surface with `1px solid #E2E8F0` border. Active state shifts to `#0F172A` background with `#FFFFFF` text.