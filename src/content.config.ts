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
