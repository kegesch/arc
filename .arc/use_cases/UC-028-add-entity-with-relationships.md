---
id: UC-028
title: Add entity with relationships
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: Agent
    action: Run arc add with --driven-by, --derived-from, etc.
  - step: 2
    actor: System
    action: Create entity file
  - step: 3
    actor: System
    action: Parse relationship flags
  - step: 4
    actor: System
    action: Write relationship arrays in frontmatter
acceptance_criteria:
  - Entity created with specified relationships
derived_from:
  - R-020
requested_by: []
---

# Use Case: Add entity with relationships

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
