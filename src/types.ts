// Core type definitions for ARC

export type EntityType =
	| "requirement"
	| "assumption"
	| "decision"
	| "idea"
	| "stakeholder"
	| "risk"
	| "term"
	| "use_case"
	| "entity_model";

export type RequirementStatus =
	| "draft"
	| "accepted"
	| "deprecated"
	| "rejected";
export type AssumptionStatus = "unvalidated" | "validated" | "invalidated";
export type DecisionStatus =
	| "proposed"
	| "accepted"
	| "deprecated"
	| "superseded";
export type IdeaStatus = "explore" | "parked" | "rejected" | "promoted";
export type StakeholderStatus = "active" | "inactive";
export type RiskStatus =
	| "identified"
	| "mitigated"
	| "accepted"
	| "materialized"
	| "closed";
export type TermStatus = "draft" | "accepted" | "deprecated";
export type EntityStatus =
	| RequirementStatus
	| AssumptionStatus
	| DecisionStatus
	| IdeaStatus
	| StakeholderStatus
	| RiskStatus
	| TermStatus;

export type EntityTypePrefix =
	| "R"
	| "A"
	| "D"
	| "I"
	| "S"
	| "K"
	| "T"
	| "UC"
	| "EM";

export interface EntityBase {
	id: string;
	title: string;
	date: string;
	tags: string[];
	body: string;
	filePath: string;
	context?: string;
}

export interface Requirement extends EntityBase {
	type: "requirement";
	status: RequirementStatus;
	derived_from: string[];
	conflicts_with: string[];
	requested_by: string[];
}

export interface Assumption extends EntityBase {
	type: "assumption";
	status: AssumptionStatus;
	promoted_to?: string;
}

export interface Decision extends EntityBase {
	type: "decision";
	status: DecisionStatus;
	driven_by: string[];
	enables: string[];
	supersedes?: string;
	depends_on: string[];
	affects: string[];
}

export interface Idea extends EntityBase {
	type: "idea";
	status: IdeaStatus;
	inspired_by: string[];
	promoted_to?: string;
}

export interface Stakeholder extends EntityBase {
	type: "stakeholder";
	status: StakeholderStatus;
}

export interface Risk extends EntityBase {
	type: "risk";
	status: RiskStatus;
	mitigated_by: string[];
}

export interface Term extends EntityBase {
	type: "term";
	status: TermStatus;
}

export interface UseCaseStep {
	step: number;
	actor: string;
	action: string;
}

export interface UseCase extends EntityBase {
	type: "use_case";
	status: RequirementStatus;
	actors: string[];
	preconditions: string[];
	main_flow: UseCaseStep[];
	acceptance_criteria: string[];
	derived_from: string[];
	requested_by: string[];
}

export interface EntityModelAttribute {
	name: string;
	type: string;
	required: boolean;
	length?: number;
	unique?: boolean;
}

export interface EntityModelRelationship {
	target: string;
	type: string;
}

export interface EntityModelEntity {
	name: string;
	attributes: EntityModelAttribute[];
	relationships: EntityModelRelationship[];
}

export interface EntityModel extends EntityBase {
	type: "entity_model";
	status: RequirementStatus;
	entities: EntityModelEntity[];
	derived_from: string[];
}

export type Entity =
	| Requirement
	| Assumption
	| Decision
	| Idea
	| Stakeholder
	| Risk
	| Term
	| UseCase
	| EntityModel;

export type EdgeType =
	| "driven_by"
	| "derived_from"
	| "conflicts_with"
	| "depends_on"
	| "enables"
	| "supersedes"
	| "promoted_to"
	| "inspired_by"
	| "requested_by"
	| "affects"
	| "mitigated_by"
	| "disambiguates_from";

export interface Edge {
	from: string;
	to: string;
	type: EdgeType;
}

export interface ArcGraph {
	entities: Map<string, Entity>;
	edges: Edge[];
	outgoing: Map<string, Edge[]>;
	incoming: Map<string, Edge[]>;
	byContext: Map<string, Entity[]>;
}

// ENTITY_CONFIG is now derived from entity descriptors.
// Import from entities/registry instead.
export { ENTITY_CONFIG } from "./entities/registry";

export function getTypeFromId(id: string): EntityType {
	if (id.startsWith("R-")) return "requirement";
	if (id.startsWith("A-")) return "assumption";
	if (id.startsWith("D-")) return "decision";
	if (id.startsWith("I-")) return "idea";
	if (id.startsWith("S-")) return "stakeholder";
	if (id.startsWith("K-")) return "risk";
	if (id.startsWith("T-")) return "term";
	if (id.startsWith("UC-")) return "use_case";
	if (id.startsWith("EM-")) return "entity_model";
	throw new Error(
		`Unknown ID prefix in "${id}". Expected R-, A-, D-, I-, S-, K-, T-, UC-, or EM-.`,
	);
}
