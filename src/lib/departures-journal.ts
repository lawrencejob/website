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
