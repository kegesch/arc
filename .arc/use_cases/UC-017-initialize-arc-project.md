---
id: UC-017
title: Initialize arc project
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Git repository exists
main_flow:
  - step: 1
    actor: User
    action: Run arc init in project root
  - step: 2
    actor: System
    action: Create .arc/ directory with subdirectories
  - step: 3
    actor: System
    action: Update .gitignore to track .arc/
acceptance_criteria:
  - .arc/ directory created
  - .gitignore updated
derived_from:
  - R-001
requested_by: []
---

# Use Case: Initialize arc project

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
