---
id: UC-020
title: Detect orphan decisions
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Decisions exist in graph
main_flow:
  - step: 1
    actor: Agent
    action: Run arc check
  - step: 2
    actor: System
    action: Find decisions with empty driven_by
  - step: 3
    actor: System
    action: Report orphan decisions as warnings
acceptance_criteria:
  - Decisions without driven_by flagged in check output
derived_from:
  - R-005
requested_by: []
---

# Use Case: Detect orphan decisions

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
