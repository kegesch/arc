// arc context — bundle entity with all related context

import { bold, dim } from "../display/format.js";
import { buildContextBundle } from "../graph/analysis.js";
import { readAllEntities, requireArcProject } from "../io/files.js";
import { buildGraph } from "../graph/graph.js";

export interface ContextOptions {
	format?: "text" | "json";
	context?: string;
	shallow?: boolean;
}

export function runContext(
	id: string,
	options?: { context?: string; shallow?: boolean },
) {
	let entities = readAllEntities();

	if (options?.context) {
		entities = entities.filter(
			(e) =>
				e.context?.toLowerCase().includes(options.context!.toLowerCase()) ??
				false,
		);
	}

	const graph = buildGraph(entities);
	return buildContextBundle(graph, id, options?.shallow ?? false);
}

function displayText(bundle: ReturnType<typeof runContext>, id: string): void {
	if (!bundle) {
		console.log(dim(`Entity ${id} not found.`));
		return;
	}

	console.log(
		bold(`ARC Context — ${bundle.entity.id}: ${bundle.entity.title}\n`),
	);

	const sections: { label: string; entities: typeof bundle.decisions }[] = [
		{ label: "Decisions", entities: bundle.decisions },
		{ label: "Use Cases", entities: bundle.use_cases },
		{ label: "Assumptions", entities: bundle.assumptions },
		{ label: "Risks", entities: bundle.risks },
		{ label: "Requirements", entities: bundle.requirements },
		{ label: "Visions", entities: bundle.visions },
	];

	for (const section of sections) {
		if (section.entities.length === 0) continue;
		console.log(dim(`  ${section.label}:`));
		for (const entity of section.entities) {
			console.log(`    ${entity.id} "${entity.title}"`);
		}
		console.log("");
	}
}

function displayJson(bundle: ReturnType<typeof runContext>): void {
	console.log(JSON.stringify(bundle, null, 2));
}

export function contextCommand(id: string, options?: ContextOptions): void {
	requireArcProject();

	const format = options?.format ?? "text";
	const bundle = runContext(id, {
		context: options?.context,
		shallow: options?.shallow,
	});

	if (format === "json") {
		displayJson(bundle);
	} else {
		displayText(bundle, id);
	}
}
