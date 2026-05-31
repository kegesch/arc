---
id: UC-022
title: Analyze impact of change
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Entity exists in graph
main_flow:
  - step: 1
    actor: Agent
    action: Run arc impact <id>
  - step: 2
    actor: System
    action: Find direct dependents via incoming edges
  - step: 3
    actor: System
    action: Traverse transitive dependents via BFS
  - step: 4
    actor: System
    action: Return direct and transitive lists
acceptance_criteria:
  - Direct and transitive dependents returned
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
