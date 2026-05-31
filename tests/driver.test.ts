import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createEntity } from "../src/commands/add";
import { performLink } from "../src/commands/link";
import { buildGraph } from "../src/graph/graph";
import {
	findNextCategories,
	buildContextBundle,
	findDecisionsWithoutUseCases,
} from "../src/graph/analysis";
import { initArcDir, readAllEntities } from "../src/io/files";

const TMP = join(import.meta.dir, "_tmp_driver");

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	initArcDir(TMP, "test-project");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

// ─── findNextCategories ───

describe("findNextCategories", () => {
	test("returns empty categories for empty graph", () => {
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.ready).toHaveLength(0);
		expect(cats.needs_use_cases).toHaveLength(0);
		expect(cats.needs_design).toHaveLength(0);
		expect(cats.risky).toHaveLength(0);
		expect(cats.orphan).toHaveLength(0);
	});

	test("requirement with accepted decisions and use cases is ready", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Search",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "decision",
			title: "Use search lib",
			drivenBy: ["R-001"],
			status: "accepted",
		});
		createEntity(TMP, {
			type: "use_case",
			title: "Search entities",
			derivedFrom: ["R-001"],
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.ready).toHaveLength(1);
		expect(cats.ready[0]!.id).toBe("R-001");
	});

	test("requirement with accepted decisions but no use cases needs use cases", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Search",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "decision",
			title: "Use search lib",
			drivenBy: ["R-001"],
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.needs_use_cases).toHaveLength(1);
		expect(cats.needs_use_cases[0]!.id).toBe("R-001");
	});

	test("requirement with no accepted decisions needs design", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Search",
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.needs_design).toHaveLength(1);
		expect(cats.needs_design[0]!.id).toBe("R-001");
	});

	test("requirement with only proposed decisions still needs design", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Search",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "decision",
			title: "Maybe later",
			drivenBy: ["R-001"],
			status: "proposed",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.needs_design).toHaveLength(1);
	});

	test("unvalidated assumption backing accepted decision is risky", () => {
		createEntity(TMP, { type: "assumption", title: "Fast enough" });
		createEntity(TMP, {
			type: "decision",
			title: "Use in-memory graph",
			drivenBy: ["A-001"],
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.risky).toHaveLength(1);
		expect(cats.risky[0]!.id).toBe("A-001");
	});

	test("validated assumption is not risky even if backing accepted decision", () => {
		createEntity(TMP, {
			type: "assumption",
			title: "Fast enough",
			status: "validated",
		});
		createEntity(TMP, {
			type: "decision",
			title: "Use in-memory graph",
			drivenBy: ["A-001"],
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.risky).toHaveLength(0);
	});

	test("decision with no driven_by is orphan", () => {
		createEntity(TMP, { type: "decision", title: "Use TypeScript" });
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.orphan).toHaveLength(1);
		expect(cats.orphan[0]!.id).toBe("D-001");
	});

	test("decision with driven_by is not orphan", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Need runtime",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "decision",
			title: "Use TypeScript",
			drivenBy: ["R-001"],
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.orphan).toHaveLength(0);
	});

	test("draft requirement is not categorized", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Future feature",
			status: "draft",
		});
		const g = buildGraph(readAllEntities(TMP));
		const cats = findNextCategories(g);
		expect(cats.ready).toHaveLength(0);
		expect(cats.needs_use_cases).toHaveLength(0);
		expect(cats.needs_design).toHaveLength(0);
	});
});

// ─── buildContextBundle ───

describe("buildContextBundle", () => {
	test("returns null for nonexistent entity", () => {
		const g = buildGraph(readAllEntities(TMP));
		expect(buildContextBundle(g, "R-999")).toBeNull();
	});

	test("returns entity with empty related lists for isolated entity", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Alone",
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const bundle = buildContextBundle(g, "R-001")!;
		expect(bundle.entity.id).toBe("R-001");
		expect(bundle.decisions).toHaveLength(0);
		expect(bundle.requirements).toHaveLength(0);
	});

	test("shallow mode returns direct neighbors only", () => {
		createEntity(TMP, { type: "requirement", title: "R1", status: "accepted" });
		createEntity(TMP, {
			type: "decision",
			title: "D1",
			drivenBy: ["R-001"],
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const bundle = buildContextBundle(g, "R-001", true)!;
		expect(bundle.decisions).toHaveLength(1);
		expect(bundle.decisions[0]!.id).toBe("D-001");
	});

	test("full closure traverses transitively", () => {
		createEntity(TMP, { type: "requirement", title: "R1", status: "accepted" });
		createEntity(TMP, {
			type: "decision",
			title: "D1",
			drivenBy: ["R-001"],
			status: "accepted",
		});
		createEntity(TMP, { type: "assumption", title: "A1" });
		performLink(TMP, "D-001", "A-001", { type: "driven_by" });
		const g = buildGraph(readAllEntities(TMP));
		const bundle = buildContextBundle(g, "R-001", false)!;
		expect(bundle.decisions).toHaveLength(1);
		expect(bundle.assumptions).toHaveLength(1);
		expect(bundle.assumptions[0]!.id).toBe("A-001");
	});

	test("shallow mode does not traverse transitively", () => {
		createEntity(TMP, { type: "requirement", title: "R1", status: "accepted" });
		createEntity(TMP, {
			type: "decision",
			title: "D1",
			drivenBy: ["R-001"],
			status: "accepted",
		});
		createEntity(TMP, { type: "assumption", title: "A1" });
		performLink(TMP, "D-001", "A-001", { type: "driven_by" });
		const g = buildGraph(readAllEntities(TMP));
		const bundle = buildContextBundle(g, "R-001", true)!;
		expect(bundle.decisions).toHaveLength(1);
		expect(bundle.assumptions).toHaveLength(0);
	});
});

// ─── findDecisionsWithoutUseCases ───

describe("findDecisionsWithoutUseCases", () => {
	test("returns empty for empty graph", () => {
		const g = buildGraph(readAllEntities(TMP));
		expect(findDecisionsWithoutUseCases(g)).toHaveLength(0);
	});

	test("decision without context is not warned", () => {
		createEntity(TMP, {
			type: "decision",
			title: "Use TypeScript",
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		expect(findDecisionsWithoutUseCases(g)).toHaveLength(0);
	});

	test("decision with context but no use case is warned", () => {
		createEntity(TMP, {
			type: "decision",
			title: "Search strategy",
			context: "core",
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		const warnings = findDecisionsWithoutUseCases(g);
		expect(warnings).toHaveLength(1);
		expect(warnings[0]!.entity.id).toBe("D-001");
	});

	test("decision with context and use case is not warned", () => {
		createEntity(TMP, {
			type: "decision",
			title: "Search strategy",
			context: "core",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "use_case",
			title: "Search entities",
			derivedFrom: ["D-001"],
		});
		const g = buildGraph(readAllEntities(TMP));
		expect(findDecisionsWithoutUseCases(g)).toHaveLength(0);
	});

	test("proposed decision with context is not warned", () => {
		createEntity(TMP, {
			type: "decision",
			title: "Maybe",
			status: "proposed",
			context: "core",
		});
		const g = buildGraph(readAllEntities(TMP));
		expect(findDecisionsWithoutUseCases(g)).toHaveLength(0);
	});

	test("accepted decision without context is never warned regardless of use cases", () => {
		createEntity(TMP, {
			type: "decision",
			title: "No context",
			status: "accepted",
		});
		const g = buildGraph(readAllEntities(TMP));
		expect(findDecisionsWithoutUseCases(g)).toHaveLength(0);
	});
});
