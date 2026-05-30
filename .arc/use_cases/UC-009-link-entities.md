---
id: UC-009
title: Link entities
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Both entities exist in .arc/
  - Edge type is valid for the entity pair
main_flow:
  - step: 1
    actor: User
    action: Runs arc link <from-id> <to-id> with optional --type
  - step: 2
    actor: System
    action: Validates both entity IDs exist
  - step: 3
    actor: System
    action: Infers edge type if not specified
  - step: 4
    actor: System
    action: Validates edge type is valid for the pair
  - step: 5
    actor: System
    action: Updates source entity frontmatter on disk
acceptance_criteria:
  - Relationship added to source entity frontmatter
  - Bidirectional links updated where applicable
  - Invalid edge types rejected
derived_from: []
requested_by: []
---

# Use Case: Link entities

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
