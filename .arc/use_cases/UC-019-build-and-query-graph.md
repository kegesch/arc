---
id: UC-019
title: Build and query graph
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Arc entities exist on disk
main_flow:
  - step: 1
    actor: Agent
    action: Run any arc command
  - step: 2
    actor: System
    action: Read all entity files from .arc/
  - step: 3
    actor: System
    action: Parse YAML frontmatter, extract edges
  - step: 4
    actor: System
    action: Build bidirectional graph in memory
acceptance_criteria:
  - In-memory graph built in under 1s for 10000 entities
derived_from:
  - R-003
requested_by: []
---

# Use Case: Build and query graph

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
