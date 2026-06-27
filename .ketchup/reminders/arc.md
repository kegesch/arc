---
when:
  hook: SessionStart
priority: 110
---

# Arc Dogfooding: arc Documents Itself

Arc is a tool for architecture traceability. This project must eat its own dog food — every architectural artifact lives in `.arc/`.

## Before Writing Code — query first, delegate, don't backfill

K-004 (evidence: A-013) shows that capturing architecture *during* focused coding does not happen reliably. So don't do it yourself mid-task:

0. **Read first.** Run `arc query "<area>"` and `arc status` to see what already exists. Avoid duplicating an existing R, D, or A.
1. **Is there an R-xxx for this work?** If not, hand the request to the **`arc-requirements-engineer`** agent. It commits a well-formed slice (R/D/A + links, clean check) and returns one ID.
2. **Then**: run `arc context <R-xxx> --format json` and implement against it.
3. **Reference** `<R-xxx>` in your commit. The dogfooding validator (v2) checks the ID *relates* to the diff — a name-drop won't pass.

Author arc entities directly only for trivial touch-ups (`arc link`). Capture is the RE agent's job, not yours mid-coding.

## Rework: supersede, don't duplicate

When a design choice changes, don't add a parallel `D-xxx`. Either edit the existing decision in place, or supersede it: `arc link <new-D> <old-D> --type=supersedes`. The same applies to requirements that are no longer needed — mark them `deprecated` rather than leaving stale guidance in the graph.

## R vs D — a quick decision aid

- **Requirement (R)**: *what* the system must do — a capability, constraint, or quality someone cares about. Testable. "Is this built?"
- **Decision (D)**: *how* we chose to satisfy it — an architectural or design choice among alternatives. "Why this approach?"
- If the user said "we need X" / "the system must Y" → **R**. If you (or the user) said "we'll do it with Z" → **D**, and the D must be `driven_by` the R.
- Uncertain? Capture as an **A** (assumption) with a validation path, not as a D.

## Entity Types

| Prefix | Type         | When to Use                                                |
| ------ | ------------ | ---------------------------------------------------------- |
| R-xxx  | Requirement  | New capability or constraint                               |
| D-xxx  | Decision     | Significant design or technology choice                    |
| A-xxx  | Assumption   | Unvalidated assumption influencing architecture            |
| I-xxx  | Idea         | Exploratory thinking, future possibilities                 |
| K-xxx  | Risk         | Identified risk with mitigation status                     |
| T-xxx  | Term         | Domain-specific terminology                                |
| S-xxx  | Stakeholder  | Person, team, or group with interest in the system         |
| UC-xxx | Use Case     | Structured scenario (actors, preconditions, main flow)     |
| EM-xxx | Entity Model | Domain entities, attributes, and relationships             |
| V-xxx  | Vision       | Project purpose and direction (root of the graph)          |

## Workflow Rules

- **Every feature starts with a requirement** — no code without an R-xxx
- **Every design choice gets a decision** — no ad-hoc architecture
- **Decisions link to requirements** — `bun run dev link <decision> <requirement>`
- **Assumptions get validated or invalidated** — never left in limbo
- **After implementation, run `bun run dev check`** — keep the graph healthy

## Commands Reference

```bash
bun run dev status              # project health summary
bun run dev list                # list all entities
bun run dev add <type> <title>  # add entity
bun run dev show <id>           # entity detail + relationships
bun run dev link <from> <to>    # create relationship
bun run dev trace <id>          # trace dependency tree
bun run dev impact <id>         # what breaks if this changes
bun run dev check               # health check
bun run dev validate <id>       # mark assumption validated
bun run dev invalidate <id>     # mark assumption invalidated
bun run dev promote <id>        # promote assumption/idea to requirement
```

## Anti-Patterns to Avoid

- Designing in code comments instead of decisions
- Implementing without a requirement
- Leaving assumptions untracked
- Forgetting to link decisions to their driving requirements
- Skipping `bun run dev check` after changes
