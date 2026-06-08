---
id: UC-003
title: Check project health
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - CI pipeline
preconditions:
  - Project has .arc/ directory
  - At least one entity exists
main_flow:
  - step: 1
    actor: User
    action: Runs arc check with optional --strict or --context flags
  - step: 2
    actor: System
    action: Reads all entity files and builds in-memory graph
  - step: 3
    actor: System
    action: Runs orphan detection on decisions
  - step: 4
    actor: System
    action: Runs contradiction detection on requirements
  - step: 5
    actor: System
    action: Runs dangling reference detection across all edges
  - step: 6
    actor: System
    action: Runs status anomaly detection
  - step: 7
    actor: System
    action: Runs structured field validation on use_case and entity_model
  - step: 8
    actor: System
    action: Outputs results and exits with appropriate code
acceptance_criteria:
  - Orphan decisions detected
  - Contradictions found
  - Dangling references identified
  - Unvalidated assumptions listed
  - Structured field warnings shown
  - Clean exit code 0 when no issues
derived_from:
  - R-005
requested_by: []
---

# Use Case: Check project health

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
