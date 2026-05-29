# Implementation Plan: Issues #5, #4, #2

## Order: #5 → #4 → #2

### Bottle: Refactor (#5) — Extract pure functions from command files

- [ ] Burst 1: Extract `getListResult()` pure function from `list.ts` [depends: none]
- [ ] Burst 2: Extract `getShowResult()` pure function from `show.ts` [depends: none]
- [ ] Burst 3: Extract `getTraceResult()` pure function from `trace.ts` [depends: none]
- [ ] Burst 4: Extract `getImpactResult()` pure function from `impact.ts` [depends: none]

### Bottle: JSON Output (#4) — Add --format json to commands

- [ ] Burst 5: Add `--format json` to `arc list` [depends: 1]
- [ ] Burst 6: Add `--format json` to `arc show` [depends: 2]
- [ ] Burst 7: Add `--format json` to `arc trace` [depends: 3]
- [ ] Burst 8: Add `--format json` to `arc impact` [depends: 4]
- [ ] Burst 9: Add `--format json` to `arc status` (logic already exists) [depends: none]
- [ ] Burst 10: Add `--format json` to `arc add` [depends: none]
- [ ] Burst 11: Add `--format json` to `arc validate/invalidate/promote` [depends: none]

### Bottle: Tests (#2) — Test coverage for stakeholder, risk, term

- [ ] Burst 12: Tests for stakeholder entity creation, parsing, relationships, lifecycle [depends: none]
- [ ] Burst 13: Tests for risk entity creation, parsing, relationships, lifecycle [depends: none]
- [ ] Burst 14: Tests for term entity creation, parsing, lifecycle [depends: none]
- [ ] Burst 15: Tests for `arc link` with new edge types (requested_by, affects, mitigated_by) [depends: none]
- [ ] Burst 16: Tests for `arc check` catching issues with new entity types [depends: none]
