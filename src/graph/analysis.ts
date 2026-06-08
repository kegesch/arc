// Heuristic analysis functions for ARC.
//
// These functions are type-aware: they know about specific entity types
// (decision, requirement, assumption, etc.) and apply domain-specific
// heuristics. They sit on top of the type-agnostic graph engine.

import type { ArcGraph, Entity } from "../types";
import { getDependents } from "./graph";

/** Find decisions with no driven_by (no backing requirement or assumption) */
export function findOrphans(g: ArcGraph): Entity[] {
	const orphans: Entity[] = [];
	for (const [, entity] of g.entities) {
		if (entity.type === "decision" && entity.driven_by.length === 0) {
			orphans.push(entity);
		}
	}
	return orphans;
}

/** Find assumptions that are still unvalidated */
export function findUnvalidatedAssumptions(g: ArcGraph): Entity[] {
	const result: Entity[] = [];
	for (const [, entity] of g.entities) {
		if (entity.type === "assumption" && entity.status === "unvalidated") {
			result.push(entity);
		}
	}
	return result;
}

// ─── Opposition term detection ───

const DEFAULT_OPPOSITIONS: [string, string][] = [
	["encrypt", "plaintext"],
	["encrypted", "unencrypted"],
	["offline", "online"],
	["offline", "real-time"],
	["offline", "always online"],
	["synchronous", "asynchronous"],
	["real-time", "batch"],
	["real-time", "eventual"],
	["real-time", "delayed"],
	["immutable", "mutable"],
	["stateless", "stateful"],
	["public", "private"],
	["open", "restricted"],
	["allow", "deny"],
	["allow", "block"],
	["require", "prohibit"],
	["mandatory", "optional"],
	["must", "must not"],
	["shall", "shall not"],
	["single", "distributed"],
	["centralized", "distributed"],
	["local", "remote"],
	["internal", "external"],
	["free", "paid"],
	["unlimited", "limited"],
	["static", "dynamic"],
	["pull", "push"],
	["read-only", "writable"],
];

export interface PossibleContradiction {
	a: Entity;
	b: Entity;
	reason: string;
	confidence: "high" | "medium" | "low";
}

/**
 * Find possible contradictions between requirements based on opposing terms.
 */
export function findPossibleContradictions(
	g: ArcGraph,
	oppositions: [string, string][] = DEFAULT_OPPOSITIONS,
): PossibleContradiction[] {
	const requirements = [...g.entities.values()].filter(
		(e) => e.type === "requirement",
	);
	const results: PossibleContradiction[] = [];

	// Build a map of which requirements contain which terms
	const termIndex = new Map<string, Set<string>>(); // term → set of req IDs
	for (const req of requirements) {
		const text = `${req.title} ${req.body}`.toLowerCase();
		for (const [termA, termB] of oppositions) {
			if (text.includes(termA.toLowerCase())) {
				if (!termIndex.has(termA)) termIndex.set(termA, new Set());
				termIndex.get(termA)!.add(req.id);
			}
			if (text.includes(termB.toLowerCase())) {
				if (!termIndex.has(termB)) termIndex.set(termB, new Set());
				termIndex.get(termB)!.add(req.id);
			}
		}
	}

	// For each opposition pair, find requirements that have opposing terms
	const seen = new Set<string>();
	for (const [termA, termB] of oppositions) {
		const setA = termIndex.get(termA);
		const setB = termIndex.get(termB);
		if (!setA || !setB) continue;

		for (const idA of setA) {
			for (const idB of setB) {
				if (idA === idB) continue; // same requirement containing both terms is fine
				const key = [idA, idB].sort().join("::");
				if (seen.has(key)) continue;
				seen.add(key);

				const eA = g.entities.get(idA)!;
				const eB = g.entities.get(idB)!;

				results.push({
					a: eA,
					b: eB,
					reason: `opposing terms: "${termA}" vs "${termB}"`,
					confidence: "medium",
				});
			}
		}
	}

	return results;
}

// ─── Duplicate detection ───

export interface PossibleDuplicate {
	a: Entity;
	b: Entity;
	similarity: number;
}

/**
 * Find requirements with very similar titles (possible unintended duplicates).
 * Uses a simple Jaccard-like token overlap score.
 */
export function findPossibleDuplicates(
	g: ArcGraph,
	threshold: number = 0.6,
): PossibleDuplicate[] {
	const requirements = [...g.entities.values()].filter(
		(e) => e.type === "requirement",
	);
	const results: PossibleDuplicate[] = [];

	for (let i = 0; i < requirements.length; i++) {
		for (let j = i + 1; j < requirements.length; j++) {
			const a = requirements[i];
			const b = requirements[j];
			const similarity = tokenSimilarity(a.title, b.title);
			if (similarity >= threshold) {
				results.push({ a, b, similarity });
			}
		}
	}

	return results.sort((a, b) => b.similarity - a.similarity);
}

function tokenSimilarity(a: string, b: string): number {
	const tokensA = new Set(tokenize(a));
	const tokensB = new Set(tokenize(b));
	const intersection = [...tokensA].filter((t) => tokensB.has(t));
	const union = new Set([...tokensA, ...tokensB]);
	return union.size === 0 ? 0 : intersection.length / union.size;
}

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.split(/\s+/)
		.filter((t) => t.length > 2); // skip short words
}

// ─── Status anomalies ───

export interface StatusAnomaly {
	entity: Entity;
	issue: string;
	refs: Entity[];
}

/**
 * Find status anomalies:
 * - Accepted decisions driven by deprecated/rejected requirements
 * - Accepted decisions backed by invalidated assumptions
 * - Decisions with supersedes reference where superseded decision is not in superseded status
 */
export function findStatusAnomalies(g: ArcGraph): StatusAnomaly[] {
	const anomalies: StatusAnomaly[] = [];

	for (const [, entity] of g.entities) {
		if (entity.type === "decision" && entity.status === "accepted") {
			const badRefs: Entity[] = [];

			for (const drivenById of entity.driven_by) {
				const dep = g.entities.get(drivenById);
				if (!dep) continue;

				if (
					dep.type === "requirement" &&
					(dep.status === "deprecated" || dep.status === "rejected")
				) {
					badRefs.push(dep);
				}
				if (dep.type === "assumption" && dep.status === "invalidated") {
					badRefs.push(dep);
				}
			}

			if (badRefs.length > 0) {
				anomalies.push({
					entity,
					issue: `accepted decision backed by ${badRefs.map((r) => `${r.status} ${r.id}`).join(", ")}`,
					refs: badRefs,
				});
			}
		}
	}

	for (const [, entity] of g.entities) {
		if (entity.type === "decision" && entity.supersedes) {
			const superseded = g.entities.get(entity.supersedes);
			if (
				superseded &&
				superseded.type === "decision" &&
				superseded.status !== "superseded"
			) {
				anomalies.push({
					entity: superseded,
					issue: `${entity.id} supersedes this decision, but status is still "${superseded.status}"`,
					refs: [entity],
				});
			}
		}
	}

	return anomalies;
}

/**
 * Find requirements that have no decisions addressing them (orphan requirements).
 */
export function findOrphanRequirements(g: ArcGraph): Entity[] {
	const orphans: Entity[] = [];
	for (const [, entity] of g.entities) {
		if (entity.type === "requirement" && entity.status === "accepted") {
			const dependents = getDependents(g, entity.id);
			const drivenByDecision = dependents.some((d) => d.type === "decision");
			if (!drivenByDecision) {
				orphans.push(entity);
			}
		}
	}
	return orphans;
}

// ─── Structured field validation ───

export interface StructuredFieldWarning {
	entity: Entity;
	field: string;
	message: string;
}

/**
 * Find use_case and entity_model entities with missing required structured fields.
 * These are warnings because entities might start as drafts.
 */
export function findStructuredFieldWarnings(
	g: ArcGraph,
): StructuredFieldWarning[] {
	const warnings: StructuredFieldWarning[] = [];

	for (const [, entity] of g.entities) {
		if (entity.type === "use_case") {
			const uc = entity as import("../types").UseCase;
			if (uc.actors.length === 0) {
				warnings.push({
					entity,
					field: "actors",
					message: `Use case ${uc.id} has no actors defined`,
				});
			}
			if (uc.acceptance_criteria.length === 0) {
				warnings.push({
					entity,
					field: "acceptance_criteria",
					message: `Use case ${uc.id} has no acceptance criteria`,
				});
			}
			if (uc.main_flow.length === 0) {
				warnings.push({
					entity,
					field: "main_flow",
					message: `Use case ${uc.id} has no main flow defined`,
				});
			}
		}

		if (entity.type === "entity_model") {
			const em = entity as import("../types").EntityModel;
			if (em.entities.length === 0) {
				warnings.push({
					entity,
					field: "entities",
					message: `Entity model ${em.id} has no entities defined`,
				});
			}
		}
	}

	return warnings;
}

export interface VisionOrphanWarning {
	entity: Entity;
	message: string;
}

function reachesVision(
	g: ArcGraph,
	id: string,
	visionIds: Set<string>,
	visited: Set<string>,
): boolean {
	if (visionIds.has(id)) return true;
	if (visited.has(id)) return false;
	visited.add(id);

	const outgoing = g.outgoing.get(id) ?? [];
	for (const edge of outgoing) {
		if (
			edge.type === "derived_from" &&
			reachesVision(g, edge.to, visionIds, visited)
		) {
			return true;
		}
	}
	return false;
}

// ─── Next categories (driver command) ───

export interface NextCategories {
	ready: Entity[];
	needs_use_cases: Entity[];
	needs_design: Entity[];
	risky: Entity[];
	orphan: Entity[];
}

/**
 * Categorize entities for the `arc next` command.
 * Returns categorized entities without ordering — the agent decides priority.
 */
export function findNextCategories(g: ArcGraph): NextCategories {
	const result: NextCategories = {
		ready: [],
		needs_use_cases: [],
		needs_design: [],
		risky: [],
		orphan: [],
	};

	// Find unvalidated assumptions backing accepted decisions
	for (const [, entity] of g.entities) {
		if (entity.type === "assumption" && entity.status === "unvalidated") {
			const incoming = g.incoming.get(entity.id) ?? [];
			const backsAcceptedDecision = incoming.some((edge) => {
				if (edge.type !== "driven_by" && edge.type !== "enables") return false;
				const dep = g.entities.get(edge.from);
				return dep?.type === "decision" && dep.status === "accepted";
			});
			if (backsAcceptedDecision) {
				result.risky.push(entity);
			}
		}
	}

	// Find orphan decisions (no backing requirement or assumption)
	for (const [, entity] of g.entities) {
		if (entity.type === "decision" && entity.driven_by.length === 0) {
			result.orphan.push(entity);
		}
	}

	// Categorize accepted requirements
	for (const [, entity] of g.entities) {
		if (entity.type !== "requirement" || entity.status !== "accepted") continue;

		// Find decisions that drive this requirement
		const incoming = g.incoming.get(entity.id) ?? [];
		const decisions = incoming
			.filter((edge) => edge.type === "driven_by")
			.map((edge) => g.entities.get(edge.from))
			.filter(
				(e): e is Entity =>
					e !== undefined && e.type === "decision" && e.status === "accepted",
			);

		if (decisions.length === 0) {
			result.needs_design.push(entity);
			continue;
		}

		// Check if any use cases are derived from this requirement
		const useCases = incoming
			.filter((edge) => edge.type === "derived_from")
			.map((edge) => g.entities.get(edge.from))
			.filter((e): e is Entity => e !== undefined && e.type === "use_case");

		if (useCases.length === 0) {
			result.needs_use_cases.push(entity);
		} else {
			result.ready.push(entity);
		}
	}

	return result;
}

// ─── Context bundle (driver command) ───

export interface ContextBundle {
	entity: Entity;
	decisions: Entity[];
	use_cases: Entity[];
	assumptions: Entity[];
	risks: Entity[];
	requirements: Entity[];
	visions: Entity[];
}

/**
 * Build a context bundle for an entity — all related entities for implementation.
 * Default: full transitive closure. Pass shallow=true for one-hop only.
 */
export function buildContextBundle(
	g: ArcGraph,
	id: string,
	shallow: boolean = false,
): ContextBundle | null {
	const entity = g.entities.get(id);
	if (!entity) return null;

	const bundle: ContextBundle = {
		entity,
		decisions: [],
		use_cases: [],
		assumptions: [],
		risks: [],
		requirements: [],
		visions: [],
	};

	const visited = new Set<string>([id]);

	// BFS to collect related entities
	const queue: string[] = [id];
	let depth = 0;

	while (queue.length > 0) {
		const levelSize = queue.length;
		const nextQueue: string[] = [];

		for (let i = 0; i < levelSize; i++) {
			const currentId = queue[i]!;
			const outgoing = g.outgoing.get(currentId) ?? [];
			const incomingEdges = g.incoming.get(currentId) ?? [];
			const allEdges = [...outgoing, ...incomingEdges];

			for (const edge of allEdges) {
				const targetId = edge.from === currentId ? edge.to : edge.from;
				if (visited.has(targetId)) continue;
				visited.add(targetId);

				const related = g.entities.get(targetId);
				if (!related) continue;

				// Categorize by type
				switch (related.type) {
					case "decision":
						bundle.decisions.push(related);
						break;
					case "use_case":
						bundle.use_cases.push(related);
						break;
					case "assumption":
						bundle.assumptions.push(related);
						break;
					case "risk":
						bundle.risks.push(related);
						break;
					case "requirement":
						bundle.requirements.push(related);
						break;
					case "vision":
						bundle.visions.push(related);
						break;
				}

				// Continue traversal unless shallow
				if (!shallow) {
					nextQueue.push(targetId);
				}
			}
		}

		queue.length = 0;
		queue.push(...nextQueue);
		depth++;
	}

	return bundle;
}

// ─── Gap analysis (for arc check warnings) ───

export interface GapWarning {
	entity: Entity;
	message: string;
}

/**
 * Find accepted decisions without use cases derived from them.
 * This is a gap warning, not an error — use cases are enrichment.
 */
export function findDecisionsWithoutUseCases(g: ArcGraph): GapWarning[] {
	const warnings: GapWarning[] = [];

	for (const [, entity] of g.entities) {
		if (entity.type !== "decision" || entity.status !== "accepted") continue;

		if (!entity.context) continue;

		const incoming = g.incoming.get(entity.id) ?? [];
		hasUseCase: {
			for (const edge of incoming) {
				if (edge.type !== "derived_from") continue;
				const from = g.entities.get(edge.from);
				if (from?.type === "use_case") {
					break hasUseCase;
				}
			}
			warnings.push({
				entity,
				message: `Decision ${entity.id} "${entity.title}" has no use cases`,
			});
		}
	}

	return warnings;
}

/** Find entities with zero incoming and zero outgoing edges — completely disconnected. */
export function findUnconnectedEntities(g: ArcGraph): Entity[] {
	const unconnected: Entity[] = [];
	for (const [, entity] of g.entities) {
		const hasIncoming = (g.incoming.get(entity.id) ?? []).length > 0;
		const hasOutgoing = (g.outgoing.get(entity.id) ?? []).length > 0;
		if (!hasIncoming && !hasOutgoing) {
			unconnected.push(entity);
		}
	}
	return unconnected;
}

export function findRequirementsWithoutVision(
	g: ArcGraph,
): VisionOrphanWarning[] {
	const visionIds = new Set(
		[...g.entities.values()]
			.filter((e) => e.type === "vision")
			.map((e) => e.id),
	);
	if (visionIds.size === 0) return [];

	const warnings: VisionOrphanWarning[] = [];
	for (const [, entity] of g.entities) {
		if (entity.type === "requirement" && entity.status === "accepted") {
			if (!reachesVision(g, entity.id, visionIds, new Set())) {
				warnings.push({
					entity,
					message: `Requirement ${entity.id} "${entity.title}" is not derived from any vision`,
				});
			}
		}
	}
	return warnings;
}
