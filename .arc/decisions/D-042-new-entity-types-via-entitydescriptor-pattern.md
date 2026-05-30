---
id: D-042
title: "New entity types via EntityDescriptor pattern"
status: proposed
date: 2026-05-30
driven_by: [R-035, R-036, R-038, R-037]
---

The two new entity types (use_case, entity_model) will be implemented by creating new EntityDescriptor objects in src/entities/ and registering them in the registry, following the same pattern as the existing 7 entity types. No switch statements. Each descriptor defines parse/serialize/edges/jsonFields/relFields/detailRelations for its structured fields.
