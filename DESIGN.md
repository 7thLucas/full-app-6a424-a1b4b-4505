# Design Guidelines — B2B Portal & RFQ Engine

## Brand Identity
Enterprise-grade international trade platform. Visual language: authoritative, precise, minimal ornamentation. Inspired by Bloomberg Terminal, Stripe Dashboard, and SAP Fiori — data-dense but clean.

## Color Palette

### Primary: Dark Navy
- Primary: `#0F172A` (Slate 900 — primary actions, key UI chrome)
- Primary Foreground: `#F8FAFC` (near-white text on primary)

### Accent: Gold / Amber
- Accent: `#D97706` (Amber 600 — CTAs, status highlights, active states)
- Accent Foreground: `#FFFFFF`

### Backgrounds
- Background: `#0F172A` (dark navy base)
- Card: `#1E293B` (Slate 800 — cards, panels)
- Popover: `#1E293B`

### Foregrounds
- Foreground: `#F1F5F9` (Slate 100 — primary text)
- Card Foreground: `#F1F5F9`
- Popover Foreground: `#F1F5F9`

### Supporting
- Secondary: `#1E293B` (Slate 800)
- Secondary Foreground: `#94A3B8` (Slate 400)
- Muted: `#1E293B`
- Muted Foreground: `#64748B` (Slate 500)
- Border: `#334155` (Slate 700)
- Input: `#334155`
- Ring: `#D97706`

### Destructive
- Destructive: `#DC2626` (Red 600)
- Destructive Foreground: `#FFFFFF`

### Navigation
- Navbar Background: `#0F172A`
- Sidebar Background: `#0C1525` (slightly deeper navy)
- Sidebar Foreground: `#94A3B8`
- Sidebar Primary: `#D97706`
- Sidebar Primary Foreground: `#FFFFFF`
- Sidebar Accent: `#1E293B`
- Sidebar Accent Foreground: `#F1F5F9`
- Sidebar Border: `#1E293B`
- Sidebar Ring: `#D97706`

### Charts
- Chart 1: `#D97706` (gold)
- Chart 2: `#3B82F6` (blue)
- Chart 3: `#10B981` (green)
- Chart 4: `#8B5CF6` (violet)
- Chart 5: `#F59E0B` (amber)

## Typography
- Heading Font: Inter (weight 600–700 for headings, all-caps labels for data fields)
- Body Font: Inter (weight 400–500, tight line-height for data-dense tables)
- Monospace: system-mono for order numbers, SKUs, amounts

## Component Style
- Borders: 1px solid `border` color, subtle — no thick decorative borders
- Border Radius: `rounded-md` (8px) default, `rounded-sm` for dense table cells
- Elevation: Dark cards on dark background — differentiate via border and subtle inner shadow, not drop shadows
- Badges: Pill-shaped, color-coded by RFQ state (e.g., DRAFT=slate, QUOTED=blue, ACCEPTED=green, SHIPPED=amber, COMPLETED=emerald)
- Tables: Compact, monospace amounts, sticky headers, row hover with slight card-bg lightening

## Layout
- Sidebar nav (collapsible) + topbar with user context
- Content area: full-width panels, no max-width constraints on data tables
- Dashboard cards: KPI metrics in a 4-column grid at top, table below
- Responsive: sidebar collapses to icon-only on md, hidden on sm (hamburger)

## Iconography
- Lucide React icons throughout (consistent stroke weight 1.5)
- Status icons alongside RFQ state badges

## Motion
- Minimal animation — functional transitions only (200ms ease)
- No decorative animations — this is a professional trade tool

## Data Density
- Prefer compact tables over card grids for list views
- Show key fields inline: RFQ ID, buyer name, state badge, total amount, last updated
- Pagination over infinite scroll for auditability
