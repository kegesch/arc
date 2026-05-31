# Ketchup Plan: GH #25 — Driver Commands

## Important

**Use `bun run dev` for all arc commands**, not `arc` (which is the installed npm version).

## Status

- [x] Socratic refinement complete — design decisions resolved
- [x] A-014 invalidated (arc list/status not enough for agents)
- [x] Dangling refs investigated — were valid V-001 relationships, reverted
- [x] Burst 1-4: arc next command implemented and committed
- [ ] Burst 5-8: arc context pending
- [ ] Burst 9-11: arc check gaps pending
- [ ] Burst 12-14: artifacts and docs pending

## Refined Design

| Original                            | Redesigned                                       | Rationale                      |
| ----------------------------------- | ------------------------------------------------ | ------------------------------ |
| `arc next` (with priority ordering) | `arc next` (signals, no ordering)                | Let agent decide priority      |
| `arc gaps` (separate command)       | Merge into `arc check` as warnings               | Simpler, one command           |
| `arc context <id>`                  | Full closure by default, `--shallow` for one-hop | LLMs don't make multiple calls |

### arc next categories (no ordering):

- **ready**: Requirements with accepted decisions + use cases
- **needs_use_cases**: Requirements with accepted decisions but no use cases
- **needs_design**: Requirements with no accepted decisions
- **risky**: Unvalidated assumptions backing accepted decisions
- **orphan**: Decisions with no backing requirement (signal, not error)

### arc check additions:

- Gap warnings (not errors) — exit 0 for gaps, exit 1 for errors only

### arc context:

- Bundles entity + all related entities (decisions, use cases, assumptions, risks)
- Full transitive closure by default
- `--shallow` flag for one-hop only
- `--format json` output

## Bursts

### Bottle: arc next [depends: none]

- [x] Burst 1: Add `findNextCategories` to analysis.ts — pure graph function returning categorized entities
- [x] Burst 2: Add `next` command to commands/next.ts — CLI wrapper with --format json/text
- [x] Burst 3: Register next command in index.ts
- [x] Burst 4: Test arc next with various graph states

### Bottle: arc context [depends: none]

- [ ] Burst 5: Add `buildContextBundle` to analysis.ts — traverse relationships, return entity bundle
- [ ] Burst 6: Add `context` command to commands/context.ts — CLI with --shallow, --format json
- [ ] Burst 7: Register context command in index.ts
- [ ] Burst 8: Test arc context with --shallow and full closure

### Bottle: arc check gaps [depends: none]

- [ ] Burst 9: Add gap detection functions to analysis.ts (requirements without decisions, decisions without use cases, etc.)
- [ ] Burst 10: Integrate gap warnings into check.ts runCheck — warnings only, exit 0
- [ ] Burst 11: Test gap warnings appear in check output

### Bottle: Arc artifacts [depends: none]

- [ ] Burst 12: Update D-047 to reflect redesigned feature (no arc gaps command, signals not orders)
- [ ] Burst 13: Add requirements for driver commands (accepted directly per discussion)

### Bottle: Documentation [depends: all above]

- [ ] Burst 14: Update README.md if needed
