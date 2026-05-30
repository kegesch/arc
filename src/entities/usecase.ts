import type { EdgeType, UseCase } from "../types";
import type { EntityDescriptor, RawFrontmatter } from "./descriptor";

export const useCaseDescriptor: EntityDescriptor = {
	type: "use_case",
	prefix: "UC",
	folder: "use_cases",
	statuses: ["draft", "accepted", "deprecated"],
	defaultStatus: "draft",
	ansiColor: "\x1b[35m", // magenta

	template: (title) =>
		[
			`# Use Case: ${title}`,
			"",
			"## Description",
			"",
			"(Describe the use case)",
			"",
			"## Main Flow",
			"",
			"(Describe the main success scenario)",
			"",
			"## Acceptance Criteria",
			"",
			"(How do we know this is working?)",
		].join("\n"),

	parse: (meta: RawFrontmatter, base) => ({
		...base,
		type: "use_case",
		status: (meta.status as UseCase["status"]) ?? "draft",
		actors: meta.actors ?? [],
		preconditions: meta.preconditions ?? [],
		main_flow: meta.main_flow ?? [],
		acceptance_criteria: meta.acceptance_criteria ?? [],
		derived_from: meta.derived_from ?? [],
		requested_by: meta.requested_by ?? [],
	}),

	serialize: (entity) => {
		const e = entity as UseCase;
		const lines: string[] = [];
		if (e.actors.length > 0) {
			const quoted = e.actors.map((a) => `"${a}"`).join(", ");
			lines.push(`actors: [${quoted}]`);
		}
		if (e.preconditions.length > 0) {
			const quoted = e.preconditions.map((p) => `"${p}"`).join(", ");
			lines.push(`preconditions: [${quoted}]`);
		}
		if (e.main_flow.length > 0) {
			const steps = e.main_flow
				.map(
					(s) =>
						`{step: ${s.step}, actor: "${s.actor}", action: "${s.action}"}`,
				)
				.join(", ");
			lines.push(`main_flow: [${steps}]`);
		}
		if (e.acceptance_criteria.length > 0) {
			const quoted = e.acceptance_criteria.map((a) => `"${a}"`).join(", ");
			lines.push(`acceptance_criteria: [${quoted}]`);
		}
		if (e.derived_from.length > 0)
			lines.push(`derived_from: [${e.derived_from.join(", ")}]`);
		if (e.requested_by.length > 0)
			lines.push(`requested_by: [${e.requested_by.join(", ")}]`);
		return lines;
	},

	edges: (entity) => {
		const e = entity as UseCase;
		const result: Array<{ to: string; type: EdgeType }> = [];
		for (const parentId of e.derived_from ?? []) {
			result.push({ to: parentId, type: "derived_from" });
		}
		for (const stakeholderId of e.requested_by ?? []) {
			result.push({ to: stakeholderId, type: "requested_by" });
		}
		return result;
	},

	relFields: () => [
		{ field: "derived_from", edgeType: "derived_from", isArray: true },
		{ field: "requested_by", edgeType: "requested_by", isArray: true },
	],

	detailRelations: () => [],

	jsonFields: (entity) => {
		const e = entity as UseCase;
		return {
			actors: e.actors,
			preconditions: e.preconditions,
			main_flow: e.main_flow,
			acceptance_criteria: e.acceptance_criteria,
			derived_from: e.derived_from,
			requested_by: e.requested_by,
		};
	},
};
