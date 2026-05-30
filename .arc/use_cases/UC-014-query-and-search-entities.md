---
id: UC-014
title: Query and search entities
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Project has .arc/ with entities
main_flow:
  - step: 1
    actor: User
    action: Runs arc query with search terms and optional modifiers
  - step: 2
    actor: System
    action: Parses query for text and structured modifiers
  - step: 3
    actor: System
    action: Scores entities by token overlap
  - step: 4
    actor: System
    action: Returns ranked results
acceptance_criteria:
  - Fuzzy text search across titles and bodies
  - Structured modifiers for type
  - status
  - tag
  - context
  - driven_by
  - id
  - Results ranked by relevance
derived_from: []
requested_by: []
---

# Use Case: Query and search entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
