---
id: UC-007
title: Show entity
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Entity exists in .arc/
main_flow:
  - step: 1
    actor: User
    action: Runs arc show <entity-id>
  - step: 2
    actor: System
    action: Parses frontmatter and builds entity
  - step: 3
    actor: System
    action: Builds graph to find dependencies and dependents
  - step: 4
    actor: System
    action: Renders formatted detail with type-specific fields
acceptance_criteria:
  - Entity header with ID and title
  - Type and status shown
  - Tags and context displayed
  - Structured fields rendered for use_case and entity_model
  - Dependencies and dependents listed
  - File path shown
derived_from:
  - R-003
requested_by: []
---

# Use Case: Show entity

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
