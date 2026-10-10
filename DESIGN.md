---
name: Illia Katerynych Portfolio
description: A restrained quality ledger for inspectable engineering work, writing, and public scripts.
colors:
  primary-mauve: '#cba6f7'
  primary-mauve-soft: '#b99bea'
  focus-pink: '#f5c2e7'
  status-yellow: '#f9e2af'
  crust: '#11111b'
  mantle: '#181825'
  base: '#1e1e2e'
  surface-0: '#313244'
  surface-1: '#45475a'
  surface-2: '#585b70'
  overlay-0: '#6c7086'
  overlay-1: '#9399b2'
  subtext-0: '#a6adc8'
  subtext-1: '#bac2de'
  text: '#cdd6f4'
typography:
  display:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.8rem, 5.2vw, 4.75rem)'
    fontWeight: 600
    lineHeight: 0.99
    letterSpacing: '-0.038em'
  headline:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.75rem, 3vw, 2.6rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.028em'
  title:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.35rem, 2.3vw, 1.85rem)'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.022em'
  body:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 'normal'
  metadata:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 'normal'
  article-body:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.02rem'
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: 'normal'
  article-body-compact:
    fontFamily: 'Onest, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.68
    letterSpacing: 'normal'
rounded:
  inline-code: '0.2rem'
  portrait: '0.25rem'
  action: '0.28rem'
  full: '999px'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2rem'
components:
  primary-action:
    backgroundColor: '{colors.primary-mauve}'
    textColor: '{colors.crust}'
    typography: '{typography.body}'
    rounded: '{rounded.action}'
    padding: '0.78rem 1rem'
  primary-action-hover:
    backgroundColor: '{colors.focus-pink}'
    textColor: '{colors.crust}'
  secondary-action:
    backgroundColor: 'transparent'
    textColor: '{colors.subtext-1}'
    typography: '{typography.body}'
  profile-link:
    backgroundColor: 'transparent'
    textColor: '{colors.text}'
    padding: '0.85rem 0'
    height: '4.15rem'
  archive-entry:
    backgroundColor: 'transparent'
    textColor: '{colors.text}'
    typography: '{typography.title}'
    padding: '1.5rem 0 1.4rem'
  archive-entry-draft:
    backgroundColor: 'transparent'
    textColor: '{colors.status-yellow}'
    typography: '{typography.title}'
  script-risk-system:
    backgroundColor: 'transparent'
    textColor: '{colors.status-yellow}'
    typography: '{typography.metadata}'
  command-copy:
    backgroundColor: '{colors.crust}'
    textColor: '{colors.text}'
    typography: '{typography.metadata}'
    rounded: '{rounded.portrait}'
    padding: '1rem 1.15rem'
  command-copy-action:
    backgroundColor: '{colors.primary-mauve}'
    textColor: '{colors.crust}'
    typography: '{typography.body}'
    width: '13rem'
  catalogue-search:
    backgroundColor: 'transparent'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    height: '2.75rem'
  catalogue-entry:
    backgroundColor: 'transparent'
    textColor: '{colors.text}'
    typography: '{typography.title}'
    padding: '1.5rem 0 1.75rem'
  article-inline-code:
    backgroundColor: '{colors.surface-0}'
    textColor: '{colors.focus-pink}'
    rounded: '{rounded.inline-code}'
    padding: '0.12em 0.34em'
---

# Design System: Illia Katerynych Portfolio

## Overview

**Creative North Star: "The Quality Ledger"**

The Quality Ledger turns broad experience, inspectable work, technical writing, and public scripts into one durable engineering standard. It is a quiet, technically exact record: deep Catppuccin Mocha fields, unboxed chronology and writing archives, compact sans-serif type, mono metadata and commands, and Mauve signals that lead the eye without turning the page into a spectacle.

The system should feel personal but never performative. Information earns hierarchy through scale, spacing, alignment, and fine rules rather than developer-dashboard tiles, generic portfolio cards, glass panels, or a CV facsimile. Inspectable work and writing are the evidence; the interface keeps the portfolio easy to scan and gives articles a calm, semantic reading flow.

**Key Characteristics:**

- Catppuccin Mocha depth with Mauve used as a precise signal.
- Oversized compact statements paired with restrained mono metadata.
- Unboxed chronology, writing archives, script catalogues, and long-form content separated by fine rules.
- A centred, asymmetric frame that becomes a direct single-column flow on smaller screens.
- Minimal motion, visible focus, and complete reduced-motion behavior.

## Colors

The palette is a low-chroma blue-violet field with a single lucid Mauve voice and a stepped hierarchy of cool text and rules.

### Primary

- **Signal Mauve** (`primary-mauve`): carries the defining phrase, timeline markers, project links, the page-edge trace, and the primary action.
- **Soft Mauve** (`primary-mauve-soft`): supports organisation names and hover borders where the full accent would be too loud.

### Secondary

- **Focus Pink** (`focus-pink`): reserved for keyboard focus and the highest-emphasis hover state.

### Tertiary

- **Status Yellow** (`status-yellow`): marks exceptional state without competing with Mauve. It identifies local-development draft titles and production script metadata whose risk is `system-changes`.

### Neutral

- **Crust** (`crust`): dark foreground on filled Mauve controls and the base of ambient portrait shadow.
- **Mantle** (`mantle`): recessed utility surfaces such as the scrollbar track.
- **Base** (`base`): the uninterrupted page field and the halo around timeline markers.
- **Surface 0–2** (`surface-0`, `surface-1`, `surface-2`): quiet depth steps for rules, separators, and low-emphasis utility detail.
- **Overlay 0–1** (`overlay-0`, `overlay-1`): tertiary text, icons, and technology separators.
- **Subtext 0–1** (`subtext-0`, `subtext-1`): explanatory copy, metadata, and secondary actions.
- **Text** (`text`): primary reading color and headline field.

### Named Rules

**The One Signal Rule.** Mauve is the only recurring public chromatic signal; use it for direction, emphasis, and active attention rather than decoration. Status Yellow appears only when state must be unmistakable: unpublished local content or a script that changes the system.

**The Continuous Field Rule.** The Base field remains visually continuous; section structure comes from space and rules, not alternating background slabs.

## Typography

**Display Font:** Onest (with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks)

**Body Font:** Onest (with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks)

**Label/Mono Font:** JetBrains Mono (with `ui-monospace` and `monospace` fallbacks)

**Character:** Self-hosted variable Onest gives statements compact authority without editorial ornament. Self-hosted variable JetBrains Mono makes dates, locations, technologies, commands, and small labels read as ledger entries rather than terminal cosplay. Deliver both as local WOFF2 assets with `font-display: swap`; system stacks remain the fallback.

### Hierarchy

- **Display** (600, fluid `2.8rem–4.75rem`, `0.99` line-height): the single opening engineering statement; keep it balanced and no wider than about 15 characters per line at full size.
- **Headline** (600, fluid `1.75rem–2.6rem`, `1.1` line-height): major section and closing headings.
- **Title** (600, fluid `1.35rem–1.85rem`, `1.15` line-height): chronology entry titles.
- **Body** (400, `1rem`, `1.65` line-height): explanatory prose, normally constrained to roughly 58–66 characters.
- **Article Body** (400, `1.02rem`, `1.72` line-height; compact `1rem`, `1.68`): long-form Markdown prose within a `70ch` maximum reading measure.
- **Metadata** (400–500, `0.75rem`, at least `1.4` line-height): dates, kinds, locations, technologies, handles, and footer notes; uppercase labels add only modest tracking.

### Named Rules

**The Compact Authority Rule.** Large type earns impact through tight line-height and deliberate wrapping, never through all-caps display styling or decorative effects.

**The Metadata Floor Rule.** Mono metadata never drops below `0.75rem`; technical texture must remain readable rather than becoming ornamental microcopy.

## Layout

The primary frame is centred at a maximum width of `80rem` (1280px), with a narrow `12rem–15rem` identity rail beside a flexible content column. The wide-screen gap expands from `4rem` to `8.5rem`; the rail stays quietly sticky on wide screens while the main column carries the narrative.

Sections are unboxed with deliberately varied rhythm. The home opening has the largest pause, followed by a two-column section-heading pattern, a chronology with a `10rem` metadata column, and simple split rows for capabilities and personal context. The blog index follows the same shell: “Learn by doing, then write about it.” leads into a reverse-chronological writing ledger whose rows use rules and whitespace rather than cards.

Articles retain the identity rail, then divide the reading area into a long-form column of up to `46rem` and a `11rem–12rem` nested H2/H3 table of contents. The table of contents remains sticky on wide screens. At `1180px` it moves inline above the article body, and its links expand to `44px` minimum height; at `900px` the identity rail becomes the shared compact header. The article body keeps a maximum `70ch` reading measure.

The public script catalogue keeps the `80rem` outer frame and constrains its working content to `70rem`. Its opening pairs the display statement with purpose and security copy, then moves directly into search and the script list. Catalogue entries use a two-row grid: title and description opposite metadata, then a full-width joined command, copy, and raw-source control. At `900px` the grid becomes one direct column. Search is absent when the registry is empty because it cannot perform a useful action.

At `900px`, the layout becomes one column, the profile rail turns into a compact identity header, and chronology metadata moves above each entry. At `620px`, the frame narrows to `100% - 2.25rem`, actions stack, content pairs collapse, and the three operating principles remain terse enough to stay side by side. Navigation, archive rows, and inline table-of-contents links preserve a `44px` compact-screen touch target.

**The Unboxed Record Rule.** Chronology entries and capability groups remain part of one reading flow; separate them with position, whitespace, and one-pixel rules, never individual cards.

## Elevation & Depth

The system is flat by default. Tonal layering is minimal and sections share one continuous Base field. The only ambient shadow belongs to the portrait (`0 1.3rem 3rem rgba(17, 17, 27, 0.42)`), separating a photographic object from the page; controls and content containers do not float.

### Shadow Vocabulary

- **Portrait ambient** (`0 1.3rem 3rem rgba(17, 17, 27, 0.42)`): use only for portrait or similarly singular photographic identity material.

### Named Rules

**The Flat Ledger Rule.** Depth is structural, not ornamental: prefer tonal contrast, rules, and overlap-free spacing; do not cast shadows under ordinary content or controls.

## Shapes

Geometry is disciplined and nearly square. The portrait, article images, and code blocks use a slight `0.25rem` corner; the filled action uses `0.28rem`; inline code uses the tighter, near-square `0.2rem` radius. These soften touchpoints without creating pills. Fine one-pixel rules organize navigation, section headings, archive rows, article sections, tables, capability rows, and the closing region. Circles belong to point markers and scrollbar mechanics, not content containers.

**The Near-Square Rule.** Keep content and controls close to square; reserve fully rounded geometry for tiny functional indicators.

## Components

Components are direct, compact, and visually subordinate to the work they expose.

### Buttons

- **Shape:** Near-square with a slight action radius (`0.28rem`).
- **Primary:** Signal Mauve fill with Crust text, `0.78rem 1rem` padding, medium weight, and a small directional icon.
- **Hover / Focus:** Hover shifts to Focus Pink and rises `2px` over `160ms`; keyboard focus always receives the global `2px` Focus Pink outline with `4px` offset.
- **Secondary:** Transparent and underlined in Subtext 1; hover moves to Signal Mauve without adding a container.

### Cards / Containers

- **Corner Style:** No card silhouette for chronology or capability content.
- **Background:** Continuous Base field.
- **Shadow Strategy:** None; follow the Flat Ledger Rule.
- **Border:** One-pixel Surface 1 rules where groups need separation.
- **Internal Padding:** Applied to rows, never as a boxed card inset.

### Navigation

Profile links form one ruled vertical ledger on wide screens. About me and Blog remain present on every route, use `/` and `/blog/` as their mono metadata, and mark the current destination in Mauve. They share the same `4.15rem` row height as the public profile links, whose metadata is a handle and whose outbound indicator distinguishes external navigation. Hover turns the row and outbound cue Mauve, nudging the arrow diagonally by `2px`; on compact layouts all links become a horizontal, label-only set with at least `44px` touch height.

### Writing Archive

The blog index is an unboxed reverse-chronological ledger. A ruled “Writing” heading shares the line with the RSS action; each article row pairs a direct title and outbound cue with `0.75rem` mono date and reading-time metadata. Published rows use Text and become Mauve on hover. Local-development draft rows remain Status Yellow in both rest and hover states so publication status cannot be mistaken.

### Article & Table of Contents

The article header pairs a direct return link with a compact display title, mono dates/read time, and mono tags. The nested H2/H3 table of contents is a quiet navigation rail: uppercase mono heading, one-pixel divider, Subtext 0 links, and a fine indented rule for H3 items. It is sticky beside the reading column on wide screens and moves inline with `44px` link targets at `1180px` and below.

### Command Copy Row

A runnable command is presented as inspectable evidence, not a decorative terminal. The Crust code field uses a one-pixel Surface 1 border, the standard `0.25rem` content radius, and readable `0.75rem` mono text. A fixed `13rem` Mauve copy button and a connected outlined raw-source button join its trailing edge. Both actions use compact `44px` targets and reduced horizontal padding. Long commands scroll horizontally inside the code field; below `600px`, the connected controls stack vertically.

### Catalogue Search

Search is an unboxed ruled row, not a filled field. It pairs a quiet search mark with a full-width transparent input and either the `/` shortcut hint or a direct underlined clear action. Keyboard `/` focuses the field when the visitor is not typing elsewhere; Escape clears an active query. Result count and copy feedback use polite live regions, while the global Focus Pink outline remains visible.

### Script Catalogue Ledger

The catalogue keeps every generated entry in one predictable, ruled reading flow without a redundant section title or visible category dividers. Each entry exposes language, platforms, risk, description, raw source, and the exact command. Empty-registry and no-match states remain spacious, unboxed rows with plain guidance; the no-match state includes a clear-search action rather than a replacement panel or illustration.

### Markdown Prose

The custom Markdown renderer produces semantic prose rather than a generic rich-text skin. H2 sections begin after generous space and a one-pixel rule; H3 headings remain subordinate. Links and list markers use Mauve, blockquotes use a Soft Mauve left rule, and heading anchors appear on hover or keyboard focus. Inline code uses a Surface 0 field, Focus Pink text, and the `0.2rem` radius. Fenced code uses the Catppuccin Mocha syntax theme in a bordered, horizontally scrollable `0.25rem` container; tables scroll horizontally when needed and use ruled rows with mono headers. Images fill the reading width, keep the `0.25rem` corner, and may carry centred `0.75rem` mono captions.

### Timeline

The chronology uses one Surface 1 vertical trace and small Mauve point markers, with mono kind/date metadata beside an unboxed content column. The trace reveals once over `900ms` with a fast-out easing curve; reduced-motion mode leaves all content complete and effectively removes the animation.

### Working Standard

Three terse principles sit on a shared top rule. Each uses a Text-colored action word over a smaller Subtext 0 explanation, giving the opening a practical engineering cadence without becoming a metrics dashboard.

## Do's and Don'ts

### Do:

- **Do** keep the Base field continuous and use exact one-pixel Surface 1 rules to structure dense information.
- **Do** let one oversized statement establish the engineering standard, then support it with readable restrained copy.
- **Do** use Signal Mauve sparingly for the message, active direction, and inspectable links.
- **Do** keep mono metadata at `0.75rem` or larger and preserve `44px` touch targets on mobile.
- **Do** keep chronology, project, and capability content data-shaped and easy to extend.
- **Do** preserve the blog as an unboxed, reverse-chronological writing ledger led by “Learn by doing, then write about it.”
- **Do** keep long-form Markdown semantic and readable, including code, tables, figures, captions, nested H2/H3 navigation, and the established article-body values.
- **Do** reserve Status Yellow for explicit exceptional states: local-development drafts and `system-changes` script risk; keep Mauve as the recurring public signal.
- **Do** present runnable commands with their risk, documentation, and raw source close by, and keep copy success or failure inline without changing the row's geometry.
- **Do** keep catalogue search and empty states in the ruled ledger flow instead of promoting them into panels; announce result counts without adding another visible heading row.

### Don't:

- **Don't** turn experience, principles, or capabilities into developer-dashboard tiles or generic portfolio cards.
- **Don't** imitate a CV page with boxed credentials, dense columns, or résumé ornament.
- **Don't** add neon terminal effects, glassmorphism, gradients, or conspicuous frontend spectacle.
- **Don't** add extra accent hues or use Mauve as a decorative wash.
- **Don't** introduce shadows beyond singular photographic identity material.
- **Don't** box archive entries, article prose, or the table of contents into cards.
- **Don't** make production blog content dynamic or introduce image hosts beyond the configured R2 origin.
