// arc list [type]

import { formatEntityList } from "../display/format.js";
import { readAllEntities, requireArcProject } from "../io/files.js";
import type { Entity, EntityType } from "../types.js";
import { ENTITY_TYPE_ORDER, allTypes } from "../entities/registry.js";

// ─── Pure logic types ───

export interface ListFilterOptions {
	status?: string;
	tag?: string;
	context?: string;
}

export interface ListResult {
	entities: Entity[];
	grouped: Map<EntityType, Entity[]>;
}

// ─── Pure logic ───

export function getListResult(
	dir: string,
	typeFilter?: string,
	options?: ListFilterOptions,
): ListResult {
	let entities = readAllEntities(dir);

	if (options?.context) {
		entities = entities.filter(
			(e) =>
				e.context?.toLowerCase().includes(options.context!.toLowerCase()) ??
				false,
		);
	}

	if (typeFilter) {
		if (!allTypes().includes(typeFilter as EntityType)) {
			throw new Error(
				`Invalid type "${typeFilter}". Use: ${allTypes().join(", ")}`,
			);
		}
		entities = entities.filter((e) => e.type === typeFilter);
	}

	if (options?.status) {
		entities = entities.filter((e) => e.status === options.status);
	}

	if (options?.tag) {
		const tag = options.tag.toLowerCase();
		entities = entities.filter((e) =>
			e.tags.some((t) => t.toLowerCase().includes(tag)),
		);
	}

	const grouped = new Map<EntityType, Entity[]>();
	for (const e of entities) {
		if (!grouped.has(e.type)) grouped.set(e.type, []);
		grouped.get(e.type)!.push(e);
	}

	return { entities, grouped };
}

// ─── CLI entry point ───

export function listCommand(
	typeFilter?: string,
	options?: { status?: string; tag?: string; context?: string; format?: string },
): void {
	requireArcProject();

	const result = getListResult(process.cwd(), typeFilter, options);

	if (options?.format === "json") {
		const jsonEntities = result.entities.map((e) => ({
			id: e.id,
			title: e.title,
			type: e.type,
			status: e.status,
		}));
		console.log(JSON.stringify(jsonEntities, null, 2));
		return;
	}

	if (result.entities.length === 0) {
		console.log("No entities found.");
		return;
	}

	for (const t of ENTITY_TYPE_ORDER) {
		const group = result.grouped.get(t);
		if (!group || group.length === 0) continue;
		console.log(
			`\n${t.charAt(0).toUpperCase() + t.slice(1)}s (${group.length}):`,
		);
		console.log(formatEntityList(group));
	}
}
