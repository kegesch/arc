---
id: UC-040
title: Provide CLI interface
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Arc installed
main_flow:
  - step: 1
    actor: User
    action: Run arc <command> with arguments
  - step: 2
    actor: System
    action: Parse arguments with Commander.js
  - step: 3
    actor: System
    action: Execute command and output results
acceptance_criteria:
  - All commands accessible via CLI
derived_from:
  - R-010
requested_by: []
---

# Use Case: Provide CLI interface

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
