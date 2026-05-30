import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createEntity } from "../src/commands/add";
import { performLink } from "../src/commands/link";
import {
	buildGraph,
	getDependencies,
	getDependents,
	impactAnalysis,
	traceUp,
} from "../src/graph/graph";
import { initArcDir, readEntityById, readAllEntities } from "../src/io/files";
import { parseEntity, serializeEntity } from "../src/io/parser";
import type { Decision, Entity, Requirement } from "../src/types";
import { VALID_EDGES } from "../src/entities/registry";

const TMP = join(import.meta.dir, "_tmp_depends_on");

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	initArcDir(TMP, "test-project");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("depends_on edge type", () => {
	test("performLink links two decisions with depends_on", () => {
		createEntity(TMP, { type: "decision", title: "Base decision" });
		createEntity(TMP, { type: "decision", title: "Derived decision" });

		const result = performLink(TMP, "D-002", "D-001", {
			type: "depends_on",
		});

		expect(result.edgeType).toBe("depends_on");
		expect(result.fromId).toBe("D-002");
		expect(result.toId).toBe("D-001");

		const d2 = readEntityById(TMP, "D-002")!;
		if (d2.type === "decision") {
			expect(d2.depends_on).toContain("D-001");
		}
	});

	test("traceUp follows depends_on edges", () => {
		const r1: Requirement = {
			type: "requirement",
			id: "R-001",
			title: "Encrypt data",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			derived_from: [],
			conflicts_with: [],
			requested_by: [],
		};
		const d1: Decision = {
			type: "decision",
			id: "D-001",
			title: "Use AES-256",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: ["R-001"],
			enables: [],
			depends_on: [],
			affects: [],
		};
		const d2: Decision = {
			type: "decision",
			id: "D-002",
			title: "Use TLS 1.3",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: ["D-001"],
			affects: [],
		};

		const g = buildGraph([r1, d1, d2]);
		const tree = traceUp(g, "D-002");

		expect(tree).not.toBeNull();
		expect(tree!.entity.id).toBe("D-002");
		expect(tree!.children.length).toBe(1);
		expect(tree!.children[0].entity.id).toBe("D-001");
		expect(tree!.children[0].edgeType).toBe("depends_on");

		// D-001's child is R-001 via driven_by
		expect(tree!.children[0].children.length).toBe(1);
		expect(tree!.children[0].children[0].entity.id).toBe("R-001");
	});

	test("impactAnalysis follows depends_on edges", () => {
		const d1: Decision = {
			type: "decision",
			id: "D-001",
			title: "Base decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: [],
			affects: [],
		};
		const d2: Decision = {
			type: "decision",
			id: "D-002",
			title: "Dependent decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: ["D-001"],
			affects: [],
		};
		const d3: Decision = {
			type: "decision",
			id: "D-003",
			title: "Further dependent",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: ["D-002"],
			affects: [],
		};

		const g = buildGraph([d1, d2, d3]);
		const result = impactAnalysis(g, "D-001");

		expect(result.direct.map((e) => e.id)).toContain("D-002");
		expect(result.transitive.map((e) => e.id)).toContain("D-003");
	});

	test("getDependencies returns entities depended on via depends_on", () => {
		const d1: Decision = {
			type: "decision",
			id: "D-001",
			title: "Base decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: [],
			affects: [],
		};
		const d2: Decision = {
			type: "decision",
			id: "D-002",
			title: "Dependent decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: ["D-001"],
			affects: [],
		};

		const g = buildGraph([d1, d2]);
		const deps = getDependencies(g, "D-002");

		expect(deps.map((e) => e.id)).toEqual(["D-001"]);
	});

	test("getDependents returns decisions that depend on a given decision", () => {
		const d1: Decision = {
			type: "decision",
			id: "D-001",
			title: "Base decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: [],
			affects: [],
		};
		const d2: Decision = {
			type: "decision",
			id: "D-002",
			title: "Dependent decision",
			status: "accepted",
			date: "2026-05-30",
			tags: [],
			body: "",
			filePath: "",
			driven_by: [],
			enables: [],
			depends_on: ["D-001"],
			affects: [],
		};

		const g = buildGraph([d1, d2]);
		const dependents = getDependents(g, "D-001");

		expect(dependents.map((e) => e.id)).toEqual(["D-002"]);
	});

	test("decision descriptor serializes and deserializes depends_on", () => {
		const content = `---
id: D-001
title: "Use AES-256"
status: accepted
date: 2026-05-30
tags: [crypto]
depends_on: [D-010]
driven_by: [R-001]
---

# Decision: Use AES-256

Body text.
`;
		const entity = parseEntity(content, "test.md");
		expect(entity.type).toBe("decision");
		if (entity.type === "decision") {
			expect(entity.depends_on).toEqual(["D-010"]);
		}

		const serialized = serializeEntity(entity);
		const reParsed = parseEntity(serialized, "test.md");
		expect(reParsed).toEqual(entity);
		if (reParsed.type === "decision") {
			expect(reParsed.depends_on).toEqual(["D-010"]);
		}
	});

	test("depends_on defaults to empty array when not present", () => {
		const content = `---
id: D-001
title: "Standalone decision"
status: proposed
date: 2026-05-30
---

Body.
`;
		const entity = parseEntity(content, "test.md");
		if (entity.type === "decision") {
			expect(entity.depends_on).toEqual([]);
		}
	});

	test("VALID_EDGES includes depends_on for decision-decision", () => {
		expect(VALID_EDGES["decision-decision"]).toContain("depends_on");
	});

	test("performLink rejects duplicate depends_on link", () => {
		createEntity(TMP, { type: "decision", title: "Base decision" });
		createEntity(TMP, { type: "decision", title: "Derived decision" });

		performLink(TMP, "D-002", "D-001", { type: "depends_on" });

		expect(() =>
			performLink(TMP, "D-002", "D-001", { type: "depends_on" }),
		).toThrow();
	});

	test("depends_on survives entity round-trip on disk", () => {
		createEntity(TMP, { type: "decision", title: "Base decision" });
		createEntity(TMP, { type: "decision", title: "Derived decision" });

		performLink(TMP, "D-002", "D-001", { type: "depends_on" });

		const allEntities = readAllEntities(TMP);
		const d2 = allEntities.find((e) => e.id === "D-002")!;
		if (d2.type === "decision") {
			expect(d2.depends_on).toEqual(["D-001"]);
		}
	});
});
