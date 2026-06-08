---
id: UC-015
title: Import ADR files
status: draft
date: 2026-05-30
context: core
actors:
  - User
preconditions:
  - Directory contains ADR markdown files
main_flow:
  - step: 1
    actor: User
    action: Runs arc import <path>
  - step: 2
    actor: System
    action: Scans directory for markdown files
  - step: 3
    actor: System
    action: Extracts title from headings and status from content
  - step: 4
    actor: System
    action: Creates decision entity for each ADR
acceptance_criteria:
  - ADR files parsed for title and status
  - Each ADR becomes a decision entity
  - Relationships not imported (manual step)
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
