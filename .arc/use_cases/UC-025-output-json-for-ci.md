---
id: UC-025
title: Output JSON for CI
status: draft
date: 2026-05-31
actors:
  - CI System
preconditions:
  - Arc command executed
main_flow:
  - step: 1
    actor: CI
    action: Run arc command with --format json
  - step: 2
    actor: System
    action: Execute command, collect results
  - step: 3
    actor: System
    action: Output JSON to stdout
  - step: 4
    actor: System
    action: Exit 0 for success, 1 for errors
acceptance_criteria:
  - Valid JSON output
  - clean exit codes
derived_from:
  - R-012
requested_by: []
---

# Use Case: Output JSON for CI

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
