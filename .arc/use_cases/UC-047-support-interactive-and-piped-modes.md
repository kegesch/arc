---
id: UC-047
title: Support interactive and piped modes
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
    action: Run arc add interactively or via pipe
  - step: 2
    actor: System
    action: Detect TTY status
  - step: 3
    actor: System
    action: Use prompts if TTY, accept args if piped
acceptance_criteria:
  - Works in TTY and non-TTY modes
derived_from:
  - R-026
requested_by: []
---

# Use Case: Support interactive and piped modes

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
