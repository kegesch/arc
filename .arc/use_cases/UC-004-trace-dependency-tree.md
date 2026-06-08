---
id: UC-004
title: Trace dependency tree
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Entity exists in .arc/
  - Graph has relationship edges
main_flow:
  - step: 1
    actor: User
    action: Runs arc trace <entity-id>
  - step: 2
    actor: System
    action: Resolves entity by ID
  - step: 3
    actor: System
    action: Walks graph following dependency edge types
  - step: 4
    actor: System
    action: Builds tree with entity info at each node
  - step: 5
    actor: System
    action: Renders tree with Unicode box-drawing characters
acceptance_criteria:
  - Tree shows all transitive dependencies
  - Each node shows entity type and status
  - Edge types labeled on connections
  - Root entity shown at top
derived_from:
  - R-008
requested_by: []
---

# Use Case: Trace dependency tree

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
