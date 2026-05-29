import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createEntity } from "../src/commands/add";
import { performLink } from "../src/commands/link";
import { performRemove } from "../src/commands/remove";
import { performRename } from "../src/commands/rename";
import {
	buildGraph,
	getDependents,
	impactAnalysis,
	traceUp,
} from "../src/graph/graph";
import {
	findOrphans,
} from "../src/graph/analysis";
import {
	serializeEntity,
} from "../src/io/parser";
import {
	initArcDir,
	readAllEntities,
	readEntityById,
	updateEntity,
} from "../src/io/files";
import type {
	Decision,
	Entity,
	Requirement,
	Risk,
	Stakeholder,
	Term,
} from "../src/types";
import { getDescriptor, VALID_EDGES } from "../src/entities/registry";
import { InvalidStatus } from "../src/core/errors";

const TMP = join(import.meta.dir, "_tmp_new_types");

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	initArcDir(TMP, "test-project");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

// ─── Stakeholder creation ───

describe("stakeholder creation via createEntity", () => {
	test("creates a stakeholder with default active status", () => {
		const result = createEntity(TMP, {
			type: "stakeholder",
			title: "Warehouse team",
		});
		expect(result.entity.type).toBe("stakeholder");
		expect(result.entity.id).toBe("S-001");
		expect(result.entity.status).toBe("active");
		expect(result.entity.title).toBe("Warehouse team");
		expect(result.path).toContain("stakeholders");
	});

	test("creates a stakeholder with explicit status", () => {
		const result = createEntity(TMP, {
			type: "stakeholder",
			title: "Finance team",
			status: "inactive",
		});
		expect(result.entity.status).toBe("inactive");
	});

	test("creates a stakeholder with tags and context", () => {
		const result = createEntity(TMP, {
			type: "stakeholder",
			title: "Ops team",
			tags: ["operations", "internal"],
			context: "billing",
		});
		expect(result.entity.tags).toEqual(["operations", "internal"]);
		expect(result.entity.context).toBe("billing");
	});

	test("throws InvalidStatus for bad status", () => {
		expect(() =>
			createEntity(TMP, {
				type: "stakeholder",
				title: "Bad",
				status: "unknown",
			}),
		).toThrow(InvalidStatus);
	});

	test("persisted stakeholder survives re-read", () => {
		createEntity(TMP, {
			type: "stakeholder",
			title: "Warehouse team",
			tags: ["ops"],
		});

		const entities = readAllEntities(TMP);
		expect(entities.length).toBe(1);

		const s = entities[0];
		expect(s.type).toBe("stakeholder");
		expect(s.id).toBe("S-001");
		expect(s.title).toBe("Warehouse team");
		expect(s.tags).toEqual(["ops"]);
		if (s.type === "stakeholder") {
			expect(s.status).toBe("active");
		}
	});

	test("stakeholder descriptor has no outgoing edges", () => {
		const desc = getDescriptor("stakeholder");
		expect(desc.relFields()).toEqual([]);
		expect(desc.edges({} as Entity)).toEqual([]);
	});
});

// ─── Stakeholder lifecycle ───

describe("stakeholder lifecycle transitions", () => {
	test("active → inactive via direct update", () => {
		createEntity(TMP, { type: "stakeholder", title: "Ops team" });
		const s = readEntityById(TMP, "S-001")! as Stakeholder;
		expect(s.status).toBe("active");

		s.status = "inactive";
		updateEntity(TMP, s);

		const updated = readEntityById(TMP, "S-001")! as Stakeholder;
		expect(updated.status).toBe("inactive");
	});

	test("inactive → active via direct update", () => {
		createEntity(TMP, {
			type: "stakeholder",
			title: "Ops team",
			status: "inactive",
		});
		const s = readEntityById(TMP, "S-001")! as Stakeholder;
		s.status = "active";
		updateEntity(TMP, s);

		const updated = readEntityById(TMP, "S-001")! as Stakeholder;
		expect(updated.status).toBe("active");
	});

	test("lifecycle round-trip preserves all statuses", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		const s = readEntityById(TMP, "S-001")! as Stakeholder;

		s.status = "inactive";
		updateEntity(TMP, s);
		expect((readEntityById(TMP, "S-001")! as Stakeholder).status).toBe("inactive");

		s.status = "active";
		updateEntity(TMP, s);
		expect((readEntityById(TMP, "S-001")! as Stakeholder).status).toBe("active");
	});
});

// ─── Stakeholder relationships ───

describe("stakeholder relationships", () => {
	test("requirement requested_by links to stakeholder", () => {
		createEntity(TMP, { type: "stakeholder", title: "Warehouse team" });
		createEntity(TMP, { type: "requirement", title: "Fast order processing" });

		const result = performLink(TMP, "R-001", "S-001", { type: "requested_by" });
		expect(result.edgeType).toBe("requested_by");
		expect(result.fromId).toBe("R-001");
		expect(result.toId).toBe("S-001");

		const r = readEntityById(TMP, "R-001")! as Requirement;
		expect(r.requested_by).toContain("S-001");
	});

	test("decision affects links to stakeholder", () => {
		createEntity(TMP, { type: "stakeholder", title: "Finance team" });
		createEntity(TMP, { type: "decision", title: "Change billing process" });

		const result = performLink(TMP, "D-001", "S-001", { type: "affects" });
		expect(result.edgeType).toBe("affects");

		const d = readEntityById(TMP, "D-001")! as Decision;
		expect(d.affects).toContain("S-001");
	});

	test("stakeholder shows as dependent in impact analysis", () => {
		createEntity(TMP, { type: "stakeholder", title: "Finance team" });
		createEntity(TMP, { type: "decision", title: "New process" });

		performLink(TMP, "D-001", "S-001", { type: "affects" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const deps = getDependents(graph, "S-001");
		expect(deps.map((d) => d.id)).toContain("D-001");
	});

	test("impact analysis includes affected stakeholders", () => {
		createEntity(TMP, { type: "stakeholder", title: "Finance team" });
		createEntity(TMP, { type: "decision", title: "New process" });

		performLink(TMP, "D-001", "S-001", { type: "affects" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const result = impactAnalysis(graph, "S-001");
		expect(result.direct.map((e) => e.id)).toContain("D-001");
	});

	test("link auto-infers requested_by for requirement→stakeholder", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		createEntity(TMP, { type: "requirement", title: "Req" });

		const result = performLink(TMP, "R-001", "S-001");
		expect(result.edgeType).toBe("requested_by");
	});

	test("link auto-infers affects for decision→stakeholder", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		createEntity(TMP, { type: "decision", title: "Dec" });

		const result = performLink(TMP, "D-001", "S-001");
		expect(result.edgeType).toBe("affects");
	});
});

// ─── Risk creation ───

describe("risk creation via createEntity", () => {
	test("creates a risk with default identified status", () => {
		const result = createEntity(TMP, {
			type: "risk",
			title: "Payment provider downtime",
		});
		expect(result.entity.type).toBe("risk");
		expect(result.entity.id).toBe("K-001");
		expect(result.entity.status).toBe("identified");
		expect(result.entity.title).toBe("Payment provider downtime");
		expect(result.path).toContain("risks");
	});

	test("creates a risk with explicit status", () => {
		const result = createEntity(TMP, {
			type: "risk",
			title: "Data loss",
			status: "mitigated",
		});
		expect(result.entity.status).toBe("mitigated");
	});

	test("creates a risk with tags and context", () => {
		const result = createEntity(TMP, {
			type: "risk",
			title: "Security breach",
			tags: ["security", "critical"],
			context: "billing",
		});
		expect(result.entity.tags).toEqual(["security", "critical"]);
		expect(result.entity.context).toBe("billing");
	});

	test("throws InvalidStatus for bad risk status", () => {
		expect(() =>
			createEntity(TMP, {
				type: "risk",
				title: "Bad",
				status: "unknown",
			}),
		).toThrow(InvalidStatus);
	});

	test("persisted risk survives re-read", () => {
		createEntity(TMP, {
			type: "risk",
			title: "Payment downtime",
			tags: ["payment"],
		});

		const entities = readAllEntities(TMP);
		expect(entities.length).toBe(1);

		const k = entities[0];
		expect(k.type).toBe("risk");
		expect(k.id).toBe("K-001");
		if (k.type === "risk") {
			expect(k.status).toBe("identified");
			expect(k.mitigated_by).toEqual([]);
		}
	});

	test("risk descriptor has mitigated_by relationship field", () => {
		const desc = getDescriptor("risk");
		const fields = desc.relFields();
		expect(fields.length).toBe(1);
		expect(fields[0].field).toBe("mitigated_by");
		expect(fields[0].edgeType).toBe("mitigated_by");
		expect(fields[0].isArray).toBe(true);
	});
});

// ─── Risk lifecycle ───

describe("risk lifecycle transitions", () => {
	test("identified → mitigated via direct update", () => {
		createEntity(TMP, { type: "risk", title: "Payment downtime" });
		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.status).toBe("identified");

		k.status = "mitigated";
		updateEntity(TMP, k);

		const updated = readEntityById(TMP, "K-001")! as Risk;
		expect(updated.status).toBe("mitigated");
	});

	test("mitigated → closed via direct update", () => {
		createEntity(TMP, { type: "risk", title: "Risk", status: "mitigated" });
		const k = readEntityById(TMP, "K-001")! as Risk;
		k.status = "closed";
		updateEntity(TMP, k);

		const updated = readEntityById(TMP, "K-001")! as Risk;
		expect(updated.status).toBe("closed");
	});

	test("identified → accepted via direct update", () => {
		createEntity(TMP, { type: "risk", title: "Risk" });
		const k = readEntityById(TMP, "K-001")! as Risk;
		k.status = "accepted";
		updateEntity(TMP, k);

		expect((readEntityById(TMP, "K-001")! as Risk).status).toBe("accepted");
	});

	test("identified → materialized via direct update", () => {
		createEntity(TMP, { type: "risk", title: "Risk" });
		const k = readEntityById(TMP, "K-001")! as Risk;
		k.status = "materialized";
		updateEntity(TMP, k);

		expect((readEntityById(TMP, "K-001")! as Risk).status).toBe("materialized");
	});

	test("risk serialization includes mitigated_by", () => {
		createEntity(TMP, { type: "decision", title: "Mitigation" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.mitigated_by).toEqual(["D-001"]);

		const content = serializeEntity(k);
		expect(content).toContain("mitigated_by: [D-001]");
	});
});

// ─── Risk relationships ───

describe("risk relationships", () => {
	test("risk mitigated_by links to decision", () => {
		createEntity(TMP, { type: "decision", title: "Mitigation decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		const result = performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });
		expect(result.edgeType).toBe("mitigated_by");

		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.mitigated_by).toEqual(["D-001"]);
	});

	test("link auto-infers mitigated_by for risk→decision", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		const result = performLink(TMP, "K-001", "D-001");
		expect(result.edgeType).toBe("mitigated_by");
	});

	test("risk shows as dependent of its mitigation decision", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const deps = getDependents(graph, "D-001");
		expect(deps.map((d) => d.id)).toContain("K-001");
	});

	test("impact analysis on decision includes mitigated risks", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const result = impactAnalysis(graph, "D-001");
		expect(result.direct.map((e) => e.id)).toContain("K-001");
	});

	test("traceUp does not follow mitigated_by edges", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const tree = traceUp(graph, "K-001");
		expect(tree).not.toBeNull();
		expect(tree!.children.length).toBe(0);
	});

	test("multiple decisions can mitigate a risk", () => {
		createEntity(TMP, { type: "decision", title: "Mitigation 1" });
		createEntity(TMP, { type: "decision", title: "Mitigation 2" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });
		performLink(TMP, "K-001", "D-002", { type: "mitigated_by" });

		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.mitigated_by).toEqual(["D-001", "D-002"]);
	});
});

// ─── Term creation ───

describe("term creation via createEntity", () => {
	test("creates a term with default draft status", () => {
		const result = createEntity(TMP, {
			type: "term",
			title: "Order",
		});
		expect(result.entity.type).toBe("term");
		expect(result.entity.id).toBe("T-001");
		expect(result.entity.status).toBe("draft");
		expect(result.entity.title).toBe("Order");
		expect(result.path).toContain("terms");
	});

	test("creates a term with explicit status", () => {
		const result = createEntity(TMP, {
			type: "term",
			title: "Fulfillment",
			status: "accepted",
		});
		expect(result.entity.status).toBe("accepted");
	});

	test("creates a term with tags and context", () => {
		const result = createEntity(TMP, {
			type: "term",
			title: "SKU",
			tags: ["inventory"],
			context: "warehouse",
		});
		expect(result.entity.tags).toEqual(["inventory"]);
		expect(result.entity.context).toBe("warehouse");
	});

	test("throws InvalidStatus for bad term status", () => {
		expect(() =>
			createEntity(TMP, {
				type: "term",
				title: "Bad",
				status: "unknown",
			}),
		).toThrow(InvalidStatus);
	});

	test("persisted term survives re-read", () => {
		createEntity(TMP, {
			type: "term",
			title: "Order",
			tags: ["domain"],
		});

		const entities = readAllEntities(TMP);
		expect(entities.length).toBe(1);

		const t = entities[0];
		expect(t.type).toBe("term");
		expect(t.id).toBe("T-001");
		if (t.type === "term") {
			expect(t.status).toBe("draft");
		}
	});

	test("term descriptor has no outgoing edges", () => {
		const desc = getDescriptor("term");
		expect(desc.relFields()).toEqual([]);
		expect(desc.edges({} as Entity)).toEqual([]);
	});
});

// ─── Term lifecycle ───

describe("term lifecycle transitions", () => {
	test("draft → accepted via direct update", () => {
		createEntity(TMP, { type: "term", title: "Order" });
		const t = readEntityById(TMP, "T-001")! as Term;
		expect(t.status).toBe("draft");

		t.status = "accepted";
		updateEntity(TMP, t);

		const updated = readEntityById(TMP, "T-001")! as Term;
		expect(updated.status).toBe("accepted");
	});

	test("accepted → deprecated via direct update", () => {
		createEntity(TMP, { type: "term", title: "Order", status: "accepted" });
		const t = readEntityById(TMP, "T-001")! as Term;
		t.status = "deprecated";
		updateEntity(TMP, t);

		expect((readEntityById(TMP, "T-001")! as Term).status).toBe("deprecated");
	});

	test("term cannot be linked to other entities", () => {
		createEntity(TMP, { type: "term", title: "Order" });
		createEntity(TMP, { type: "decision", title: "Decision" });

		expect(() => performLink(TMP, "T-001", "D-001")).toThrow();
	});
});

// ─── Graph integration with new types ───

describe("graph integration with stakeholder/risk/term", () => {
	test("graph includes all new entity types", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		createEntity(TMP, { type: "risk", title: "Risk" });
		createEntity(TMP, { type: "term", title: "Term" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		expect(graph.entities.size).toBe(3);
		expect(graph.entities.has("S-001")).toBe(true);
		expect(graph.entities.has("K-001")).toBe(true);
		expect(graph.entities.has("T-001")).toBe(true);
	});

	test("stakeholder has no outgoing edges", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		expect(graph.outgoing.get("S-001")?.length ?? 0).toBe(0);
	});

	test("term has no outgoing edges", () => {
		createEntity(TMP, { type: "term", title: "Term" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		expect(graph.outgoing.get("T-001")?.length ?? 0).toBe(0);
	});

	test("risk has mitigated_by outgoing edges", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });

		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const outgoing = graph.outgoing.get("K-001") ?? [];
		expect(outgoing.length).toBe(1);
		expect(outgoing[0].to).toBe("D-001");
	});
});

// ─── Remove and rename with new types ───

describe("remove and rename with new types", () => {
	test("remove stakeholder with no dependents", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		const result = performRemove(TMP, "S-001");
		expect(result.removed.id).toBe("S-001");
		expect(readEntityById(TMP, "S-001")).toBeNull();
	});

	test("remove risk with no dependents", () => {
		createEntity(TMP, { type: "risk", title: "Risk" });
		const result = performRemove(TMP, "K-001");
		expect(result.removed.id).toBe("K-001");
		expect(readEntityById(TMP, "K-001")).toBeNull();
	});

	test("remove term", () => {
		createEntity(TMP, { type: "term", title: "Term" });
		const result = performRemove(TMP, "T-001");
		expect(result.removed.id).toBe("T-001");
		expect(readEntityById(TMP, "T-001")).toBeNull();
	});

	test("remove risk and clean mitigated_by refs", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });
		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		const result = performRemove(TMP, "D-001", { clean: true });
		expect(result.cleanedRefs).toEqual(["K-001"]);

		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.mitigated_by).toEqual([]);
	});

	test("rename stakeholder updates file", () => {
		createEntity(TMP, { type: "stakeholder", title: "Old name" });

		const result = performRename(TMP, "S-001", "S-050");
		expect(result.oldId).toBe("S-001");
		expect(result.newId).toBe("S-050");
		expect(readEntityById(TMP, "S-001")).toBeNull();
		expect(readEntityById(TMP, "S-050")).not.toBeNull();
	});

	test("rename risk updates file", () => {
		createEntity(TMP, { type: "risk", title: "Old risk" });

		const result = performRename(TMP, "K-001", "K-050");
		expect(result.oldId).toBe("K-001");
		expect(result.newId).toBe("K-050");
	});

	test("rename term updates file", () => {
		createEntity(TMP, { type: "term", title: "Old term" });

		const result = performRename(TMP, "T-001", "T-050");
		expect(result.oldId).toBe("T-001");
		expect(result.newId).toBe("T-050");
	});

	test("rename decision propagates affects to stakeholder", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });
		createEntity(TMP, { type: "decision", title: "Decision" });
		performLink(TMP, "D-001", "S-001", { type: "affects" });

		performRename(TMP, "S-001", "S-050");

		const d = readEntityById(TMP, "D-001")! as Decision;
		expect(d.affects).toContain("S-050");
		expect(d.affects).not.toContain("S-001");
	});

	test("rename decision propagates mitigated_by in risk", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });
		createEntity(TMP, { type: "risk", title: "Risk" });
		performLink(TMP, "K-001", "D-001", { type: "mitigated_by" });

		performRename(TMP, "D-001", "D-050");

		const k = readEntityById(TMP, "K-001")! as Risk;
		expect(k.mitigated_by).toContain("D-050");
		expect(k.mitigated_by).not.toContain("D-001");
	});
});

// ─── Check with new types ───

describe("check with new entity types", () => {
	test("stakeholders are not flagged as orphans", () => {
		createEntity(TMP, { type: "stakeholder", title: "Team" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const orphans = findOrphans(graph);
		expect(orphans.length).toBe(0);
	});

	test("risks are not flagged as orphans", () => {
		createEntity(TMP, { type: "risk", title: "Risk" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const orphans = findOrphans(graph);
		expect(orphans.length).toBe(0);
	});

	test("terms are not flagged as orphans", () => {
		createEntity(TMP, { type: "term", title: "Term" });

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const orphans = findOrphans(graph);
		expect(orphans.length).toBe(0);
	});

	test("dangling ref detected when risk mitigated_by references missing entity", () => {
		createEntity(TMP, { type: "risk", title: "Risk" });

		const k = readEntityById(TMP, "K-001")! as Risk;
		k.mitigated_by = ["D-999"];
		updateEntity(TMP, k);

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const danglers = graph.edges.filter(
			(e) => !graph.entities.has(e.to),
		);
		expect(danglers.length).toBe(1);
		expect(danglers[0].to).toBe("D-999");
	});

	test("dangling ref detected when requirement requested_by references missing stakeholder", () => {
		createEntity(TMP, { type: "requirement", title: "Req" });

		const r = readEntityById(TMP, "R-001")! as Requirement;
		r.requested_by = ["S-999"];
		updateEntity(TMP, r);

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const danglingEdges = graph.edges.filter(
			(e) => !graph.entities.has(e.to),
		);
		expect(danglingEdges.length).toBe(1);
	});

	test("dangling ref detected when decision affects references missing stakeholder", () => {
		createEntity(TMP, { type: "decision", title: "Decision" });

		const d = readEntityById(TMP, "D-001")! as Decision;
		d.affects = ["S-999"];
		updateEntity(TMP, d);

		const entities = readAllEntities(TMP);
		const graph = buildGraph(entities);
		const danglingEdges = graph.edges.filter(
			(e) => !graph.entities.has(e.to),
		);
		expect(danglingEdges.length).toBe(1);
	});
});

// ─── VALID_EDGES completeness ───

describe("VALID_EDGES for new types", () => {
	test("includes requirement→stakeholder requested_by", () => {
		expect(VALID_EDGES["requirement-stakeholder"]).toEqual(["requested_by"]);
	});

	test("includes decision→stakeholder affects", () => {
		expect(VALID_EDGES["decision-stakeholder"]).toEqual(["affects"]);
	});

	test("includes risk→decision mitigated_by", () => {
		expect(VALID_EDGES["risk-decision"]).toEqual(["mitigated_by"]);
	});

	test("no valid edges from stakeholder to any type", () => {
		expect(VALID_EDGES["stakeholder-requirement"]).toBeUndefined();
		expect(VALID_EDGES["stakeholder-decision"]).toBeUndefined();
		expect(VALID_EDGES["stakeholder-stakeholder"]).toBeUndefined();
	});

	test("no valid edges from term to any type", () => {
		expect(VALID_EDGES["term-requirement"]).toBeUndefined();
		expect(VALID_EDGES["term-decision"]).toBeUndefined();
		expect(VALID_EDGES["term-term"]).toBeUndefined();
	});
});
