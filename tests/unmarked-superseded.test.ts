import { describe, expect, test } from "bun:test";
import { buildGraph } from "../src/graph/graph";
import { findStatusAnomalies } from "../src/graph/analysis";
import type { Decision } from "../src/types";

function makeDecision(
	id: string,
	status: Decision["status"],
	opts: { supersedes?: string; driven_by?: string[] } = {},
): Decision {
	return {
		type: "decision",
		id,
		title: `Decision ${id}`,
		status,
		date: "2026-05-30",
		tags: [],
		body: "",
		filePath: "",
		driven_by: opts.driven_by ?? [],
		enables: [],
		affects: [],
		supersedes: opts.supersedes,
	};
}

describe("findStatusAnomalies: unmarked superseded decisions", () => {
	test("flags decision not in superseded status when another decision supersedes it", () => {
		const d1 = makeDecision("D-001", "accepted");
		const d2 = makeDecision("D-002", "accepted", { supersedes: "D-001" });
		const g = buildGraph([d1, d2]);

		const anomalies = findStatusAnomalies(g);

		expect(anomalies.length).toBe(1);
		expect(anomalies[0].entity.id).toBe("D-001");
		expect(anomalies[0].issue).toContain("D-002 supersedes this decision");
		expect(anomalies[0].issue).toContain('"accepted"');
		expect(anomalies[0].refs[0].id).toBe("D-002");
	});

	test("does not flag when superseded decision is already in superseded status", () => {
		const d1 = makeDecision("D-001", "superseded");
		const d2 = makeDecision("D-002", "accepted", { supersedes: "D-001" });
		const g = buildGraph([d1, d2]);

		const anomalies = findStatusAnomalies(g);

		const supersededAnomaly = anomalies.find(
			(a) =>
				a.issue.includes("supersedes this decision") &&
				a.entity.id === "D-001",
		);
		expect(supersededAnomaly).toBeUndefined();
	});

	test("does not flag when supersedes refers to non-existent entity", () => {
		const d2 = makeDecision("D-002", "accepted", { supersedes: "D-999" });
		const g = buildGraph([d2]);

		const anomalies = findStatusAnomalies(g);

		expect(anomalies.length).toBe(0);
	});

	test("flags decision in proposed status when superseded", () => {
		const d1 = makeDecision("D-001", "proposed");
		const d2 = makeDecision("D-002", "accepted", { supersedes: "D-001" });
		const g = buildGraph([d1, d2]);

		const anomalies = findStatusAnomalies(g);

		expect(anomalies.length).toBe(1);
		expect(anomalies[0].entity.id).toBe("D-001");
		expect(anomalies[0].issue).toContain('"proposed"');
	});
});
