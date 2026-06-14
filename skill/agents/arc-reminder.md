---
when:
  hook: SessionStart
priority: 110
---

# Arc Dogfooding: delegate, don't backfill

This project uses arc for architecture traceability. Every architectural artifact lives in `.arc/`.

## Before Writing Code — delegate, don't backfill

Experience shows that capturing architecture *during* focused coding does not happen reliably — an agent told to dogfood will still implement features without recording architecture mid-task. So don't do it yourself mid-task:

1. **Is there an R-xxx for this work?** If not, hand the request to the **`arc-requirements-engineer`** agent. It commits a well-formed slice (R/D/A + links, clean check) and returns one ID.
2. **Then**: run `arc context <R-xxx> --format json` and implement against it.
3. **Reference** `<R-xxx>` in your commit. The dogfooding validator checks the ID *relates* to the diff — a name-drop won't pass.

Author arc entities directly only for trivial touch-ups (`arc link`). Capture is the RE agent's job, not yours mid-coding.

## Entity Types

| Prefix | Type        | When to Use                                     |
| ------ | ----------- | ----------------------------------------------- |
| R-xxx  | Requirement | New capability or constraint                    |
| D-xxx  | Decision    | Significant design or technology choice         |
| A-xxx  | Assumption  | Unvalidated assumption influencing architecture |
| I-xxx  | Idea        | Exploratory thinking, future possibilities      |
| K-xxx  | Risk        | Identified risk with mitigation status          |
| T-xxx  | Term        | Domain-specific terminology                     |

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
