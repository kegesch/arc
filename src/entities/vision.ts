import type { Entity, Vision } from "../types";
import type { EntityDescriptor, RawFrontmatter } from "./descriptor";

export const visionDescriptor: EntityDescriptor = {
	type: "vision",
	prefix: "V",
	folder: "visions",
	statuses: ["active", "retired"],
	defaultStatus: "active",
	ansiColor: "\x1b[38;5;208m",

	template: (title) =>
		[
			`# Vision: ${title}`,
			"",
			"## Purpose",
			"",
			"(What is this project trying to achieve?)",
			"",
			"## Success Criteria",
			"",
			"(How do we know we've succeeded?)",
			"",
			"## Direction",
			"",
			"(Where is this project heading?)",
		].join("\n"),

	parse: (meta: RawFrontmatter, base) => ({
		...base,
		type: "vision",
		status: (meta.status as Vision["status"]) ?? "active",
	}),

	serialize: () => [],

	edges: () => [],

	relFields: () => [],

	detailRelations: () => [],

	jsonFields: () => ({}),
};
