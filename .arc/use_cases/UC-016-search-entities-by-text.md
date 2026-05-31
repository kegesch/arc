---
id: UC-016
title: Search entities by text
status: draft
date: 2026-05-31
actors:
  - Agent
  - Human
preconditions:
  - Arc project is initialized
main_flow:
  - step: 1
    actor: User
    action: Enter search query with optional modifiers
  - step: 2
    actor: System
    action: Parse query and score entities
  - step: 3
    actor: System
    action: Return ranked results
acceptance_criteria:
  - Results ranked by relevance
  - modifiers filter by type/status/tag
derived_from:
  - R-011
requested_by: []
---

# Use Case: Search entities by text

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
