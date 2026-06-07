import { describe, expect, test } from "bun:test";
import {
	reportRequirements,
	reportDecisions,
	reportTraceability,
	reportRisks,
	reportFull,
} from "../src/commands/report";
import type {
	Assumption,
	Decision,
	Entity,
	Requirement,
	Risk,
	Stakeholder,
	Vision,
} from "../src/types";

function makeRequirementEntities(): Entity[] {
	const r1: Requirement = {
		type: "requirement",
		id: "R-001",
		title: "Encrypt data at rest",
		status: "accepted",
		date: "2026-04-30",
		tags: ["security"],
		body: "",
		filePath: "",
		derived_from: ["V-001"],
		conflicts_with: [],
		requested_by: ["S-001"],
		context: "storage",
	};
	const r2: Requirement = {
		type: "requirement",
		id: "R-002",
		title: "Offline support",
		status: "accepted",
		date: "2026-04-30",
		tags: ["ux"],
		body: "",
		filePath: "",
		derived_from: [],
		conflicts_with: [],
		requested_by: [],
		context: "storage",
	};
	const r3: Requirement = {
		type: "requirement",
		id: "R-003",
		title: "Always online",
		status: "draft",
		date: "2026-05-01",
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
		date: "2026-04-30",
		tags: [],
		body: "",
		filePath: "",
		driven_by: ["R-001"],
		enables: [],
		affects: [],
		depends_on: [],
	};
	const s1: Stakeholder = {
		type: "stakeholder",
		id: "S-001",
		title: "Security team",
		status: "active",
		date: "2026-05-01",
		tags: [],
		body: "",
		filePath: "",
	};
	const v1: Vision = {
		type: "vision",
		id: "V-001",
		title: "Secure platform",
		status: "active",
		date: "2026-05-01",
		tags: [],
		body: "",
		filePath: "",
	};
	return [r1, r2, r3, d1, s1, v1];
}

function makeDecisionEntities(): Entity[] {
	const r1: Requirement = {
		type: "requirement",
		id: "R-001",
		title: "Encrypt data at rest",
		status: "accepted",
		date: "2026-04-30",
		tags: [],
		body: "",
		filePath: "",
		derived_from: [],
		conflicts_with: [],
		requested_by: [],
	};
	const a1: Assumption = {
		type: "assumption",
		id: "A-001",
		title: "Low latency is acceptable",
		status: "validated",
		date: "2026-04-30",
		tags: [],
		body: "",
		filePath: "",
	};
	const d1: Decision = {
		type: "decision",
		id: "D-001",
		title: "Use SQLite",
		status: "accepted",
		date: "2026-04-30",
		tags: ["storage"],
		body: "## Context\nWe need local persistence.\n\n## Decision\nUse SQLite.",
		filePath: "",
		driven_by: ["R-001", "A-001"],
		enables: ["D-002"],
		affects: [],
		depends_on: [],
	};
	const d2: Decision = {
		type: "decision",
		id: "D-002",
		title: "Cache strategy",
		status: "proposed",
		date: "2026-05-01",
		tags: [],
		body: "",
		filePath: "",
		driven_by: [],
		enables: [],
		affects: [],
		depends_on: [],
	};
	return [r1, a1, d1, d2];
}

function makeRiskEntities(): Entity[] {
	const r1: Requirement = {
		type: "requirement",
		id: "R-001",
		title: "Encrypt data",
		status: "accepted",
		date: "2026-04-30",
		tags: [],
		body: "",
		filePath: "",
		derived_from: [],
		conflicts_with: [],
		requested_by: [],
	};
	const k1: Risk = {
		type: "risk",
		id: "K-001",
		title: "Payment provider downtime",
		status: "identified",
		date: "2026-05-01",
		tags: ["payment"],
		body: "",
		filePath: "",
		mitigated_by: [],
	};
	const k2: Risk = {
		type: "risk",
		id: "K-002",
		title: "Data loss",
		status: "mitigated",
		date: "2026-05-01",
		tags: [],
		body: "",
		filePath: "",
		mitigated_by: ["D-001"],
	};
	const d1: Decision = {
		type: "decision",
		id: "D-001",
		title: "Use encrypted backups",
		status: "accepted",
		date: "2026-05-01",
		tags: [],
		body: "",
		filePath: "",
		driven_by: ["R-001"],
		enables: [],
		affects: [],
		depends_on: [],
	};
	return [r1, k1, k2, d1];
}

// ─── Requirements Report ───

describe("report requirements", () => {
	test("generates requirements catalog with table", () => {
		const md = reportRequirements(makeRequirementEntities());
		expect(md).toContain("# Requirements Catalog");
		expect(md).toContain("| R-001 |");
		expect(md).toContain("Encrypt data at rest");
		expect(md).toContain("accepted");
		expect(md).toContain("D-001");
	});

	test("lists unaddressed requirements", () => {
		const md = reportRequirements(makeRequirementEntities());
		expect(md).toContain("R-003");
		expect(md).toContain("Always online");
	});

	test("shows stakeholders when present", () => {
		const md = reportRequirements(makeRequirementEntities());
		expect(md).toContain("S-001");
	});

	test("shows context column when entities have context", () => {
		const md = reportRequirements(makeRequirementEntities());
		expect(md).toContain("storage");
	});

	test("shows vision derivation", () => {
		const md = reportRequirements(makeRequirementEntities());
		expect(md).toContain("V-001");
	});
});

// ─── Decisions Report ───

describe("report decisions", () => {
	test("generates decision log", () => {
		const md = reportDecisions(makeDecisionEntities());
		expect(md).toContain("# Decision Log");
		expect(md).toContain("D-001");
		expect(md).toContain("Use SQLite");
		expect(md).toContain("accepted");
	});

	test("shows driving requirements and assumptions", () => {
		const md = reportDecisions(makeDecisionEntities());
		expect(md).toContain("R-001");
		expect(md).toContain("A-001");
	});

	test("includes body content", () => {
		const md = reportDecisions(makeDecisionEntities());
		expect(md).toContain("We need local persistence");
	});

	test("shows enabled decisions", () => {
		const md = reportDecisions(makeDecisionEntities());
		expect(md).toContain("D-002");
	});

	test("marks orphan decisions", () => {
		const md = reportDecisions(makeDecisionEntities());
		expect(md).toContain("orphan");
	});
});

// ─── Traceability Matrix ───

describe("report traceability", () => {
	test("generates requirement-to-decision traceability matrix", () => {
		const md = reportTraceability(makeRequirementEntities());
		expect(md).toContain("# Traceability Matrix");
		expect(md).toContain("R-001");
		expect(md).toContain("D-001");
	});

	test("shows untraced requirements", () => {
		const md = reportTraceability(makeRequirementEntities());
		expect(md).toContain("R-003");
	});
});

// ─── Risk Report ───

describe("report risks", () => {
	test("generates risk register", () => {
		const md = reportRisks(makeRiskEntities());
		expect(md).toContain("# Risk Register");
		expect(md).toContain("K-001");
		expect(md).toContain("Payment provider downtime");
		expect(md).toContain("identified");
	});

	test("shows mitigation status", () => {
		const md = reportRisks(makeRiskEntities());
		expect(md).toContain("K-002");
		expect(md).toContain("mitigated");
		expect(md).toContain("D-001");
	});
});

// ─── Full Report ───

describe("report full", () => {
	test("generates complete project documentation", () => {
		const entities = [
			...makeRequirementEntities(),
			...makeRiskEntities().filter((e) => e.type === "risk"),
		];
		const md = reportFull(entities);
		expect(md).toContain("# Architecture Report");
		expect(md).toContain("## Requirements");
		expect(md).toContain("## Decisions");
		expect(md).toContain("## Risks");
	});

	test("includes summary stats", () => {
		const entities = [
			...makeRequirementEntities(),
			...makeRiskEntities().filter((e) => e.type === "risk"),
		];
		const md = reportFull(entities);
		expect(md).toContain("entities");
	});
});
