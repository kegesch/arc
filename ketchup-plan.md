# Ketchup Plan: GH Issue #7 — Structured body fields for entity types

## Status

- [x] Requirements recorded: R-035 (use case), R-036 (entity model), R-037 (rendering), R-038 (validation)
- [x] Decisions recorded: D-040 (frontmatter fields), D-041 (requirement lifecycle), D-042 (EntityDescriptor pattern)
- [x] Implementation (bursts 1-12, 19, 20, 21, 24 done — 281 tests passing)

## Defined Scope

**Two new entity types:**
| Type | Prefix | Fields | Relationships |
|------|--------|--------|-------------|
| Use Case | UC-xxx | `actors[]`, `preconditions[]`, `main_flow[{step,actor,action}]`, `acceptance_criteria[]` | `derived_from` (→R-xxx), `requested_by` (→S-xxx), `context` |
| Entity Model | EM-xxx | `entities[{name, attributes[{name,type,required,unique?,length?}], relationships[{target,type}]}]` | `derived_from` (→R-xxx), `context` |

- Lifecycle: `draft → accepted → deprecated` (same as requirements)
- Storage: YAML frontmatter
- Validation: strict in arc check
- Rendering: arc show renders structured fields; arc show --format json includes typed JSON
- Excludes: enhanced decision fields (deferred)

### Bottle: Infrastructure — register new types ✅

- [x] Burst 1: Add `"use_case"` and `"entity_model"` to `EntityType` union in `src/types.ts` [depends: none]
- [x] Burst 2: Add `"UC"` and `"EM"` to `getTypeFromId()` in `src/types.ts` [depends: 1]
- [x] Burst 3: Add `"use_case"` and `"entity_model"` to valid types list in `src/index.ts` CLI validation [depends: 1]
- [x] Burst 4: Add `"UC"` and `"EM"` to registry, ENTITY_TYPE_ORDER, VALID_EDGES [depends: 1]

### Bottle: Use Case entity descriptor ✅

- [x] Burst 5: Create `src/entities/usecase.ts` with EntityDescriptor (parse, serialize, edges, jsonFields, detailRelations, relFields) [depends: 1, 2]
- [x] Burst 6: Register use_case descriptor in registry [depends: 5]
- [x] Burst 7: Add UseCase interface to `src/types.ts` extending EntityBase [depends: 5]

### Bottle: Entity Model entity descriptor ✅

- [x] Burst 8: Create `src/entities/entity-model.ts` with EntityDescriptor [depends: 1, 2]
- [x] Burst 9: Register entity_model descriptor in registry [depends: 8]
- [x] Burst 10: Add EntityModel interface to `src/types.ts` [depends: 8]

### Bottle: Templates ✅

- [x] Burst 11: Add markdown template for use_case [depends: 5]
- [x] Burst 12: Add markdown template for entity_model [depends: 8]

### Bottle: Rendering

- [ ] Burst 13: Ensure `arc show` renders use case structured fields (actors, preconditions, main_flow, acceptance_criteria) [depends: 5, 6]
- [ ] Burst 14: Ensure `arc show` renders entity model structured fields (entities table with attributes and relationships) [depends: 8, 9]
- [ ] Burst 15: Ensure `arc show --format json` includes typed JSON for both new types [depends: 5, 8]

### Bottle: Validation

- [ ] Burst 16: Add structured field validation for use_case in `findStructureAnomalies` (or similar in analysis.ts) [depends: 5]
- [ ] Burst 17: Add structured field validation for entity_model in analysis.ts [depends: 8]
- [ ] Burst 18: Register new anomaly checks in `check` command [depends: 16, 17]

### Bottle: Display (icons/colors for list + status) ✅

- [x] Burst 19: Add display config for UC and EM types (colored dots, icons) in display layer [depends: 5, 8]

### Bottle: Tests ✅

- [x] Burst 20: Test use_case parse/serialize roundtrip [depends: 5, 6]
- [x] Burst 21: Test entity_model parse/serialize roundtrip [depends: 8, 9]
- [ ] Burst 22: Test arc show renders structured fields for both types [depends: 13, 14]
- [ ] Burst 23: Test arc check validates new types [depends: 16, 17, 18]
- [x] Burst 24: Test CLI usage (add, show, list, link, trace, graph, remove, rename, lifecycle) [depends: all]
