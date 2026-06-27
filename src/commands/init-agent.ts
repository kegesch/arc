// arc init-agent — append ARC usage instructions to AGENTS.md
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isArcProject } from "../io/files.js";

const AGENTS_FILE = "AGENTS.md";

/**
 * The ARC section to append to AGENTS.md.
 * Idempotent — contains a sentinel comment so we can detect if it's already present.
 */
const ARC_SECTION_MARKER = "<!-- arc:agent-instructions -->";

function getArcSection(): string {
	return `${ARC_SECTION_MARKER}
## ARC — Architecture Traceability

This project uses [ARC](https://github.com/kegesch/arc) for architectural traceability. All significant decisions, requirements, assumptions, risks, and ideas must be recorded using ARC.

### Quick Reference

\`\`\`bash
arc init                              # Initialize .arc/ (already done)
arc add <type> <title>                # Add entity (requirement|assumption|decision|idea|stakeholder|risk|term)
arc list [type]                       # List entities (--status, --tag, --context)
arc show <id>                         # Show entity detail + relationships
arc link <from> <to>                  # Create a relationship
arc unlink <from> <to>               # Remove a relationship
arc trace <id>                        # Trace dependency tree (what backs this entity?)
arc impact <id>                       # Impact analysis (what breaks if this changes?)
arc check                             # Health check: orphans, contradictions, dangling refs
arc validate <id>                     # Mark assumption as validated
arc invalidate <id>                   # Mark assumption as invalidated (shows cascade)
arc promote <id> [--to <type>]        # Promote assumption → requirement, idea → requirement/decision
arc status                            # Project health summary
arc query <text>                      # Search entities (supports modifiers)
arc graph [--format mermaid|dot|ascii] # Visualize graph
arc skill                             # Output skill file for AI agents
arc skill --install                   # Install skill file into .hermes/skills/arc/
\`\`\`

### Workflow Rules

1. **Before writing**, query first: \`arc query "<area>"\` and \`arc context <id>\` to see what exists. Read before you create.
2. **Before implementing a feature**, ensure there is a requirement for it. If not, add one: \`arc add requirement "description"\`
3. **Before making a design choice**, add a decision linked to what drives it: \`arc add decision "title" --driven-by=R-001,A-001\`
4. **If you're assuming something**, record it: \`arc add assumption "description"\`
5. **After implementation**, run \`arc check\` to verify graph health
6. **Always set \`driven_by\`** on decisions — decisions without backing are orphans
7. **Changing a design?** Don't add a parallel \`D-xxx\`. Either edit the existing decision in place or supersede it: \`arc link <new-D> <old-D> --type=supersedes\`. Rework, don't duplicate.

### R vs D — a quick decision aid

- **Requirement (R)**: *what* the system must do or satisfy — a capability, constraint, or quality the user/customer cares about. Testable. Asks "is this built?"
- **Decision (D)**: *how* we chose to satisfy it — an architectural or design choice among alternatives. Asks "why this approach?"
- If the user said "we need X" / "the system must Y" → **R**. If the user (or you) said "we'll do it with Z" / "use library Q" → **D**, and the D must be \`driven_by\` the R it satisfies.
- Uncertain? Capture as an **A** (assumption) with a validation path, not as a D.

### Entity Types

| Type | Prefix | Purpose | Lifecycle |
|------|--------|---------|-----------|
| Requirement | R-xxx | What the system must satisfy | draft → accepted → deprecated/rejected |
| Assumption | A-xxx | Believed true, not yet verified | unvalidated → validated → (promoted to R) / invalidated |
| Decision | D-xxx | Architectural or design choice | proposed → accepted → deprecated/superseded |
| Idea | I-xxx | Speculative thought, not yet committed | explore → parked/promoted/rejected |
| Stakeholder | S-xxx | Person/team/group with interest | active → inactive |
| Risk | K-xxx | What could go wrong | identified → mitigated/accepted/materialized/closed |
| Term | T-xxx | Shared vocabulary definition | draft → accepted → deprecated |
| Use Case | UC-xxx | Structured scenario: actors, preconditions, main flow, acceptance criteria | draft → accepted |
| Entity Model | EM-xxx | Structured domain model: entities, attributes, relationships | draft → accepted |
| Vision | V-xxx | Project purpose and direction (root of the graph) | active → retired |

### Key Relationships

- Decision \`driven_by\` Requirement or Assumption (why was this decided?)
- Requirement \`derived_from\` Requirement (decomposition)
- Requirement \`conflicts_with\` Requirement (contradiction)
- Decision \`enables\` Decision (layered decisions)
- Decision \`supersedes\` Decision (replacement)
- Idea \`inspired_by\` any entity (what sparked it)
- Requirement \`requested_by\` Stakeholder (who asked for this?)
- Decision \`affects\` Stakeholder (who is affected?)
- Risk \`mitigated_by\` Decision (what addresses this risk?)
<!-- /arc:agent-instructions -->`;
}

// ─── Delegation stack: install genericized agent/validator/reminder templates ───

const DELEGATION_TEMPLATES: {
	src: string;
	target: string[];
	always: boolean;
}[] = [
	{
		src: "arc-requirements-engineer.md",
		target: [".pi", "agents", "arc-requirements-engineer.md"],
		always: true,
	},
	{
		src: "arc-dogfooding.md",
		target: [".ketchup", "validators", "arc-dogfooding.md"],
		always: false,
	},
	{
		src: "arc-reminder.md",
		target: [".ketchup", "reminders", "arc.md"],
		always: false,
	},
];

function resolveTemplateDir(): string {
	const thisDir = dirname(fileURLToPath(import.meta.url));
	const candidates = [
		join(thisDir, "..", "skill", "agents"),
		join(thisDir, "..", "..", "skill", "agents"),
	];
	for (const path of candidates) {
		if (existsSync(path)) return path;
	}
	throw new Error(
		`Cannot find delegation templates. Tried: ${candidates.join(", ")}`,
	);
}

function deployDelegationStack(cwd: string): void {
	const templateDir = resolveTemplateDir();
	const ketchupExists = existsSync(join(cwd, ".ketchup"));

	console.log("Installing arc agent-delegation stack...");
	for (const t of DELEGATION_TEMPLATES) {
		const targetRel = join(...t.target);
		if (!t.always && !ketchupExists) {
			console.log(`  Skipped ${targetRel} (.ketchup/ not found)`);
			continue;
		}
		const targetPath = join(cwd, ...t.target);
		if (existsSync(targetPath)) console.log(`  Overwriting ${targetRel}`);
		mkdirSync(dirname(targetPath), { recursive: true });
		writeFileSync(
			targetPath,
			readFileSync(join(templateDir, t.src), "utf-8"),
			"utf-8",
		);
		console.log(`  Installed ${targetRel}`);
	}
}

// ─── CLI entry point ───

export function initAgentCommand(): void {
	if (!isArcProject()) {
		console.error("Not an ARC project. Run `arc init` first.");
		process.exit(1);
	}

	const agentsPath = join(process.cwd(), AGENTS_FILE);
	const section = getArcSection();

	if (!existsSync(agentsPath)) {
		writeFileSync(agentsPath, section + "\n", "utf-8");
		console.log(`Created ${AGENTS_FILE} with ARC instructions`);
	} else {
		const existing = readFileSync(agentsPath, "utf-8");
		const startMarker = ARC_SECTION_MARKER;
		const endMarker = "<!-- /arc:agent-instructions -->";
		const startIdx = existing.indexOf(startMarker);
		const endIdx = existing.indexOf(endMarker);

		if (startIdx !== -1 && endIdx !== -1) {
			const endOfSection = endIdx + endMarker.length;
			const updated =
				existing.slice(0, startIdx) + section + existing.slice(endOfSection);
			writeFileSync(agentsPath, updated, "utf-8");
			console.log(`Updated ARC section in ${AGENTS_FILE}`);
		} else {
			const updated = existing.trimEnd() + "\n\n" + section + "\n";
			writeFileSync(agentsPath, updated, "utf-8");
			console.log(`Appended ARC section to ${AGENTS_FILE}`);
		}
	}

	console.log("");
	deployDelegationStack(process.cwd());
	console.log(
		"Agents working in this project will now understand ARC commands and conventions.",
	);
}
