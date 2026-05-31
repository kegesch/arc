---
when:
  hook: SessionStart
priority: 110
---

# Arc Dogfooding: arc Documents Itself

Arc is a tool for architecture traceability. This project must eat its own dog food — every architectural artifact lives in `.arc/`.

## Before Writing Code

1. **Is there a requirement?** If not, add one: `bun run dev add requirement "title"`
2. **Is there a decision?** If making a design choice, add one: `bun run dev add decision "title"` and link it to the relevant requirements
3. **Are you assuming something?** Record it: `bun run dev add assumption "title"`

## Entity Types

| Prefix | Type        | When to Use                                     |
| ------ | ----------- | ----------------------------------------------- |
| R-xxx  | Requirement | New capability or constraint                    |
| D-xxx  | Decision    | Significant design or technology choice         |
| A-xxx  | Assumption  | Unvalidated assumption influencing architecture |
| I-xxx  | Idea        | Exploratory thinking, future possibilities      |
| K-xxx  | Risk        | Identified risk with mitigation status          |
| T-xxx  | Term        | Domain-specific terminology                     |

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
