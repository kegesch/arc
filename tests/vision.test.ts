import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createEntity } from "../src/commands/add";
import { performLink } from "../src/commands/link";
import { performRemove } from "../src/commands/remove";
import { performRename } from "../src/commands/rename";
import { buildGraph, getDependents, traceUp } from "../src/graph/graph";
import {
	findOrphans,
	findRequirementsWithoutVision,
	findStructuredFieldWarnings,
} from "../src/graph/analysis";
import { parseEntity, serializeEntity } from "../src/io/parser";
import { formatEntityDetail } from "../src/display/format";
import {
	initArcDir,
	readAllEntities,
	readEntityById,
	updateEntity,
} from "../src/io/files";
import type { Entity, Requirement, Vision } from "../src/types";
import { getTypeFromId } from "../src/types";
import { getDescriptor, VALID_EDGES } from "../src/entities/registry";
import { InvalidStatus } from "../src/core/errors";

const TMP = join(import.meta.dir, "_tmp_vision");

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	initArcDir(TMP, "test-project");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

// ─── Type registration ───

describe("vision type registration", () => {
	test("getTypeFromId returns 'vision' for V-001", () => {
		expect(getTypeFromId("V-001")).toBe("vision");
	});

	test("getTypeFromId throws for unknown prefix", () => {
		expect(() => getTypeFromId("X-001")).toThrow();
	});

	test("vision descriptor exists and has correct prefix", () => {
		const desc = getDescriptor("vision");
		expect(desc.type).toBe("vision");
		expect(desc.prefix).toBe("V");
	});

	test("vision is in ENTITY_TYPE_ORDER", () => {
		const { ENTITY_TYPE_ORDER } = require("../src/entities/registry");
		expect(ENTITY_TYPE_ORDER).toContain("vision");
	});
});

// ─── Vision creation ───

describe("vision creation via createEntity", () => {
	test("creates a vision with default active status", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Arc is the driver for agentic SE",
		});
		expect(result.entity.type).toBe("vision");
		expect(result.entity.id).toBe("V-001");
		expect(result.entity.status).toBe("active");
		expect(result.entity.title).toBe("Arc is the driver for agentic SE");
		expect(result.path).toContain("visions");
	});

	test("creates a vision with retired status", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Old direction",
			status: "retired",
		});
		expect(result.entity.status).toBe("retired");
	});

	test("creates a vision with tags and context", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Platform vision",
			tags: ["strategy", "core"],
			context: "platform",
		});
		expect(result.entity.tags).toEqual(["strategy", "core"]);
		expect(result.entity.context).toBe("platform");
	});

	test("throws InvalidStatus for bad vision status", () => {
		expect(() =>
			createEntity(TMP, {
				type: "vision",
				title: "Bad",
				status: "draft",
			}),
		).toThrow(InvalidStatus);
	});

	test("throws InvalidStatus for unknown status", () => {
		expect(() =>
			createEntity(TMP, {
				type: "vision",
				title: "Bad",
				status: "unknown",
			}),
		).toThrow(InvalidStatus);
	});

	test("persisted vision survives re-read", () => {
		createEntity(TMP, {
			type: "vision",
			title: "Project vision",
			tags: ["strategy"],
		});

		const entities = readAllEntities(TMP);
		expect(entities.length).toBe(1);

		const v = entities[0];
		expect(v.type).toBe("vision");
		expect(v.id).toBe("V-001");
		if (v.type === "vision") {
			expect(v.status).toBe("active");
		}
	});

	test("vision descriptor has no outgoing edges", () => {
		const desc = getDescriptor("vision");
		expect(desc.relFields()).toEqual([]);
		expect(desc.edges({} as Entity)).toEqual([]);
	});

	test("vision has no structured fields", () => {
		const desc = getDescriptor("vision");
		expect(desc.jsonFields({} as Entity)).toEqual({});
	});
});

// ─── Vision lifecycle ───

describe("vision lifecycle transitions", () => {
	test("active → retired via direct update", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		const v = readEntityById(TMP, "V-001")! as Vision;
		expect(v.status).toBe("active");

		v.status = "retired";
		updateEntity(TMP, v);

		const updated = readEntityById(TMP, "V-001")! as Vision;
		expect(updated.status).toBe("retired");
	});

	test("retired → active via direct update", () => {
		createEntity(TMP, { type: "vision", title: "Vision", status: "retired" });
		const v = readEntityById(TMP, "V-001")! as Vision;
		v.status = "active";
		updateEntity(TMP, v);

		const updated = readEntityById(TMP, "V-001")! as Vision;
		expect(updated.status).toBe("active");
	});

	test("only active and retired are valid statuses", () => {
		const desc = getDescriptor("vision");
		expect(desc.statuses).toEqual(["active", "retired"]);
	});
});

// ─── Vision serialization ───

describe("vision serialization", () => {
	test("serializes vision with no extra fields", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Project vision",
		});

		const content = serializeEntity(result.entity);
		expect(content).toContain("id: V-001");
		expect(content).toContain("title: Project vision");
		expect(content).toContain("status: active");
	});

	test("serialized vision survives parse round-trip", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Project vision",
			tags: ["strategy"],
		});

		const content = serializeEntity(result.entity);
		const reparsed = parseEntity(content, "test-v.md");
		expect(reparsed.type).toBe("vision");
		expect(reparsed.id).toBe("V-001");
		expect(reparsed.title).toBe("Project vision");
		if (reparsed.type === "vision") {
			expect(reparsed.status).toBe("active");
		}
	});
});

// ─── Vision relationships ───

describe("vision relationships", () => {
	test("requirement derived_from links to vision", () => {
		createEntity(TMP, { type: "vision", title: "Project vision" });
		createEntity(TMP, { type: "requirement", title: "Need traceability" });

		const result = performLink(TMP, "R-001", "V-001", {
			type: "derived_from",
		});
		expect(result.edgeType).toBe("derived_from");
		expect(result.fromId).toBe("R-001");
		expect(result.toId).toBe("V-001");

		const r = readEntityById(TMP, "R-001")! as Requirement;
		expect(r.derived_from).toContain("V-001");
	});

	test("requirement can derive from both vision and requirement", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Parent req" });
		createEntity(TMP, { type: "requirement", title: "Child req" });

		performLink(TMP, "R-002", "V-001", { type: "derived_from" });
		performLink(TMP, "R-002", "R-001", { type: "derived_from" });

		const r = readEntityById(TMP, "R-002")! as Requirement;
		expect(r.derived_from).toEqual(["V-001", "R-001"]);
	});

	test("link auto-infers derived_from for requirement→vision", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		const result = performLink(TMP, "R-001", "V-001");
		expect(result.edgeType).toBe("derived_from");
	});

	test("arc trace R-001 walks up to vision", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const tree = traceUp(graph, "R-001");
		expect(tree).not.toBeNull();
		expect(tree!.entity.id).toBe("R-001");
		expect(tree!.children.length).toBe(1);
		expect(tree!.children[0].entity.id).toBe("V-001");
	});

	test("vision has no incoming trace (terminal node)", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const tree = traceUp(graph, "V-001");
		expect(tree).not.toBeNull();
		expect(tree!.children.length).toBe(0);
	});

	test("vision is not flagged as orphan", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const orphans = findOrphans(graph);
		expect(orphans.length).toBe(0);
	});
});

// ─── Graph integration ───

describe("graph integration with vision", () => {
	test("graph includes vision entities", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		expect(graph.entities.has("V-001")).toBe(true);
	});

	test("vision has no outgoing edges", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		expect(graph.outgoing.get("V-001")?.length ?? 0).toBe(0);
	});

	test("vision shows as dependent in impact analysis for requirements", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const deps = getDependents(graph, "V-001");
		expect(deps.map((d) => d.id)).toContain("R-001");
	});
});

// ─── Remove and rename ───

describe("remove and rename with vision", () => {
	test("removes a vision with no dependents", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		const result = performRemove(TMP, "V-001");
		expect(result.removed.id).toBe("V-001");
		expect(readEntityById(TMP, "V-001")).toBeNull();
	});

	test("renames a vision", () => {
		createEntity(TMP, { type: "vision", title: "Old vision" });

		const result = performRename(TMP, "V-001", "V-050");
		expect(result.oldId).toBe("V-001");
		expect(result.newId).toBe("V-050");
		expect(readEntityById(TMP, "V-001")).toBeNull();
		expect(readEntityById(TMP, "V-050")).not.toBeNull();
	});

	test("rename vision propagates to requirement derived_from", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });
		performRename(TMP, "V-001", "V-050");

		const r = readEntityById(TMP, "R-001")! as Requirement;
		expect(r.derived_from).toContain("V-050");
		expect(r.derived_from).not.toContain("V-001");
	});

	test("remove vision cleans derived_from refs on requirements", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });
		performRemove(TMP, "V-001", { clean: true });

		const r = readEntityById(TMP, "R-001")! as Requirement;
		expect(r.derived_from).not.toContain("V-001");
	});
});

// ─── VALID_EDGES ───

describe("VALID_EDGES for vision", () => {
	test("includes requirement→vision derived_from", () => {
		expect(VALID_EDGES["requirement-vision"]).toEqual(["derived_from"]);
	});

	test("no valid edges from vision to any type", () => {
		expect(VALID_EDGES["vision-requirement"]).toBeUndefined();
		expect(VALID_EDGES["vision-decision"]).toBeUndefined();
		expect(VALID_EDGES["vision-vision"]).toBeUndefined();
	});
});

// ─── Rendering ───

describe("vision formatEntityDetail", () => {
	test("renders vision with id, title, status", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Arc is the driver for agentic SE",
		});

		const formatted = formatEntityDetail(result.entity);
		expect(formatted).toContain("V-001");
		expect(formatted).toContain("Arc is the driver for agentic SE");
		expect(formatted).toContain("vision");
		expect(formatted).toContain("active");
	});

	test("renders retired vision", () => {
		const result = createEntity(TMP, {
			type: "vision",
			title: "Old direction",
			status: "retired",
		});

		const formatted = formatEntityDetail(result.entity);
		expect(formatted).toContain("V-001");
		expect(formatted).toContain("retired");
	});
});

// ─── Vision check integration ───

describe("findRequirementsWithoutVision", () => {
	test("returns empty when no visions exist", () => {
		createEntity(TMP, {
			type: "requirement",
			title: "Req",
			status: "accepted",
		});

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(0);
	});

	test("warns about accepted requirements not linked to any vision", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Orphan req",
			status: "accepted",
		});

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(1);
		expect(warnings[0].entity.id).toBe("R-001");
	});

	test("does not warn about requirements linked to a vision", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Linked req",
			status: "accepted",
		});

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(0);
	});

	test("does not warn about draft requirements", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Draft req",
			status: "draft",
		});

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(0);
	});

	test("warns about multiple orphan requirements", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Req 1",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "requirement",
			title: "Req 2",
			status: "accepted",
		});

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(2);
	});

	test("does not warn about requirements that reach a vision transitively", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Pillar req",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "requirement",
			title: "Supporting req",
			status: "accepted",
		});

		performLink(TMP, "R-001", "V-001", { type: "derived_from" });
		performLink(TMP, "R-002", "R-001", { type: "derived_from" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(0);
	});

	test("warns about requirements whose derived_from chain never reaches a vision", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });
		createEntity(TMP, {
			type: "requirement",
			title: "Parent req",
			status: "accepted",
		});
		createEntity(TMP, {
			type: "requirement",
			title: "Child req",
			status: "accepted",
		});

		performLink(TMP, "R-002", "R-001", { type: "derived_from" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findRequirementsWithoutVision(graph);
		expect(warnings.length).toBe(2);
	});
});

// ─── Vision structured field validation ───

describe("vision structured field validation", () => {
	test("vision is not flagged for missing structured fields", () => {
		createEntity(TMP, { type: "vision", title: "Vision" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const warnings = findStructuredFieldWarnings(graph);
		expect(warnings.filter((w) => w.entity.id === "V-001").length).toBe(0);
	});
});
