# DESIGN.md --- Brightloop UI & Motion Specification

> **System Directive for Antigravity IDE:** This document is the single
> source of truth for the **Brightloop** B2B/B2C Subscription Management
> & Recurring Billing platform. Adhere strictly to the tokens, component
> specifications, layout geometries, and deterministic animation rules
> defined below across every screen and route.

------------------------------------------------------------------------

## 1. Aesthetic Direction & Anti-Slop Guardrails

### 1.1 Design Paradigm

**Swiss Financial Ledger meets High-Craft Archival Accounting.** The
interface treats financial operations with editorial precision,
high-density tabular legibility, and tactile mechanical feedback. Strict
light mode only.

### 1.2 Hard Bans (Zero Tolerance)

-   **NO Decorative Icons:** Do not render icons next to sidebar
    navigation items, KPI stat card labels, table column headers, or
    payment methods (`Cash`, `Card`, `Bank transfer`, `UPI`, `Cheque`).
    Limit icons strictly to functional affordances: search input
    magnifier, password visibility toggle, modal close (`×`), and row
    action menu trigger (`⋯`).
-   **NO Emojis or Illustrations:** Never use emojis, cartoon vectors,
    or 3D graphics in headers, onboarding, empty states, or 403/404
    pages.
-   **NO Generic Default Fonts:** Never load `Inter`, `Roboto`,
    `Open Sans`, or `Poppins`.
-   **NO Floating SaaS Card Kits:** Do not place content in rounded
    cards with soft drop shadows (`rgba(0,0,0,0.1)`). Use contiguous,
    shared-border `1px` structural grids (`#DCDAD4`) where adjacent
    cells lock together.
-   **NO Rainbow Pill Badges:** Do not use `border-radius: 9999px`
    pastel pills. Use squared architectural tags (`3px` radius) with a
    `1px` border and a `6px` semantic dot.
-   **NO Bounce or Scroll-Entrance Clichés:** Never use spring/overshoot
    easing or generic fade-and-slide-up card entrances.
-   **NO Template Chrome:** Never use tracked-out ALL-CAPS eyebrow
    labels above headings, never append `→` arrows to buttons/links, and
    never use gradients.

------------------------------------------------------------------------

## 2. Design Tokens (`:root` CSS Variables)

``` css
:root {
  /* Surface Palette — Archival Paper & Ledger Ink */
  --bg-canvas: #F6F5F2;          /* Warm Alabaster Paper (App background) */
  --bg-surface: #FFFFFF;         /* Crisp Ledger White (Tables, sheets, active panels) */
  --bg-recessed: #EFECE6;        /* Stone Wash (Table headers, filter bars, inactive tabs) */
  --border-hairline: #DCDAD4;    /* 1px solid structural rules across all components */
  --border-strong: #8C8982;      /* Focused or emphasized borders */

  /* Typography Ink */
  --ink-primary: #141413;        /* Deep Carbon (Headings, primary cell data) */
  --ink-secondary: #575551;      /* Warm Graphite (Labels, table headers, meta) */
  --ink-muted: #8C8982;          /* Ash (Placeholders, disabled states, hints) */

  /* Brand & Semantic Accents */
  --brand-verdigris: #0A5C52;    /* Primary CTA & Active Indicator Bar ONLY */
  --brand-hover: #07423B;        /* Primary CTA Hover */
  --brand-tint: #EBF3F1;         /* Subtle selection, row flash, & Paid status fill */

  --danger-cinnabar: #B82E1F;    /* Destructive actions & Overdue balance text */
  --danger-hover: #962317;       /* Destructive CTA Hover */
  --danger-tint: #FCEEEB;        /* Overdue status fill & error banner surface */
  --danger-border: #F5C6C0;      /* Overdue tag border */

  --warn-ochre: #C27803;         /* Quotation / Paused indicator dot */
  --info-cobalt: #1D4ED8;        /* Confirmed indicator dot */

  /* Typography Families */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Newsreader', Georgia, serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* Geometry & Elevation */
  --radius-container: 4px;       /* Modals, cards, input fields */
  --radius-control: 3px;         /* Buttons, status tags, segmented switches */
  --shadow-modal: 0 12px 32px -4px rgba(20, 20, 19, 0.12);
  --backdrop-overlay: rgba(20, 20, 19, 0.38);

  /* Spacing Scale */
  --space-canvas: 24px;          /* Outer page padding */
  --space-gap: 16px;             /* Major section separation */
  --space-inner: 12px;           /* Intra-component padding */

  /* Unified Motion Engine — Timing Curves */
  --ease-snap: cubic-bezier(0.2, 0, 0, 1);        /* Buttons, toggles, row hover */
  --ease-ledger: cubic-bezier(0.16, 1, 0.3, 1);   /* Drawers, modals, active bars, steppers */
  --ease-data: cubic-bezier(0.22, 1, 0.36, 1);    /* SVG chart draw, odometer roll, bars */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);        /* Dismissals, row delete, logout */

  /* Unified Motion Engine — Durations */
  --dur-instant: 90ms;
  --dur-fast: 150ms;
  --dur-base: 240ms;
  --dur-data: 550ms;
}
```

------------------------------------------------------------------------

## 3. Typography & Localization Rules

### 3.1 Type Scale & Roles

  ---------------------------------------------------------------------------------------------
  Role          Font Family      Size /      Line Height Color               Usage
                                 Weight      / Tracking                      
  ------------- ---------------- ----------- ----------- ------------------- ------------------
  **Display     `--font-serif`   `28px` /    `1.15` /    `--ink-primary`     Top 4 Dashboard
  Financial**                    `400`       `-0.02em`                       KPIs, Portal Due
                                                                             Highlight, Invoice
                                                                             Grand Total

  **Page        `--font-sans`    `22px` /    `1.25` /    `--ink-primary`     Top bar / page
  Title**                        `600`       `-0.02em`                       header title

  **Section /   `--font-sans`    `15px` /    `1.35` /    `--ink-primary`     Panel headers,
  Modal Title**                  `600`       `-0.01em`                       modal titles

  **Body / Cell `--font-sans`    `13.5px` /  `1.45` /    `--ink-primary`     Customer names,
  Text**                         `400`       `0`                             product names,
                                                                             prose

  **Labels &    `--font-sans`    `12px` /    `1.3` / `0` `--ink-secondary`   Form labels, table
  Headers**                      `500`                                       headers
                                                                             (**sentence case
                                                                             only**)

  **Tabular     `--font-mono`    `13px` /    `1.4` / `0` `--ink-primary`     All `₹` amounts,
  Ledger Data**                  `400`                                       dates, GSTINs,
                                                                             `SUB-` and `INV-`
                                                                             IDs
                                                                             (`tabular-nums`)
  ---------------------------------------------------------------------------------------------

### 3.2 Localization & Copy Standards

-   **Indian Rupee (`₹`) Formatting:** Strictly format with Indian
    lakhs/crores digit grouping (`₹1,51,040.00`, `₹48,92,400.00`).
    Right-align all currency columns in tables.
-   **Date Formatting:** `DD MMM YYYY` (`01 Nov 2026`).
-   **Voice & Tone:** Sentence case everywhere. Active verbs on buttons
    (`Record payment`, `Generate invoices`, `Save subscription`). When a
    button says `Record payment`, the resulting toast says
    `Payment recorded`. Error messages state what failed and how to
    resolve it without apologizing.

------------------------------------------------------------------------

## 4. App Shell & Navigation Architecture

### 4.1 Desktop Layout Grid (`1440px` Reference)

-   **Left Sidebar (`240px` fixed width, `--bg-canvas`,
    `1px solid var(--border-hairline)` right border):**

-   **Brand Header (`56px` height):** Wordmark **Brightloop** (`17px`
    bold) with a `6px × 6px` solid `--brand-verdigris` square mark.

-   **Navigation Links (`36px` row height, `13.5px` medium, no icons):**
    Divided into functional groups by `1px solid var(--border-hairline)`
    horizontal rules:

    1.  *Core Operations:* Dashboard, Subscriptions, Invoices, Payments
    2.  *Catalog & Accounts:* Customers, Products, Plans
    3.  *Governance (Admin Only):* Discounts, Taxes, Staff

-   **Active Link Treatment:** `--ink-primary` semibold text,
    `--bg-surface` fill, and a `3px` solid `--brand-verdigris` vertical
    bar flush left.

-   **Footer User Block:** Top `1px` border, user name (`Karan Joshi`),
    monospace role badge (`ADMIN` / `STAFF`), and plain text `Sign out`
    trigger.

-   **Top Utility Bar (`56px` height, `--bg-surface`,
    `1px solid var(--border-hairline)` bottom border):**

-   Left: Breadcrumb trail (`Subscriptions  /  SUB-2026-00042`).

-   Right: Keyboard search trigger (`Search ledger... ⌘K`), text
    notification trigger (`Alerts (3)`), Role/Viewport Inspector toggle,
    and profile dropdown (`Profile`, `Sign out`).

### 4.2 Role Shell Variants

-   **Admin Shell:** Full 10-item sidebar.
-   **Staff Shell:** Suppresses Governance group (`Discounts`, `Taxes`,
    `Staff`).
-   **Customer Portal Shell:** Simplified 200px sidebar (or top rail)
    showing only `Overview`, `My subscriptions`, `My invoices`, and
    active customer entity (`Zeta Analytics Pvt Ltd`).
-   **Mobile Shell (`375px`):** `52px` header with two-line menu button
    that morphs into `×` and slides in a `280px` full-height typographic
    drawer.

------------------------------------------------------------------------

## 5. Component Specifications

### 5.1 Status Tags (Identical Across All Views)

-   **Structure:**
    `display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 500; border: 1px solid var(--border-hairline); background: var(--bg-surface);`
-   **Leading Dot:** `6px × 6px` circle (`border-radius: 50%`).
-   **Semantic Mappings:**
    -   `Draft` / `Cancelled`: Dot `#8C8982` \| Text `#575551` \| Fill
        `#FFFFFF`
    -   `Quotation` / `Paused`: Dot `#C27803` \| Text `#141413` \| Fill
        `#FFFFFF`
    -   `Confirmed`: Dot `#1D4ED8` \| Text `#141413` \| Fill `#FFFFFF`
    -   `Active` / `Open`: Dot `#0A5C52` \| Text `#141413` \| Fill
        `#FFFFFF`
    -   `Paid`: Dot `#0A5C52` \| Text `#0A5C52` \| Fill `#EBF3F1`
    -   `Closed`: Dot `#141413` \| Text `#575551` \| Fill `#EFECE6`
    -   `Overdue`: Dot `#B82E1F` \| Text `#B82E1F` \| Fill `#FCEEEB` \|
        Border `#F5C6C0`

### 5.2 Reusable Data Table Architecture

-   **Filter Strip:** Recessed `--bg-recessed` top bar (`1px` border)
    housing search input, filter dropdowns, and quick-filter chips
    (`Expiring in 30 days`, `Overdue only`).
-   **Table Grid:** `--bg-surface` background, `42px` row height,
    `1px solid var(--border-hairline)` horizontal row dividers, no
    vertical cell borders. Left-align text/IDs; right-align dates and
    `₹` currency columns.
-   **Pagination Bar:** Bottom `1px` border strip showing
    `Showing 21 to 40 of 1,240` on the left, and page-size selector
    (`20 per page`) + `Previous` / `Next` buttons on the right.

------------------------------------------------------------------------

## 6. Exhaustive Animation & Interaction Choreography

All motion must respect `@media (prefers-reduced-motion: reduce)` by
falling back to `120ms` opacity crossfades.

### 6.1 Buttons & Async Actions

-   **Hover (`150ms var(--ease-snap)`):**
    -   Primary (`--brand-verdigris`): Shifts to `--brand-hover` with
        `inset 0 1px 0 rgba(255,255,255,0.18)`.
    -   Secondary (`--bg-surface`): Shifts to `--bg-recessed`; border
        darkens to `--border-strong`.
    -   Destructive: Shifts from `--danger-cinnabar` to `--danger-hover`
        (or `#FFFFFF` to `--danger-tint` for ghost destructive).
-   **Active Press (`90ms var(--ease-snap)`):** Mechanical
    `transform: translateY(1px)`. Never use `scale()`.
-   **Async Submission Sequence (`Save`, `Confirm`, `Record payment`,
    `Generate batch`):**
    1.  Lock button width; disable pointer events.
    2.  Translate label down `8px` + fade `opacity: 0`
        (`120ms var(--ease-exit)`).
    3.  Fade in centered `14px` geometric SVG spinner
        (`120ms var(--ease-snap)`).
    4.  On resolution: Draw SVG checkmark (`stroke-dashoffset` in
        `180ms`), swap text to past-tense (`Saved`, `Payment recorded`),
        and trigger top-right Toast banner.

### 6.2 Typography & Financial Odometer Counters

-   **Route Title Wipe (`180ms var(--ease-ledger)`):** Page title and
    breadcrumbs reveal via `clip-path: inset(0 100% 0 0)` to
    `inset(0 0% 0 0)` paired with `opacity: 0.4 -> 1`.
-   **Tabular Number Odometer (`550ms var(--ease-data)`):**
    -   Applied to Dashboard 4 KPI serif totals, Subscription
        Create/Edit sticky totals (`Subtotal`, `Discount`, `IGST`,
        `Total`), and Invoice `Balance due`.
    -   When mounted, filtered by date, or updated via line-item edits,
        numbers interpolate smoothly through formatted Indian
        lakhs/crores (`₹`) strings in `IBM Plex Mono` (`tabular-nums`)
        with zero horizontal jitter.

### 6.3 Authentication Flows (Screens 01--04)

-   **Auth Card Mount (`240ms var(--ease-ledger)`):** Centered `400px`
    `--bg-surface` ledger box draws its `1px` border first, followed
    `40ms` later by form fields staggering in (`30ms` per field,
    `translateY(4px -> 0)`, `opacity: 0 -> 1`).
-   **Password Show/Hide (`120ms var(--ease-snap)`):** Toggling `Show` /
    `Hide` crossfades the button label and flashes `--brand-tint` across
    the input field (`150ms`) as characters switch between masked dots
    and `IBM Plex Mono`.
-   **Live 2×2 Password Checklist (Sign Up, Reset Password, Add
    Staff):**
    -   Rendered as a contiguous `2×2` hairline grid (`8+ characters`,
        `Uppercase`, `Lowercase`, `Special character`).
    -   As each rule passes: Cell fill transitions `#FFFFFF -> #EBF3F1`
        (`180ms var(--ease-snap)`), text shifts to `--brand-verdigris`,
        and the leading indicator morphs from a `4px` ash square into an
        SVG checkmark (`stroke-dashoffset: 12 -> 0` over
        `200ms var(--ease-data)`).
-   **Login -\> Workspace Handshake (`320ms var(--ease-ledger)`):**
    -   Auth card compresses slightly (`scale(0.985)`, `opacity: 0`,
        `160ms var(--ease-exit)`).
    -   Left Sidebar glides in (`translateX(-16px -> 0)`,
        `240ms var(--ease-ledger)`), Top Bar locks in
        (`translateY(-8px -> 0)`), and main content populates.
-   **Invalid Login Oscillation (`280ms`):** Damped horizontal
    mechanical shake (`translateX: -5px, 5px, -3px, 3px, 0`) while a
    `--danger-tint` banner with a `3px` `--danger-cinnabar` left bar
    expands at top of form.
-   **Logout Sequence (`220ms var(--ease-exit)`):** Clicking `Sign out`
    dims main canvas (`opacity: 0.35`, `120ms`), slides sidebar left
    (`translateX(-12px)`, `opacity: 0`), and mounts Screen 01 Login with
    notice `Session closed securely`.

### 6.4 Sidebar Indicator & Tab Switching

-   **Sidebar Active Bar Glide (`220ms var(--ease-ledger)`):** The `3px`
    left `--brand-verdigris` bar is a single persistent DOM indicator
    that glides vertically (`transform: translateY(...)`) to the newly
    selected route while row background crossfades to `#FFFFFF`.
-   **Underline Tabs & Segmented Controls
    (`200ms var(--ease-ledger)`):**
    -   Applied to Subscription Detail tabs (`Lines`, `Invoices`,
        `History`), Dashboard date presets, Payment method tabs (`Cash`,
        `Card`, `Bank transfer`, `UPI`, `Cheque`), and Plan billing
        period selector.
    -   The active `2px` bottom bar or `--bg-surface` segment box glides
        horizontally (`transform: translateX(...)` and `width`
        interpolation).
    -   Outgoing tab content fades out (`90ms var(--ease-exit)`);
        incoming tab content shifts in (`translateX(6px -> 0)`,
        `opacity: 0 -> 1`, `160ms var(--ease-ledger)`).

### 6.5 Data Visualizations & Progress Bars (Screens 05 & 17)

-   **MRR Trend Line Chart (`650ms var(--ease-data)`):**
    1.  Dotted `--border-hairline` grid lines fade in (`150ms`).
    2.  Primary `2px` `--brand-verdigris` SVG path draws left-to-right
        via `stroke-dashoffset` (`600ms var(--ease-data)`), followed
        immediately by the dashed 30-day forecast segment (`250ms`).
    3.  Subtle under-curve fill (`rgba(10, 92, 82, 0.05)`) fades in
        (`300ms`).
    4.  **Hover Crosshair (`90ms linear`):** Snaps a `1px` vertical
        `--ink-primary` rule to the nearest month vertex, enlarges the
        vertex square to `6px`, and glides a bordered monospace tooltip
        (`Month` + `₹` amount).
-   **Subscriptions by Status Ring Chart (`550ms var(--ease-data)`):**
    -   SVG arcs sweep radially from 12 o'clock (`40ms` stagger per
        status).
    -   Hovering any legend row dims non-hovered arcs to `opacity: 0.35`
        (`150ms var(--ease-snap)`) and updates the center numeric
        readout.
-   **Discount Usage Bar (`450ms var(--ease-data)`):**
    -   The `4px` `--brand-verdigris` bar inside `Used 12 of 100` scales
        from `scaleX(0)` to `scaleX(0.12)` (`transform-origin: left`).

### 6.6 Tables, Skeletons, Steppers & Dynamic Line Items

-   **Skeleton Shimmer & Resolution:**
    -   Skeleton rows render rectangular `--bg-recessed` bars matching
        column alignments with a `1.6s infinite linear` sheen
        (`#EFECE6 -> #F6F5F2 -> #EFECE6`).
    -   When resolving to live data, skeletons fade out (`90ms`) and
        real rows cascade in (`15ms` stagger per row, capped at
        `180ms`).
-   **Table Row Hover & Actions (`90ms var(--ease-snap)`):** Row fill
    shifts `#FFFFFF -> #F6F5F2` with a `2px` left `--border-hairline`
    marker. Clicking `⋯` opens the anchored action menu
    (`scale(0.97) translateY(-4px) -> scale(1) translateY(0)`,
    `140ms var(--ease-ledger)`).
-   **5-Step Lifecycle Stepper (Screen 08:
    `Draft -> Quotation -> Confirmed -> Active -> Closed`):**
    -   Clicking `Confirm` / `Close` sweeps a `2px` top
        `--brand-verdigris` bar across the new active cell
        (`width: 0% -> 100%`, `300ms var(--ease-data)`), fills the
        completed step with `--bg-recessed` + SVG checkmark (`180ms`),
        updates the header Status Tag, and prepends an entry to the
        `History` tab with a `600ms` `--brand-tint` flash.
-   **Dynamic Line-Item & Variant Rows (Screens 07 & 15):**
    -   `+ Add line`: Expands row height `0 -> 48px`
        (`180ms var(--ease-ledger)`) and focuses first input.
    -   Editing Qty/Price/Tax: Flashes row `Amount` cell with
        `--brand-tint` (`300ms`) and rolls the Sticky Totals Odometer
        (`550ms`).
    -   Delete row (`×`): Flashes row `--danger-tint` (`100ms`),
        collapses height to `0` (`160ms var(--ease-exit)`), and
        recalculates totals.
-   **Mechanical Toggle Switches (Screens 16 & 18):**
    -   Rectangular track (`36px × 20px`, `3px` radius) with squared
        thumb (`14px × 14px`, `2px` radius). Thumb translates `16px`
        (`150ms var(--ease-snap)`) as track shifts `#DCDAD4 -> #0A5C52`.

### 6.7 Modals, Mobile Drawer & Toasts

-   **Modal Dialogs:** Backdrop fades to `var(--backdrop-overlay)`
    (`200ms`); modal box enters via
    `translateY(8px) scale(0.99) -> translateY(0) scale(1)`
    (`200ms var(--ease-ledger)`). Exit reverses in
    `140ms var(--ease-exit)`.
-   **Mobile Drawer (`375px`):** Top-left two-line trigger morphs to `×`
    (`180ms var(--ease-snap)`) while the `280px` left drawer glides
    `translateX(-100% -> 0)` (`240ms var(--ease-ledger)`).
-   **Toast Banners (Top-Right Stack):** Slide in from
    `translateX(24px)` (`220ms var(--ease-ledger)`) with a `3px`
    semantic left border (`--brand-verdigris` for success,
    `--danger-cinnabar` for error) and a `2px` bottom progress hairline
    that scales `1 -> 0` over `4000ms linear` (pausing on hover).

------------------------------------------------------------------------

## 7. Complete 27-Screen Implementation Checklist

Include a collapsible bottom-right **Workspace Inspector Bar** (`⌘.`) to
jump between any of the 27 screens, switch roles (`Admin` / `Staff` /
`Customer`), toggle viewports (`1440px Desktop` / `375px Mobile`), and
fire `Skeleton` / `Empty` / `Error Toast` states on demand:

1.  **01 Login:** Email, password with `Show/Hide`, `Forgot password?`,
    `Sign in`, link to Sign up.
2.  **02 Sign Up:** Name, email, company (optional), password with live
    `2×2` rules grid, confirm password, `Create account`.
3.  **03 Forgot Password:** Email field, `Send reset link`, inline sent
    confirmation state.
4.  **04 Reset Password:** New password with `2×2` checklist, confirm
    password, `Reset password`, plus expired link error state.
5.  **05 Finance Dashboard:** Date-range filter, 4 contiguous KPI cells
    (Active Subscriptions, Revenue Collected, Outstanding Amount,
    Overdue Invoices in Cinnabar), MRR monthly line chart + forecast,
    Subscriptions by Status ring chart, Overdue Invoices action table
    (`Record payment`), and Smart Insights at-risk panel.
6.  **06 Subscriptions List:** Search, status, plan,
    `Expiring in 30 days` chip, data table (`SUB-2026-00042`),
    pagination, `New subscription` CTA.
7.  **07 Subscription Create/Edit:** `Start from template` dropdown,
    searchable customer, plan, start/expiry dates, payment terms,
    dynamic editable lines table (`Add line`), right sticky totals
    ledger (subtotal, discount, tax, total), `Save` and `Cancel`.
8.  **08 Subscription Detail:** Header (`SUB-2026-00042`, status tag,
    customer, plan), 5-stage horizontal stepper (`Draft`, `Quotation`,
    `Confirmed`, `Active`, `Closed`), `Confirm` and `Close` actions,
    totals block, animated tabs (`Lines`, `Invoices`, `History`).
9.  **09 Invoices List:** Search, status, date range, `Overdue only`
    toggle, table (`INV-2026-00310`) with balance and row actions
    (`Confirm`, `Send`, `Print`, `Cancel`), `Generate invoices` button.
10. **10 Generate Invoices Dialog:** `Bill as of` date picker,
    `Generate` CTA, and completed summary state
    (`312 invoices created, 4 skipped`).
11. **11 Invoice Detail (Printable Archival Layout):** Company header &
    GSTIN, customer details, `INV-2026-00310`, dates, lines table,
    totals, status tag, action bar (`Confirm`, `Send`, `Print`,
    `Cancel`, `Record payment`), payments received sub-ledger, paid
    amount, and balance due.
12. **12 Record Payment Dialog:** 5-segment text method selector
    (`Cash`, `Card`, `Bank transfer`, `UPI`, `Cheque`), prefilled
    balance amount, date, note, `Save payment`.
13. **13 Payments List:** Method & date range filters, table (`Date`,
    `Invoice #`, `Customer`, `Method`, `Amount`, `Note`).
14. **14 Customers List & Dialog:** Table (`Name`, `Company`, `Email`,
    `Phone`, `Active subscriptions`) + create/edit modal.
15. **15 Products List & Variant Dialog:** Table (`Name`, `Type`,
    `Sales price`, `Cost price`, `Variants`) + modal with dynamic
    variant matrix (`Brand`, `Odoo`, `+₹560.00`).
16. **16 Plans List & Plan Dialog:** Table (`Name`, `Price`,
    `Billing period`, `Min qty`, `Availability window`, `Status`,
    actions: `Pause`, `Resume`, `Close early`, `Renew`) + modal with 4
    policy switches (`Auto-close on end date`, `Allow early close`,
    `Allow pause`, `Allow renewal`).
17. **17 Discounts List & Dialog (Admin Only):** Fixed/percentage,
    value, min purchase, min qty, start/end dates, usage limit progress
    bar (`Used 12 of 100`), scope (`Products` vs `Subscriptions`).
18. **18 Taxes List & Dialog (Admin Only):** Tax name, rate `%`,
    interactive active toggle + create/edit modal.
19. **19 Staff List & Dialog (Admin Only):** Name, email, role,
    temporary password with live `2×2` rules checklist.
20. **20 Customer Portal Home:** Welcome header, active subscription
    summary cards, `Next invoice due` highlight box with `Pay / View`
    CTA.
21. **21 Customer Portal --- My Subscriptions:** Ledger list with plan,
    status tag, renewal date.
22. **22 Customer Portal --- My Invoices:** Table with `Download PDF`
    button + read-only printable invoice detail view (admin actions
    removed).
23. **23 Mobile App Shell (`375px`):** Compact top bar + slide-over
    typographic navigation drawer.
24. **24 Mobile Subscriptions List (`375px`):** Responsive stacked 1px
    ledger cards for mobile viewport.
25. **25 Mobile Invoice Detail (`375px`):** Vertically stacked archival
    invoice with sticky bottom action bar.
26. **26 System 403 & 404 States:** Typographic diagnostic screens
    (`403 Access denied`, `404 Page not found`) with `Back to dashboard`
    button.
27. **27 System Empty, Skeleton & Toast States:** Zero-results table
    state with `Reset filters`, 8-row shimmering table skeleton state,
    and top-right error/success toast notification stack.
