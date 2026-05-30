---
when:
  hook: SessionStart
priority: 110
---

# Arc Dogfooding: arc Documents Itself

Arc is a tool for architecture traceability. This project must eat its own dog food — every architectural artifact lives in `.arc/`.

## Before Writing Code

1. **Is there a requirement?** If not, add one: `arc add requirement "title"`
2. **Is there a decision?** If making a design choice, add one: `arc add decision "title"` and link it to the relevant requirements
3. **Are you assuming something?** Record it: `arc add assumption "title"`

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
- **Decisions link to requirements** — `arc link <decision> <requirement>`
- **Assumptions get validated or invalidated** — never left in limbo
- **After implementation, run `arc check`** — keep the graph healthy

## Commands Reference

```bash
arc status              # project health summary
arc list                # list all entities
arc add <type> <title>  # add entity
arc show <id>           # entity detail + relationships
arc link <from> <to>    # create relationship
arc trace <id>          # trace dependency tree
arc impact <id>         # what breaks if this changes
arc check               # health check
arc validate <id>       # mark assumption validated
arc invalidate <id>     # mark assumption invalidated
arc promote <id>        # promote assumption/idea to requirement
```

## Anti-Patterns to Avoid

- Designing in code comments instead of decisions
- Implementing without a requirement
- Leaving assumptions untracked
- Forgetting to link decisions to their driving requirements
- Skipping `arc check` after changes
