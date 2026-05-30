---
name: arc-dogfooding
description: Ensures implementation commits are backed by arc requirements or decisions
enabled: true
---

# Arc Dogfooding Validator

This project dogfoods arc. Every implementation change should be traceable to a requirement or decision.

## Scope

Applies when the commit modifies files in `src/` (implementation code).

Does NOT apply to:

- Commits that only modify `.arc/` files (adding requirements, decisions, etc.)
- Commits that only modify test files (`*.test.*`)
- Commits that only modify config files (`package.json`, `tsconfig.json`, `.ketchup/`, etc.)
- Commits that only modify documentation (`*.md` outside `src/`)
- Commits with `appeal:` in the message (explicitly overridden)

## Check

### Missing traceability — NACK if ALL of these are true:

1. The commit modifies at least one file in `src/**/*.ts`
2. The commit does NOT modify any file in `.arc/` (requirements, decisions, assumptions, etc.)
3. The commit message does not reference an arc entity ID (e.g. `R-xxx`, `D-xxx`, `A-xxx`, `K-xxx`)
4. There is no `appeal:` in the commit message

### Unhealthy graph — NACK if:

1. The commit modifies files in `.arc/`, AND
2. The commit message does NOT contain `arc-check-passed`

When you modify `.arc/` entities, you MUST run `arc check` and confirm the graph is healthy before committing. Add `arc-check-passed` to the commit message (body or footer) as proof. If `arc check` reports errors, fix them first.

### ACK if any of these are true:

- The commit also touches `.arc/` AND the commit message contains `arc-check-passed`
- The commit message references an arc entity ID like `R-001`, `D-003`, etc.
- The commit only modifies tests, config, or docs (no `src/` changes)
- The commit includes `appeal:` with a justification

## Why This Matters

Arc's value comes from traceability. If implementation lands without a corresponding `.arc/` change, the graph decays and the project loses its architectural record. Every feature should start with a requirement; every design choice should be a decision. And a graph with broken links or orphan entities is worse than no graph at all — `arc check` ensures integrity.
