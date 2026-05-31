---
id: UC-044
title: Parse files on every command
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - Entity files exist
main_flow:
  - step: 1
    actor: Agent
    action: Run any arc command
  - step: 2
    actor: System
    action: Read all .md files from .arc/
  - step: 3
    actor: System
    action: Parse YAML frontmatter
  - step: 4
    actor: System
    action: Build fresh in-memory graph
acceptance_criteria:
  - All files parsed from disk on each invocation
derived_from:
  - R-017
requested_by: []
---

# Use Case: Parse files on every command

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
