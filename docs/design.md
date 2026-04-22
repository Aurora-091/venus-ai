# VoiceOS Design System

## Brand
**VoiceOS** — AI voice agent platform for businesses. Premium B2B SaaS. Serious, fast, data-dense.

## Color Palette
- Background: `#080C14` (near black, deep navy)
- Surface: `#0F1623` (card/panel bg)
- Surface elevated: `#161E2E` (modals, dropdowns)
- Border: `#1E2A3E` (subtle borders)
- Border bright: `#2A3A54` (active borders)
- Primary: `#3B82F6` (blue — actions, links)
- Primary dark: `#2563EB`
- Accent: `#6366F1` (indigo — secondary actions)
- Success/Live: `#10B981` (emerald — live indicators, bookings)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)
- Text primary: `#F1F5F9`
- Text secondary: `#94A3B8`
- Text muted: `#475569`

## Typography
- Display/headings: `'Instrument Serif'` — from Google Fonts, editorial feel
- Body/UI: `'DM Sans'` — clean, readable, modern
- Mono/data: `'JetBrains Mono'` — code, IDs, phone numbers
- Scale: 11px muted labels → 13px body → 15px ui → 20px subheading → 32px heading → 56px hero

## Spacing
- Tight data density in dashboard (compact rows, 8px gaps)
- Generous whitespace on landing/marketing pages
- Card padding: 20px desktop, 16px mobile

## Layout
- Sidebar nav (240px) + main content area on dashboard
- Full-width landing page with asymmetric sections
- Grid-breaking hero layout
- Max content width: 1280px

## Component Style
- Cards: `bg-[#0F1623]` border `border-[#1E2A3E]` rounded-xl
- Buttons: solid primary = `bg-blue-600 hover:bg-blue-500`, ghost = transparent with border
- Inputs: `bg-[#080C14] border-[#1E2A3E]` focus ring blue
- Badges: subtle bg tint + matching text color
- Live indicator: pulsing emerald dot

## Dashboard Layout
- Left sidebar: logo + nav items + tenant switcher at bottom
- Top bar: breadcrumb + tenant name + user menu
- Main area: stats row → content

## Motion
- Page load: staggered fade-up (0ms, 80ms, 160ms delays)
- Sidebar transitions: 200ms ease
- Live indicators: pulse animation on emerald dots
- No janky bounces, no overengineered transitions

## Anti-patterns to Avoid
- NO purple gradients
- NO Inter/Roboto/Space Grotesk
- NO generic rounded card grids with shadows everywhere
- NO light mode default
- NO colorful confetti dashboards
