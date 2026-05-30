---
id: UC-013
title: Initialize project
status: draft
date: 2026-05-30
context: core
actors:
  - User
preconditions:
  - Current directory is not already an ARC project
main_flow:
  - step: 1
    actor: User
    action: Runs arc init
  - step: 2
    actor: System
    action: Creates .arc/ directory structure
  - step: 3
    actor: System
    action: Writes arc.yaml with directory name as project name
acceptance_criteria:
  - .arc/ directory created
  - Subdirectories for all entity types created
  - arc.yaml with project name written
derived_from: []
requested_by: []
---

# Use Case: Initialize project

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
