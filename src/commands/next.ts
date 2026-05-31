// arc next — categorize entities for next steps

import { bold, dim, cyan, green, yellow, red } from "../display/format.js";
import { findNextCategories } from "../graph/analysis.js";
import { readAllEntities, requireArcProject } from "../io/files.js";
import { buildGraph } from "../graph/graph.js";

export interface NextOptions {
	format?: "text" | "json";
	context?: string;
}

export function runNext(contextFilter?: string) {
	let entities = readAllEntities();

	if (contextFilter) {
		entities = entities.filter(
			(e) =>
				e.context?.toLowerCase().includes(contextFilter.toLowerCase()) ?? false,
		);
	}

	const graph = buildGraph(entities);
	return findNextCategories(graph);
}

function displayText(categories: ReturnType<typeof runNext>): void {
	console.log(bold("ARC Next — What should I work on?\n"));

	const sections: { label: string; entities: typeof categories.ready; color: typeof green }[] = [
		{ label: "Ready to implement", entities: categories.ready, color: green },
		{ label: "Needs use cases", entities: categories.needs_use_cases, color: cyan },
		{ label: "Needs design", entities: categories.needs_design, color: yellow },
		{ label: "Risky assumptions", entities: categories.risky, color: red },
		{ label: "Orphan decisions", entities: categories.orphan, color: dim },
	];

	let hasOutput = false;
	for (const section of sections) {
		if (section.entities.length === 0) continue;
		hasOutput = true;
		console.log(section.color(`  ${section.label}:`));
		for (const entity of section.entities) {
			console.log(`    ${entity.id} "${entity.title}"`);
		}
		console.log("");
	}

	if (!hasOutput) {
		console.log(green("  Nothing actionable. The graph is complete."));
	}
}

function displayJson(categories: ReturnType<typeof runNext>): void {
	console.log(JSON.stringify(categories, null, 2));
}

export function nextCommand(options?: NextOptions): void {
	requireArcProject();

	const format = options?.format ?? "text";
	const categories = runNext(options?.context);

	if (format === "json") {
		displayJson(categories);
	} else {
		displayText(categories);
	}
}
