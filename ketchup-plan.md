# Ketchup Plan: GH Issue #7 — Structured body fields for entity types

## Status

- [x] Requirements recorded: R-035 (use case), R-036 (entity model), R-037 (rendering), R-038 (validation)
- [x] Decisions recorded: D-040 (frontmatter fields), D-041 (requirement lifecycle), D-042 (EntityDescriptor pattern)
- [x] Implementation — ALL BURSTS DONE — 292 tests passing

## Completed Bursts

### Bottle: Infrastructure ✅

- [x] Burst 1: EntityType union in types.ts
- [x] Burst 2: getTypeFromId() for UC, EM
- [x] Burst 3: CLI validation for new types
- [x] Burst 4: Registry, ENTITY_TYPE_ORDER, VALID_EDGES

### Bottle: Use Case descriptor ✅

- [x] Burst 5: src/entities/usecase.ts
- [x] Burst 6: Register in registry
- [x] Burst 7: UseCase interface in types.ts

### Bottle: Entity Model descriptor ✅

- [x] Burst 8: src/entities/entity-model.ts
- [x] Burst 9: Register in registry
- [x] Burst 10: EntityModel interface in types.ts

### Bottle: Templates ✅

- [x] Burst 11: use_case template
- [x] Burst 12: entity_model template

### Bottle: Rendering ✅

- [x] Burst 13: arc show renders use case structured fields
- [x] Burst 14: arc show renders entity model structured fields
- [x] Burst 15: arc show --format json includes typed fields

### Bottle: Validation ✅

- [x] Burst 16: findStructuredFieldWarnings for use_case
- [x] Burst 17: findStructuredFieldWarnings for entity_model
- [x] Burst 18: Integrated into arc check

### Bottle: Display ✅

- [x] Burst 19: UC and EM colors, icons

### Bottle: Tests ✅

- [x] Burst 20: use_case parse/serialize roundtrip
- [x] Burst 21: entity_model parse/serialize roundtrip
- [x] Burst 22: arc show rendering tests
- [x] Burst 23: arc check validation tests
- [x] Burst 24: CLI usage tests

## Commits

1. `feat(types): add use_case (UC-xxx) and entity_model (EM-xxx) entity types`
2. `feat(display): render structured fields for use_case and entity_model in arc show`
3. `feat(check): validate structured fields for use_case and entity_model`
4. `docs: update README, AGENTS.md, and skill file with use_case and entity_model`
