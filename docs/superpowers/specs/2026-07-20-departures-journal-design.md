# Departures engineering journal — design

**Date:** 2026-07-20
**Status:** Approved by Lawrence

## Goal

Replace the placeholder "Engineering journal" entries on the Departures page
(`src/pages/work/departures.astro`) with six real key moments from building
Departures, each backed by a full write-up page under `/work/departures/`.

## The six entries

Chronological, as they will appear in the journal. Titles and blurbs are
Lawrence's own words.

| # | Date | Slug | Title | Blurb |
|---|------|------|-------|-------|
| 1 | Nov 2023 | `ultra-high-performance` | Designing an architecture for ultra high performance | I need to receive, process and distribute 10,000s of messages per second in a high availability environment |
| 2 | Jun 2024 | `privacy-first-architecture` | Adopting a privacy-first architecture | Designing around the constraints of privacy first and the advantages that come with it — offline use and caching |
| 3 | Nov 2024 | `breaking-out-of-swiftui-stacks` | Breaking out of SwiftUI stacks | Using `PreferenceKey` to unlock a beautiful service calling point display |
| 4 | Jun 2025 | `in-memory-graph-database` | Building an in-memory graph database from scratch | The commercially available graph databases aren't fast enough for a national network, so I had to build a new one. |
| 5 | Oct 2025 | `offline-hd-maps-in-metal` | Offline, HD maps in Metal | Using GIS tools, building an entirely offline map of the UK in a reasonable bundle size, directly on the GPU. |
| 6 | Jul 2026 | `berth-level-analytics` | Berth-level analytics | Berths are the smallest units of distance on the rail network. I start to use track-level and signal-level data from National Rail's Train Descriptor feed to unlock insights the industry can't see. |

Dates within a month are Lawrence's rough recollection; the month/year shown
("Nov 2023" format) is the only precision displayed. Exact `date` values in
frontmatter use the first of the month.

## Architecture

**Content collection** (chosen over per-page `.astro` files — Lawrence's
preference). New `departures-journal` collection:

- `src/content.config.ts` — collection definition using Astro's glob loader
  over `src/content/departures-journal/*.mdx`.
- Schema: `title` (string), `blurb` (string), `date` (date), `draft`
  (boolean, default `true`). Slug derives from the filename.
- MDX (`@astrojs/mdx` integration) rather than plain Markdown so entries can
  use a shared `Figure` component (the "FIG. 01" edge-bleed figure pattern
  from the thoughts essays) inside prose. Code blocks use Astro's built-in
  Shiki highlighting.

**Entry page** — one dynamic route `src/pages/work/departures/[slug].astro`
replicating the Concordance essay treatment:

- Header: eyebrow "Engineering journal · Entry 0N", title, blurb as lede,
  date + read time computed from word count.
- Sticky table of contents generated from the entry's rendered headings
  (h2), with the copper active-section bar and reading-progress bar ported
  from `src/pages/thoughts/2026-05-concordance.astro`.
- Prose typography applied to Markdown output via a scoped stylesheet
  mirroring the thoughts essay classes (17px / 1.75 body, display headings).
- Footer: "Next in the journal" tile (chronological successor; the last
  entry omits this tile) + "Back to Departures" tile.
- Crumbs: `Work / Departures / <title>`.
- Draft entries are excluded from `getStaticPaths` in production builds but
  visible in dev.

**Listing** — the journal section of `src/pages/work/departures.astro` drops
its hardcoded array, reads the collection with `getCollection`, sorts by
date ascending, and links each entry to its page. Only non-draft entries are
listed in production; in dev, drafts appear so the flow can be previewed.

## Content process

1. Structure ships first: collection, dynamic route, listing wired up, all
   six entries stubbed with real frontmatter and `draft: true`.
2. Then one interview round per entry: Lawrence answers a short set of
   questions; the MDX draft is written from his answers; he reviews; the
   entry flips to `draft: false`.
3. Audience calibration: `breaking-out-of-swiftui-stacks` is written for
   engineers at full technical depth (code samples included). The other five
   are for tech-literate readers — ideas and trade-offs, light on code.

## Testing

- `astro build` passes with the collection and MDX integration in place.
- Manual browser verification: journal listing shows six entries in order;
  each entry page renders with working TOC, progress bar, and next/prev
  links; breadcrumbs correct; no regression to the rest of the Departures
  page (hero canvas, sections, lessons).

## Out of scope

- Writing the six essays themselves (follows via per-entry interviews).
- Migrating the thoughts essays to the content collection.
- Any change to the "The project" cards or "Lessons learned" sections.
