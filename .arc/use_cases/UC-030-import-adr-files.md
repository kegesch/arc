---
id: UC-030
title: Import ADR files
status: draft
date: 2026-05-31
actors:
  - Human
preconditions:
  - ADR markdown files exist
main_flow:
  - step: 1
    actor: User
    action: Run arc import <directory> --type adr
  - step: 2
    actor: System
    action: Scan directory for markdown files
  - step: 3
    actor: System
    action: Parse title and status from each file
  - step: 4
    actor: System
    action: Create decision entities
acceptance_criteria:
  - ADR decisions imported with title and status
derived_from:
  - R-023
requested_by: []
---

# Use Case: Import ADR files

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
