---
id: UC-002
title: Add entity
status: draft
date: 2026-05-30
context: core
actors:
  - User
  - Agent
preconditions:
  - Project has .arc/ directory
  - User has write access to .arc/
main_flow:
  - step: 1
    actor: User
    action: Runs arc add <type> with title and optional flags
  - step: 2
    actor: System
    action: Validates type against registered entity descriptors
  - step: 3
    actor: System
    action: Acquires file lock to prevent ID collision
  - step: 4
    actor: System
    action: Computes next ID by scanning existing files
  - step: 5
    actor: System
    action: Builds frontmatter from parsed flags and defaults
  - step: 6
    actor: System
    action: Writes markdown file to .arc/<type_folder>/ID-slug.md
  - step: 7
    actor: System
    action: Releases lock and prints created entity summary
acceptance_criteria:
  - Entity file created in correct subdirectory
  - Frontmatter contains all required fields
  - ID is auto-incremented
  - Default template body generated if none provided
derived_from: []
requested_by: []
---

# Use Case: Add entity

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
