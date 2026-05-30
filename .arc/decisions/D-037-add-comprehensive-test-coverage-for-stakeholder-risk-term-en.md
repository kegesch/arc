---
id: D-037
title: "Add comprehensive test coverage for stakeholder, risk, term entity types"
status: accepted
date: 2026-05-30
driven_by: [R-028, R-029, R-030]
---

Added 65 tests in tests/new-types.test.ts covering: createEntity for all three types, lifecycle transitions (stakeholder active/inactive, risk identified/mitigated/accepted/materialized/closed, term draft/accepted/deprecated), relationships (requested_by, affects, mitigated_by) with auto-inference, graph integration, remove/rename with new types, check behavior, VALID_EDGES completeness. Satisfies issue #2.
