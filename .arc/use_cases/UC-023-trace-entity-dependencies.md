---
id: UC-023
title: Trace entity dependencies
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Entity exists in graph
main_flow:
  - step: 1
    actor: Agent
    action: Run arc trace <id>
  - step: 2
    actor: System
    action: Follow outgoing dependency edges
  - step: 3
    actor: System
    action: Build tree structure with edge types
  - step: 4
    actor: System
    action: Return trace tree
acceptance_criteria:
  - Full dependency tree returned with edge types
derived_from:
  - R-008
requested_by: []
---

# Use Case: Trace entity dependencies

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
