# Departures Engineering Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder engineering-journal entries on the Departures page with six real entries backed by an MDX content collection and per-entry essay pages at `/work/departures/<slug>`.

**Architecture:** A `departures-journal` content collection (glob loader over MDX files, `draft` flag) feeds both the journal listing on `src/pages/work/departures.astro` and a dynamic essay route `src/pages/work/departures/[slug].astro` that replicates the Concordance essay treatment (sticky TOC from rendered headings, reading progress bar, prose stylesheet, next-entry footer). A shared helper module owns filtering (drafts visible in dev only) and date formatting.

**Tech Stack:** Astro ^7.0.7, `@astrojs/mdx`, Tailwind CSS 4 (via `@tailwindcss/vite`), Bun (package manager), no test framework — verification is `bun run build` plus dev-server curl checks.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-departures-journal-design.md`. Entry titles/blurbs/dates in Task 1 are locked by the spec — copy them exactly.
- Package manager is Bun (`bun.lock` present): use `bun run build`, `bunx astro …`. Never npm/yarn.
- Dev server per CLAUDE.md: start with `bunx astro dev --background`; manage with `bunx astro dev stop` / `status` / `logs`. Dev server runs on `http://localhost:4321`.
- Indentation is tabs in `.astro`/`.ts` files (match existing files).
- Theme tokens come from `src/styles/global.css` (`--color-ink`, `--color-ink-soft`, `--color-ink-mute`, `--color-copper`, `--color-card`, `--font-display`); never hardcode new colors.
- All six entries ship with `draft: true`. Production builds therefore publish no entry pages and hide the journal section entirely; dev shows everything. This is intended.
- `Layout.astro` props: `title: string`, `crumbs?: { label: string; href?: string }[]`.

---

### Task 1: MDX integration, content collection, six stub entries, shared helper

**Files:**
- Modify: `astro.config.mjs` (via `bunx astro add mdx`)
- Create: `src/content.config.ts`
- Create: `src/lib/departures-journal.ts`
- Create: `src/content/departures-journal/ultra-high-performance.mdx`
- Create: `src/content/departures-journal/privacy-first-architecture.mdx`
- Create: `src/content/departures-journal/breaking-out-of-swiftui-stacks.mdx`
- Create: `src/content/departures-journal/in-memory-graph-database.mdx`
- Create: `src/content/departures-journal/offline-hd-maps-in-metal.mdx`
- Create: `src/content/departures-journal/berth-level-analytics.mdx`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `getJournalEntries(): Promise<JournalEntry[]>` (published-in-prod/all-in-dev, sorted by date ascending) and `formatJournalDate(date: Date): string` (returns e.g. `"Nov 2023"`), both exported from `src/lib/departures-journal.ts`. `JournalEntry` is `CollectionEntry<"departures-journal">`; entry `id` is the filename slug (e.g. `breaking-out-of-swiftui-stacks`), frontmatter fields `title`, `blurb`, `date`, `draft`.

- [ ] **Step 1: Add the MDX integration**

Run: `cd "/Users/lawrencejob/Projects/Lawrence Job/website/.claude/worktrees/comment-work-thoughts-797beb" && bunx astro add mdx --yes`

Expected: `@astrojs/mdx` added to `package.json` dependencies and `mdx()` added to the `integrations` array in `astro.config.mjs`. Verify with `git diff astro.config.mjs` — it should now contain `import mdx from '@astrojs/mdx';` and `integrations: [mdx()]`.

- [ ] **Step 2: Define the content collection**

Create `src/content.config.ts`:

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const departuresJournal = defineCollection({
	loader: glob({ pattern: "*.mdx", base: "./src/content/departures-journal" }),
	schema: z.object({
		title: z.string(),
		blurb: z.string(),
		date: z.coerce.date(),
		draft: z.boolean().default(true),
	}),
});

export const collections = { "departures-journal": departuresJournal };
```

- [ ] **Step 3: Create the six stub entries**

Frontmatter only — the essays are written later via per-entry interviews (out of scope here). Dates use the first of the month; only month/year is ever displayed.

Create `src/content/departures-journal/ultra-high-performance.mdx`:

```mdx
---
title: Designing an architecture for ultra high performance
blurb: I need to receive, process and distribute 10,000s of messages per second in a high availability environment
date: 2023-11-01
draft: true
---
```

Create `src/content/departures-journal/privacy-first-architecture.mdx`:

```mdx
---
title: Adopting a privacy-first architecture
blurb: Designing around the constraints of privacy first and the advantages that come with it — offline use and caching
date: 2024-06-01
draft: true
---
```

Create `src/content/departures-journal/breaking-out-of-swiftui-stacks.mdx` (note: no backticks around PreferenceKey — frontmatter blurbs render as plain text):

```mdx
---
title: Breaking out of SwiftUI stacks
blurb: Using PreferenceKey to unlock a beautiful service calling point display
date: 2024-11-01
draft: true
---
```

Create `src/content/departures-journal/in-memory-graph-database.mdx`:

```mdx
---
title: Building an in-memory graph database from scratch
blurb: The commercially available graph databases aren't fast enough for a national network, so I had to build a new one.
date: 2025-06-01
draft: true
---
```

Create `src/content/departures-journal/offline-hd-maps-in-metal.mdx`:

```mdx
---
title: Offline, HD maps in Metal
blurb: Using GIS tools, building an entirely offline map of the UK in a reasonable bundle size, directly on the GPU.
date: 2025-10-01
draft: true
---
```

Create `src/content/departures-journal/berth-level-analytics.mdx`:

```mdx
---
title: Berth-level analytics
blurb: Berths are the smallest units of distance on the rail network. I start to use track-level and signal-level data from National Rail's Train Descriptor feed to unlock insights the industry can't see.
date: 2026-07-01
draft: true
---
```

- [ ] **Step 4: Create the shared helper**

Create `src/lib/departures-journal.ts`:

```ts
import { getCollection, type CollectionEntry } from "astro:content";

export type JournalEntry = CollectionEntry<"departures-journal">;

// Drafts are visible in dev so unwritten entries can be previewed; production
// builds only publish finished essays.
export async function getJournalEntries(): Promise<JournalEntry[]> {
	const entries = await getCollection("departures-journal", ({ data }) => import.meta.env.DEV || !data.draft);
	return entries.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
}

// Dates are UTC midnight from frontmatter; force UTC so the displayed month
// can't shift across timezones.
export function formatJournalDate(date: Date): string {
	return date.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}
```

- [ ] **Step 5: Verify the collection compiles and types generate**

Run: `cd "/Users/lawrencejob/Projects/Lawrence Job/website/.claude/worktrees/comment-work-thoughts-797beb" && bunx astro sync && bun run build`

Expected: both succeed (exit 0). The build output should not error on the collection; no journal pages are emitted yet (all drafts, no route exists yet).

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs package.json bun.lock src/content.config.ts src/content/departures-journal src/lib/departures-journal.ts
git commit -m "Add departures-journal content collection with six stub entries"
```

---

### Task 2: Figure component and dynamic essay route

**Files:**
- Create: `src/components/Figure.astro`
- Create: `src/pages/work/departures/[slug].astro`

**Interfaces:**
- Consumes: `getJournalEntries()`, `formatJournalDate(date)`, `JournalEntry` from `src/lib/departures-journal.ts` (Task 1); entry frontmatter `title`, `blurb`, `date`; entry `id` as slug.
- Produces: pages at `/work/departures/<entry.id>`; `Figure.astro` with props `n: number`, `heading: string`, `caption: string`, `label?: string` for MDX entries to import (used when essays are written, not by the stubs).

- [ ] **Step 1: Create the Figure component**

Ported from the inline figure markup in `src/pages/thoughts/2026-05-concordance.astro:101-112` so MDX entries can use the same visual language. Create `src/components/Figure.astro`:

```astro
---
// Numbered essay figure with the edge-bleed treatment from the thoughts
// essays: full-bleed both sides on mobile, right-only past the 952px column
// on desktop. Real media goes in the default slot; `label` renders the
// striped placeholder block instead while media doesn't exist yet.
interface Props {
	n: number;
	heading: string;
	caption: string;
	label?: string;
}

const { n, heading, caption, label } = Astro.props;
---

<figure
	class="my-[34px] mr-[min(-20px,calc((952px-min(100vw,1440px))/2))] ml-[min(0px,max(-20px,calc(min(100vw,1440px)-992px)))]"
>
	{
		label ? (
			<div class="flex h-[clamp(260px,40vw,460px)] items-center justify-center bg-[repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a_8px,#1d1d1d_8px,#1d1d1d_16px)]">
				<span class="font-mono text-xs text-ink-mute">{label}</span>
			</div>
		) : (
			<slot />
		)
	}
	<figcaption class="flex max-w-[660px] items-baseline gap-4 px-5 pt-4">
		<span class="flex-none text-xs tracking-[0.1em] text-copper tabular-nums">FIG. {String(n).padStart(2, "0")}</span>
		<span class="text-sm leading-[1.6] text-ink-mute">
			<span class="font-medium text-ink-soft">{heading}</span>
			{" "}{caption}
		</span>
	</figcaption>
</figure>
```

- [ ] **Step 2: Create the dynamic route**

Create `src/pages/work/departures/[slug].astro`. This mirrors `src/pages/thoughts/2026-05-concordance.astro` (header → sticky TOC + article → footer tiles, reading-progress bar, TOC scripts) with three differences: content comes from `<Content />`, the TOC is generated from rendered h2 headings (and hidden entirely when there are none, as in the stubs), and the footer links to the next journal entry and back to Departures.

```astro
---
import { render } from "astro:content";
import Layout from "../../../layouts/Layout.astro";
import Eyebrow from "../../../components/Eyebrow.astro";
import SectionLabel from "../../../components/SectionLabel.astro";
import { formatJournalDate, getJournalEntries } from "../../../lib/departures-journal";

export async function getStaticPaths() {
	const entries = await getJournalEntries();
	return entries.map((entry, index) => ({
		params: { slug: entry.id },
		props: { entry, index, next: entries[index + 1] ?? null },
	}));
}

const { entry, index, next } = Astro.props;
const { Content, headings } = await render(entry);

const tocItems = headings.filter((h) => h.depth === 2).map((h) => ({ id: h.slug, label: h.text }));

// ~220 wpm on the raw MDX body; close enough for a badge.
const words = (entry.body ?? "").split(/\s+/).filter(Boolean).length;
const readTime = Math.max(1, Math.round(words / 220));
---

<Layout
	title={`${entry.data.title} — Lawrence Job`}
	crumbs={[
		{ label: "Work", href: "/work" },
		{ label: "Departures", href: "/work/departures" },
		{ label: entry.data.title },
	]}
>
	<!-- Reading progress -->
	<div id="reading-progress" class="fixed top-0 left-0 z-[60] h-0.5 w-0 bg-copper" aria-hidden="true"></div>

	<!-- Entry header -->
	<header class="mx-auto max-w-[952px] px-5 pt-[clamp(56px,8vw,110px)] pb-[clamp(40px,5vw,64px)]">
		<Eyebrow class="mb-5">Engineering journal · Entry {String(index + 1).padStart(2, "0")}</Eyebrow>
		<h1
			class="max-w-[800px] font-display text-[clamp(38px,5vw,64px)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance text-ink"
		>
			{entry.data.title}
		</h1>
		<p class="mt-6 max-w-[640px] text-[clamp(17px,1.7vw,21px)] leading-[1.6] text-pretty text-ink-soft">
			{entry.data.blurb}
		</p>
		<div class="mt-7 flex gap-6 text-[13px] text-ink-mute">
			<span>{formatJournalDate(entry.data.date)}</span>
			<span>·</span>
			<span>{readTime} min read</span>
		</div>
	</header>

	<!-- Body: sticky contents + prose -->
	<div class="mx-auto flex max-w-[952px] items-start gap-16 px-5">
		{
			tocItems.length > 0 && (
				<nav class="sticky top-16 hidden w-[210px] flex-none pt-2 min-[960px]:block" aria-label="Contents">
					<p class="mb-4.5 text-[11px] tracking-[0.16em] uppercase text-ink-mute">Contents</p>
					<div class="relative pl-4.5">
						<div class="absolute top-0 bottom-0 left-0 w-px bg-[rgb(245_245_245/0.1)]" aria-hidden="true" />
						<div
							id="toc-bar"
							class="absolute top-0 left-0 h-9 w-px bg-copper transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
							aria-hidden="true"
						/>
						{tocItems.map((item) => (
							<button
								type="button"
								data-target={item.id}
								class="toc-link flex h-9 w-full cursor-pointer items-center text-left text-[13.5px] text-ink-mute transition-colors duration-300"
							>
								{item.label}
							</button>
						))}
					</div>
				</nav>
			)
		}

		<article class="journal-prose min-w-0 max-w-[660px] flex-1 pb-[clamp(56px,8vw,96px)]">
			<Content />
		</article>
	</div>

	<!-- Keep reading -->
	<section>
		<SectionLabel class="mx-auto max-w-[952px] px-5 pb-2">Keep reading</SectionLabel>
		<div
			class="mx-auto grid max-w-[952px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2 px-[min(20px,max(0px,calc((min(100vw,1440px)-912px)/2)))] pt-3 pb-[clamp(40px,6vw,72px)]"
		>
			{
				next && (
					<a
						href={`/work/departures/${next.id}`}
						class="tile flex min-h-[180px] flex-col justify-between gap-6 px-[clamp(20px,3vw,36px)] py-7"
					>
						<Eyebrow>Next in the journal</Eyebrow>
						<div class="flex items-end justify-between gap-4">
							<span class="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">{next.data.title}</span>
							<span class="text-xl text-ink-soft" aria-hidden="true">
								→
							</span>
						</div>
					</a>
				)
			}
			<a
				href="/work/departures"
				class="tile flex min-h-[180px] flex-col justify-between gap-6 px-[clamp(20px,3vw,36px)] py-7"
			>
				<Eyebrow>Case study</Eyebrow>
				<div class="flex items-end justify-between gap-4">
					<span class="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">Back to Departures</span>
					<span class="text-xl text-ink-soft" aria-hidden="true">→</span>
				</div>
			</a>
		</div>
	</section>
</Layout>

<style is:global>
	/* Essay typography for rendered MDX, mirroring the thoughts essays. */
	.journal-prose h2 {
		margin: 36px 0 18px;
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}
	.journal-prose > h2:first-child {
		margin-top: 8px;
	}
	.journal-prose p {
		margin-bottom: 22px;
		font-size: 17px;
		line-height: 1.75;
		text-wrap: pretty;
		color: var(--color-ink-soft);
	}
	.journal-prose strong {
		font-weight: 500;
		color: var(--color-ink);
	}
	.journal-prose a {
		color: var(--color-copper);
		text-underline-offset: 3px;
	}
	.journal-prose a:hover {
		text-decoration: underline;
	}
	.journal-prose ul,
	.journal-prose ol {
		margin: 0 0 22px;
		padding-left: 24px;
		font-size: 17px;
		line-height: 1.75;
		color: var(--color-ink-soft);
	}
	.journal-prose li {
		margin-bottom: 8px;
	}
	.journal-prose li::marker {
		color: var(--color-ink-mute);
	}
	.journal-prose code {
		padding: 2px 5px;
		border-radius: 4px;
		background: rgb(245 245 245 / 0.06);
		font-size: 0.88em;
	}
	.journal-prose pre {
		margin: 28px 0;
		padding: 20px 24px;
		border-radius: 8px;
		font-size: 14px;
		line-height: 1.65;
		overflow-x: auto;
		background-color: var(--color-card) !important;
	}
	.journal-prose pre code {
		padding: 0;
		background: none;
		font-size: inherit;
	}
	.toc-link[aria-current="true"] {
		color: var(--color-ink);
	}
</style>

<script>
	// Reading aids ported from the thoughts essays: copper progress bar at the
	// top of the viewport, and a sticky TOC whose copper bar tracks the section
	// in view. All elements are optional — stub entries have no TOC.
	const progress = document.getElementById("reading-progress");
	const bar = document.getElementById("toc-bar");
	const links = [...document.querySelectorAll<HTMLButtonElement>(".toc-link")];
	let active = -1;

	function onScroll() {
		let next = 0;
		links.forEach((link, i) => {
			const el = document.getElementById(link.dataset.target ?? "");
			if (el && el.getBoundingClientRect().top < 180) next = i;
		});

		const doc = document.documentElement;
		const max = doc.scrollHeight - window.innerHeight;
		if (progress) progress.style.width = `${(max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0).toFixed(2)}%`;

		// The last heading may never cross the activation threshold on short
		// viewports — treat reaching the bottom as reaching the last section.
		if (max > 0 && window.scrollY >= max - 2) next = links.length - 1;

		if (next !== active) {
			active = next;
			if (bar) bar.style.transform = `translateY(${active * 36}px)`;
			links.forEach((link, i) => link.setAttribute("aria-current", i === active ? "true" : "false"));
		}
	}

	links.forEach((link) => {
		link.addEventListener("click", () => {
			const el = document.getElementById(link.dataset.target ?? "");
			if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
		});
	});

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();
</script>
```

Note on heading anchors: Astro gives rendered Markdown headings slugified `id`s automatically, and `render(entry)` returns those same slugs in `headings`, so `data-target` matches without extra plugins.

- [ ] **Step 3: Verify entry pages render in dev**

```bash
cd "/Users/lawrencejob/Projects/Lawrence Job/website/.claude/worktrees/comment-work-thoughts-797beb"
bunx astro dev --background
curl -s http://localhost:4321/work/departures/breaking-out-of-swiftui-stacks | grep -c "Breaking out of SwiftUI stacks"
curl -s http://localhost:4321/work/departures/breaking-out-of-swiftui-stacks | grep -c 'aria-label="Contents"'
curl -s http://localhost:4321/work/departures/breaking-out-of-swiftui-stacks | grep -c "Building an in-memory graph database from scratch"
curl -s http://localhost:4321/work/departures/berth-level-analytics | grep -c "Next in the journal"
```

Expected: first grep ≥ 1 (title renders); second grep prints `0` (TOC hidden for headingless stub — note `grep -c` exits 1 on zero matches, which is fine); third grep ≥ 1 (next-entry tile shows the Jun 2025 entry, which follows Nov 2024 chronologically); fourth prints `0` (last entry has no next tile, only Back to Departures).

- [ ] **Step 4: Verify production build excludes drafts**

Run: `bun run build && ls dist/work/departures 2>/dev/null || echo "no departures dir"`

Expected: build passes; `dist/work/departures` contains only `index.html` (the case-study page) — no per-entry directories, since all six entries are drafts. (If `dist/work/departures` doesn't exist at all the build is broken — the case-study page must still be emitted.)

- [ ] **Step 5: Commit**

```bash
git add src/components/Figure.astro "src/pages/work/departures/[slug].astro"
git commit -m "Add journal entry essay route and Figure component"
```

---

### Task 3: Drive the Departures journal listing from the collection

**Files:**
- Modify: `src/pages/work/departures.astro:13-22` (delete hardcoded `journal` array, import helper) and `:78-105` (journal section markup)

**Interfaces:**
- Consumes: `getJournalEntries()`, `formatJournalDate(date)` from `src/lib/departures-journal.ts` (Task 1); entry pages at `/work/departures/<entry.id>` (Task 2).
- Produces: the final page — nothing downstream consumes it.

- [ ] **Step 1: Replace the hardcoded journal data**

In `src/pages/work/departures.astro`, delete the `journal` array (lines 13–22, the block starting `const journal = [` through its closing `];`) and add the helper import after the existing component imports, then load the entries:

```ts
import { formatJournalDate, getJournalEntries } from "../../lib/departures-journal";

const journal = await getJournalEntries();
```

- [ ] **Step 2: Rewrite the journal section markup**

Replace the entire `<!-- Engineering journal -->` section (the `<section>` at lines 78–105) with a collection-driven version. The section disappears entirely when nothing is publishable (production until essays land):

```astro
<!-- Engineering journal -->
{
	journal.length > 0 && (
		<section>
			<div class:list={["flex items-baseline gap-4 pt-8 pb-1.5", pagePad]}>
				<SectionLabel>Engineering journal</SectionLabel>
				<span class="text-[13px] text-ink-mute opacity-70">In the order they happened</span>
			</div>
			<div class:list={["flex flex-col gap-2 pt-3 pb-2", bleed]}>
				{journal.map((entry) => (
					<a
						href={`/work/departures/${entry.id}`}
						class="tile flex flex-wrap items-baseline gap-x-7 gap-y-2 px-[clamp(20px,3vw,40px)] py-6.5"
					>
						<span class="w-[84px] flex-none text-[13px] text-copper tabular-nums">
							{formatJournalDate(entry.data.date)}
						</span>
						<span class="min-w-[220px] flex-1">
							<span class="block font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
								{entry.data.title}
							</span>
							<span class="mt-1 block text-[14.5px] text-ink-mute">{entry.data.blurb}</span>
						</span>
						<span class="text-lg text-ink-soft" aria-hidden="true">
							→
						</span>
					</a>
				))}
			</div>
		</section>
	)
}
```

- [ ] **Step 3: Verify the listing in dev**

```bash
cd "/Users/lawrencejob/Projects/Lawrence Job/website/.claude/worktrees/comment-work-thoughts-797beb"
curl -s http://localhost:4321/work/departures | grep -c "/work/departures/"
curl -s http://localhost:4321/work/departures | grep -c "Nov 2023"
```

Expected: first grep ≥ 6 (six entry links); second ≥ 1 (oldest entry's date renders, confirming ascending sort puts ultra-high-performance first). Also open `http://localhost:4321/work/departures` in the browser: six entries in chronological order (Nov 2023 → Jul 2026), each clicking through to its essay page; hero canvas, "The project" cards and "Lessons learned" unchanged.

- [ ] **Step 4: Verify production build hides the section**

Run: `bun run build && grep -c "Engineering journal" dist/work/departures/index.html || echo "section absent"`

Expected: build passes and prints `section absent` (grep finds 0 matches — all entries are drafts, so the whole journal section is omitted from the production page).

- [ ] **Step 5: Stop the dev server and commit**

```bash
bunx astro dev stop
git add src/pages/work/departures.astro
git commit -m "Drive Departures engineering journal from content collection"
```

---

## Out of scope (per spec)

- The six essays themselves — written afterwards, one interview round per entry, flipping `draft: false` as each is approved. The PreferenceKey entry gets full technical depth; the rest are for tech-literate readers.
- Migrating thoughts essays to collections; changes to "The project" or "Lessons learned" sections.
