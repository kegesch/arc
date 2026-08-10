// arc diff <ref> [ref2]
import { colorId } from "../display/format.js";
import {
	diffEntityChanges,
	type EntityChange,
	type EntityDiff,
} from "../git.js";
import { readAllEntities, requireArcProject } from "../io/files.js";
import type { Entity } from "../types.js";

function describe(
	change: EntityChange,
	byId: Map<string, Entity>,
): { id: string; title: string; path: string } {
	return {
		id: change.id,
		title: byId.get(change.id)?.title ?? change.path,
		path: change.path,
	};
}

function renderGroup(
	label: string,
	changes: EntityChange[],
	byId: Map<string, Entity>,
): void {
	if (changes.length === 0) return;
	console.log(`\n${label} (${changes.length}):`);
	for (const change of changes) {
		const d = describe(change, byId);
		console.log(`${colorId(d.id)} ${d.title}`);
	}
}

export function diffCommand(
	refA: string,
	refB: string | undefined,
	options: { format?: string },
): void {
	requireArcProject();
	const dir = process.cwd();
	try {
		const diff: EntityDiff = diffEntityChanges(dir, refA, refB ?? "HEAD");
		const byId = new Map(readAllEntities(dir).map((e) => [e.id, e]));

		if (options.format === "json") {
			console.log(
				JSON.stringify(
					{
						added: diff.added.map((c) => describe(c, byId)),
						removed: diff.removed.map((c) => describe(c, byId)),
						modified: diff.modified.map((c) => describe(c, byId)),
					},
					null,
					2,
				),
			);
			return;
		}

		if (diff.added.length + diff.removed.length + diff.modified.length === 0) {
			console.log("No changes.");
			return;
		}

		renderGroup("Added", diff.added, byId);
		renderGroup("Removed", diff.removed, byId);
		renderGroup("Modified", diff.modified, byId);
	} catch (e) {
		console.error(e instanceof Error ? e.message : String(e));
		process.exit(1);
	}
}
