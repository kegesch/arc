import { describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	reportRequirements,
	reportDecisions,
	reportTraceability,
	reportRisks,
	reportFull,
	reportAssumptions,
	reportVisions,
	reportUseCases,
	reportEntityModels,
} from "../src/commands/report";
import type {
	Assumption,
	Decision,
	Entity,
	Requirement,
	Risk,
	Stakeholder,
	Vision,
	UseCase,
	EntityModel,
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

// ─── CLI Command Integration ───

describe("report command", () => {
	test("writes report to file with --output", () => {
		const outPath = join(import.meta.dir, "_tmp_report.md");
		try {
			const { reportCommand } = require("../src/commands/report");

			const origExit = process.exit;
			const origLog = console.log;
			let logged = "";
			process.exit = (() => {}) as never;
			console.log = (msg: string) => {
				logged += msg;
			};

			try {
				reportCommand("requirements", { output: outPath });
			} finally {
				process.exit = origExit;
				console.log = origLog;
			}

			expect(existsSync(outPath)).toBe(true);
			const content = readFileSync(outPath, "utf-8");
			expect(content).toContain("Requirements Catalog");
			expect(logged).toContain("written to");
		} finally {
			if (existsSync(outPath)) rmSync(outPath);
		}
	});

	test("defaults to report.html when no --output given", () => {
		const origDir = process.cwd();
		const tmpDir = join(import.meta.dir, "_tmp_report_default");
		mkdirSync(tmpDir, { recursive: true });
		const defaultPath = join(tmpDir, "report.html");
		try {
			process.chdir(tmpDir);
			mkdirSync(join(tmpDir, ".arc", "requirements"), { recursive: true });
			const { reportCommand } = require("../src/commands/report");

			const origExit = process.exit;
			process.exit = (() => {}) as never;

			try {
				reportCommand("requirements");
			} finally {
				process.exit = origExit;
			}

			expect(existsSync(defaultPath)).toBe(true);
			const content = readFileSync(defaultPath, "utf-8");
			expect(content).toContain("<!DOCTYPE html>");
			expect(content).toContain("Requirements Catalog");
		} finally {
			process.chdir(origDir);
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	test("full report includes graph visualization", () => {
		const origDir = process.cwd();
		const tmpDir = join(import.meta.dir, "_tmp_report_graph");
		mkdirSync(tmpDir, { recursive: true });
		const defaultPath = join(tmpDir, "report.html");
		try {
			process.chdir(tmpDir);
			mkdirSync(join(tmpDir, ".arc", "requirements"), { recursive: true });
			mkdirSync(join(tmpDir, ".arc", "decisions"), { recursive: true });
			writeFileSync(
				join(tmpDir, ".arc", "requirements", "R-001-test.md"),
				"---\nid: R-001\ntype: requirement\ntitle: Test req\nstatus: accepted\ndate: '2026-01-01'\ntags: []\n---\nBody",
			);
			writeFileSync(
				join(tmpDir, ".arc", "decisions", "D-001-test.md"),
				"---\nid: D-001\ntype: decision\ntitle: Test dec\nstatus: accepted\ndate: '2026-01-01'\ntags: []\ndriven_by:\n  - R-001\n---\nBody",
			);
			const { reportCommand } = require("../src/commands/report");

			const origExit = process.exit;
			process.exit = (() => {}) as never;

			try {
				reportCommand("full");
			} finally {
				process.exit = origExit;
			}

			expect(existsSync(defaultPath)).toBe(true);
			const content = readFileSync(defaultPath, "utf-8");
			expect(content).toContain("graph-canvas");
			expect(content).toContain("graph-tooltip");
			expect(content).toContain("<script>");
		} finally {
			process.chdir(origDir);
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});
});

describe("report assumptions", () => {
	test("generates assumptions catalog with status and promotion info", () => {
		const entities: Entity[] = [
			{
				type: "assumption",
				id: "A-001",
				title: "Users have internet",
				status: "validated",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
			},
			{
				type: "assumption",
				id: "A-002",
				title: "Low latency needed",
				status: "invalidated",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				promoted_to: "R-010",
			},
		];
		const md = reportAssumptions(entities);
		expect(md).toContain("# Assumptions");
		expect(md).toContain("A-001");
		expect(md).toContain("Users have internet");
		expect(md).toContain("validated");
		expect(md).toContain("A-002");
		expect(md).toContain("invalidated");
		expect(md).toContain("R-010");
	});

	test("returns empty message when no assumptions", () => {
		const md = reportAssumptions([]);
		expect(md).toContain("No assumptions found");
	});
});

describe("report visions", () => {
	test("generates visions catalog with linked requirements", () => {
		const entities: Entity[] = [
			{
				type: "vision",
				id: "V-001",
				title: "Secure platform",
				status: "active",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
			},
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: ["V-001"],
				conflicts_with: [],
				requested_by: [],
			},
		];
		const md = reportVisions(entities);
		expect(md).toContain("# Visions");
		expect(md).toContain("V-001");
		expect(md).toContain("Secure platform");
		expect(md).toContain("R-001");
	});

	test("returns empty message when no visions", () => {
		const md = reportVisions([]);
		expect(md).toContain("No visions found");
	});
});

describe("report use cases", () => {
	test("generates use cases catalog with actors and criteria", () => {
		const entities: Entity[] = [
			{
				type: "use_case",
				id: "UC-001",
				title: "User login",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				actors: ["User", "System"],
				preconditions: ["User has account"],
				main_flow: [],
				acceptance_criteria: ["Login succeeds"],
				derived_from: ["R-001"],
				requested_by: [],
			},
		];
		const md = reportUseCases(entities);
		expect(md).toContain("# Use Cases");
		expect(md).toContain("UC-001");
		expect(md).toContain("User login");
		expect(md).toContain("User, System");
		expect(md).toContain("Login succeeds");
	});

	test("returns empty message when no use cases", () => {
		const md = reportUseCases([]);
		expect(md).toContain("No use cases found");
	});
});

describe("report entity models", () => {
	test("generates entity models catalog with entities", () => {
		const entities: Entity[] = [
			{
				type: "entity_model",
				id: "EM-001",
				title: "User model",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				entities: [
					{
						name: "User",
						attributes: [{ name: "id", type: "string", required: true }],
						relationships: [],
					},
				],
				derived_from: ["R-001"],
			},
		];
		const md = reportEntityModels(entities);
		expect(md).toContain("# Entity Models");
		expect(md).toContain("EM-001");
		expect(md).toContain("User model");
		expect(md).toContain("User");
	});

	test("returns empty message when no entity models", () => {
		const md = reportEntityModels([]);
		expect(md).toContain("No entity models found");
	});
});

describe("report full includes all entity types", () => {
	test("includes visions, assumptions, use cases, entity models sections", () => {
		const entities: Entity[] = [
			{
				type: "requirement",
				id: "R-001",
				title: "Test req",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: ["V-001"],
				conflicts_with: [],
				requested_by: [],
			},
			{
				type: "assumption",
				id: "A-001",
				title: "Test assumption",
				status: "validated",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
			},
			{
				type: "decision",
				id: "D-001",
				title: "Test dec",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				driven_by: ["R-001"],
				enables: [],
				affects: [],
				depends_on: [],
			},
			{
				type: "risk",
				id: "K-001",
				title: "Test risk",
				status: "identified",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				mitigated_by: [],
			},
			{
				type: "vision",
				id: "V-001",
				title: "Test vision",
				status: "active",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
			},
			{
				type: "use_case",
				id: "UC-001",
				title: "Test UC",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				actors: [],
				preconditions: [],
				main_flow: [],
				acceptance_criteria: [],
				derived_from: ["R-001"],
				requested_by: [],
			},
			{
				type: "entity_model",
				id: "EM-001",
				title: "Test EM",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				entities: [],
				derived_from: ["R-001"],
			},
		];
		const md = reportFull(entities);
		expect(md).toContain("## Visions");
		expect(md).toContain("## Assumptions");
		expect(md).toContain("## Use Cases");
		expect(md).toContain("## Entity Models");
	});
});
