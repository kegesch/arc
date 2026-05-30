import type { EdgeType, EntityModel } from "../types";
import type {
	EntityDescriptor,
	RawFrontmatter,
} from "./descriptor";

export const entityModelDescriptor: EntityDescriptor = {
	type: "entity_model",
	prefix: "EM",
	folder: "entity_models",
	statuses: ["draft", "accepted", "deprecated"],
	defaultStatus: "draft",
	ansiColor: "\x1b[33m", // yellow

	template: (title) =>
		[
			`# Entity Model: ${title}`,
			"",
			"## Entities",
			"",
			"(Describe the entities and their relationships)",
			"",
			"## Context",
			"",
			"(What domain does this model belong to?)",
		].join("\n"),

	parse: (meta: RawFrontmatter, base) => ({
		...base,
		type: "entity_model",
		status: (meta.status as EntityModel["status"]) ?? "draft",
		entities: meta.entities ?? [],
		derived_from: meta.derived_from ?? [],
	}),

	serialize: (entity) => {
		const e = entity as EntityModel;
		const lines: string[] = [];
		if (e.entities.length > 0) {
			const serialized = e.entities
				.map((ent) => {
					const attrs = ent.attributes
						.map((attr) => {
							const parts = [`name: ${attr.name}`, `type: ${attr.type}`, `required: ${attr.required}`];
							if (attr.length !== undefined) parts.push(`length: ${attr.length}`);
							if (attr.unique) parts.push(`unique: true`);
							return `{${parts.join(", ")}}`;
						})
						.join(", ");
					const rels = ent.relationships
						.map((rel) => `{target: ${rel.target}, type: ${rel.type}}`)
						.join(", ");
					const parts = [`name: ${ent.name}`, `attributes: [${attrs}]`];
					if (ent.relationships.length > 0) parts.push(`relationships: [${rels}]`);
					return `{${parts.join(", ")}}`;
				})
				.join(", ");
			lines.push(`entities: [${serialized}]`);
		}
		if (e.derived_from.length > 0)
			lines.push(`derived_from: [${e.derived_from.join(", ")}]`);
		return lines;
	},

	edges: (entity) => {
		const e = entity as EntityModel;
		const result: Array<{ to: string; type: EdgeType }> = [];
		for (const parentId of e.derived_from ?? []) {
			result.push({ to: parentId, type: "derived_from" });
		}
		return result;
	},

	relFields: () => [
		{ field: "derived_from", edgeType: "derived_from", isArray: true },
	],

	detailRelations: () => [],

	jsonFields: (entity) => {
		const e = entity as EntityModel;
		return {
			entities: e.entities,
			derived_from: e.derived_from,
		};
	},
};
