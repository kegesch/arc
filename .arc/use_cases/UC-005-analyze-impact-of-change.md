---
id: UC-005
title: Analyze impact of change
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
    action: Runs arc impact <entity-id>
  - step: 2
    actor: System
    action: Resolves entity by ID
  - step: 3
    actor: System
    action: Walks graph in reverse following incoming edges
  - step: 4
    actor: System
    action: Collects direct and transitive dependents
  - step: 5
    actor: System
    action: Outputs direct dependents and full impact set
acceptance_criteria:
  - Direct dependents listed first
  - Transitive dependents shown
  - Entities grouped by distance from root
derived_from:
  - R-007
requested_by: []
---

# Use Case: Analyze impact of change

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
