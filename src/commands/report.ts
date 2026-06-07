import { buildGraph, getDependents } from "../graph/graph.js";
import type { Decision, Entity, Requirement, Risk } from "../types";

function entitiesOf<T extends Entity>(
	entities: Entity[],
	type: T["type"],
): T[] {
	return entities.filter((e) => e.type === type) as T[];
}

export function reportRequirements(entities: Entity[]): string {
	const graph = buildGraph(entities);
	const requirements = entitiesOf<Requirement>(entities, "requirement");
	if (requirements.length === 0)
		return "# Requirements Catalog\n\nNo requirements found.\n";

	const hasContext = requirements.some((r) => r.context);
	const hasStakeholders = requirements.some(
		(r) => r.requested_by && r.requested_by.length > 0,
	);

	const header = ["| ID | Title | Status | Decisions |"];
	if (hasContext) header[0] = "| ID | Title | Status | Context | Decisions |";
	if (hasStakeholders) {
		if (hasContext)
			header[0] =
				"| ID | Title | Status | Context | Stakeholders | Decisions |";
		else header[0] = "| ID | Title | Status | Stakeholders | Decisions |";
	}
	header.push(
		"|---|---|---|---" +
			(hasContext ? "|---|" : "") +
			(hasStakeholders ? "---|" : "") +
			"---|",
	);

	const rows: string[] = [];
	for (const r of requirements) {
		const deps = getDependents(graph, r.id).filter(
			(d) => d.type === "decision",
		);
		const decisionStr =
			deps.length > 0 ? deps.map((d) => d.id).join(", ") : "—";
		let row = `| ${r.id} | ${r.title} | ${r.status} |`;
		if (hasContext) row += ` ${r.context ?? "—"} |`;
		if (hasStakeholders)
			row += ` ${r.requested_by.length > 0 ? r.requested_by.join(", ") : "—"} |`;
		row += ` ${decisionStr} |`;
		rows.push(row);
	}

	const lines = ["# Requirements Catalog", "", ...header, ...rows, ""];

	const unaddressed = requirements.filter((r) => {
		const deps = getDependents(graph, r.id).filter(
			(d) => d.type === "decision",
		);
		return deps.length === 0 && r.status !== "deprecated";
	});
	if (unaddressed.length > 0) {
		lines.push("## Unaddressed Requirements");
		lines.push("");
		for (const r of unaddressed) {
			lines.push(`- **${r.id}** ${r.title} — no decisions addressing it`);
		}
		lines.push("");
	}

	const visions = entitiesOf<Entity>(entities, "vision");
	if (visions.length > 0) {
		lines.push("## Vision Derivation");
		lines.push("");
		for (const v of visions) {
			const visionReqs = getDependents(graph, v.id).filter(
				(d) => d.type === "requirement",
			);
			if (visionReqs.length > 0) {
				lines.push(
					`**${v.id}: ${v.title}** → ${visionReqs.map((r) => r.id).join(", ")}`,
				);
			}
		}
		lines.push("");
	}

	return lines.join("\n").trimEnd() + "\n";
}

export function reportDecisions(entities: Entity[]): string {
	const decisions = entitiesOf<Decision>(entities, "decision");
	if (decisions.length === 0)
		return "# Decision Log\n\nNo decisions found.\n";

	const lines: string[] = ["# Decision Log", ""];

	for (const d of decisions) {
		const drivenBy = d.driven_by;
		const enabledBy = d.enables;
		const isOrphan = drivenBy.length === 0;

		lines.push(`## ${d.id}: ${d.title}`);
		let meta = `**Status:** ${d.status}`;
		if (drivenBy.length > 0) {
			meta += ` | **Driven by:** ${drivenBy.join(", ")}`;
		}
		if (isOrphan) {
			meta += ` | ⚠ **orphan**`;
		}
		if (enabledBy.length > 0) {
			meta += ` | **Enables:** ${enabledBy.join(", ")}`;
		}
		lines.push(meta);
		lines.push("");

		if (d.body && d.body.trim().length > 0) {
			lines.push(d.body.trim());
			lines.push("");
		}
	}

	return lines.join("\n").trimEnd() + "\n";
}

export function reportTraceability(entities: Entity[]): string {
	const graph = buildGraph(entities);
	const requirements = entitiesOf<Requirement>(entities, "requirement");
	if (requirements.length === 0) {
		return "# Traceability Matrix\n\nNo traceable entities found.\n";
	}

	const lines: string[] = [
		"# Traceability Matrix",
		"",
		"| Requirement | Decisions | Assumptions |",
		"|---|---|---|",
	];

	for (const r of requirements) {
		const allDeps = getDependents(graph, r.id);
		const decDeps = allDeps.filter((d) => d.type === "decision") as Decision[];
		const decisionsStr =
			decDeps.length > 0 ? decDeps.map((d) => d.id).join(", ") : "—";

		const assumptionIds: string[] = [];
		for (const dec of decDeps) {
			for (const drivenId of dec.driven_by) {
				const driven = graph.entities.get(drivenId);
				if (
					driven?.type === "assumption" &&
					!assumptionIds.includes(drivenId)
				) {
					assumptionIds.push(drivenId);
				}
			}
		}
		const assumptionsStr =
			assumptionIds.length > 0 ? assumptionIds.join(", ") : "—";

		lines.push(`| ${r.id} | ${decisionsStr} | ${assumptionsStr} |`);
	}

	const untraced = requirements.filter((r) => {
		const deps = getDependents(graph, r.id).filter(
			(d) => d.type === "decision",
		);
		return deps.length === 0 && r.status !== "deprecated";
	});
	if (untraced.length > 0) {
		lines.push("");
		lines.push("## Untraced Requirements");
		lines.push("");
		for (const r of untraced) {
			lines.push(`- **${r.id}** ${r.title}`);
		}
	}

	lines.push("");
	return lines.join("\n").trimEnd() + "\n";
}

export function reportRisks(entities: Entity[]): string {
	const risks = entitiesOf<Risk>(entities, "risk");
	if (risks.length === 0) return "# Risk Register\n\nNo risks found.\n";

	const lines: string[] = [
		"# Risk Register",
		"",
		"| ID | Title | Status | Mitigated By |",
		"|---|---|---|---|",
	];

	for (const k of risks) {
		const mitigated =
			k.mitigated_by.length > 0 ? k.mitigated_by.join(", ") : "—";
		lines.push(`| ${k.id} | ${k.title} | ${k.status} | ${mitigated} |`);
	}

	lines.push("");
	return lines.join("\n").trimEnd() + "\n";
}

export function reportFull(entities: Entity[]): string {
	const graph = buildGraph(entities);
	const typeCounts = new Map<string, number>();
	for (const e of entities) {
		typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
	}

	const lines: string[] = [
		"# Architecture Report",
		"",
		`**${entities.length} entities**, ${graph.edges.length} relationships`,
		"",
	];

	for (const [type, count] of typeCounts) {
		lines.push(`- ${type}: ${count}`);
	}
	lines.push("");

	lines.push("## Requirements");
	lines.push("");
	lines.push(reportRequirements(entities));
	lines.push("## Decisions");
	lines.push("");
	lines.push(reportDecisions(entities));
	lines.push("## Traceability");
	lines.push("");
	lines.push(reportTraceability(entities));

	if (entitiesOf<Entity>(entities, "risk").length > 0) {
		lines.push("## Risks");
		lines.push("");
		lines.push(reportRisks(entities));
	}

	return lines.join("\n").trimEnd() + "\n";
}
