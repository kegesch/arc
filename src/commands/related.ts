import { formatTraceTree } from "../display/format.js";
import { buildGraph, traceUp, type TraceNode } from "../graph/graph.js";
import { relatedEntityIds } from "../git.js";
import { readAllEntities, requireArcProject } from "../io/files.js";
import type { Entity } from "../types.js";

function traceNodeToJson(node: TraceNode): Record<string, unknown> {
	return {
		id: node.entity.id,
		title: node.entity.title,
		type: node.entity.type,
		status: node.entity.status,
		edgeType: node.edgeType,
		children: node.children.map(traceNodeToJson),
	};
}

export function relatedCommand(
	file: string,
	options: { format?: string },
): void {
	requireArcProject();
	const dir = process.cwd();
	try {
		const { ids, commitCount } = relatedEntityIds(dir, file);
		if (commitCount === 0) {
			console.error(`No commits found for ${file}.`);
			process.exit(1);
		}

		const graph = buildGraph(readAllEntities(dir));
		const related = ids
			.map((id) => graph.entities.get(id))
			.filter((e): e is Entity => e !== undefined);

		if (options.format === "json") {
			console.log(
				JSON.stringify(
					{
						file,
						related: related.map((e) => ({
							id: e.id,
							title: e.title,
							trace: traceNodeToJson(traceUp(graph, e.id)!),
						})),
					},
					null,
					2,
				),
			);
			return;
		}

		if (related.length === 0) {
			console.log("No related entities found.");
			return;
		}

		console.log(`Entities related to ${file}:`);
		for (const e of related) {
			console.log("");
			for (const line of formatTraceTree(traceUp(graph, e.id)!)) {
				console.log(line);
			}
		}
	} catch (e) {
		console.error(e instanceof Error ? e.message : String(e));
		process.exit(1);
	}
}
