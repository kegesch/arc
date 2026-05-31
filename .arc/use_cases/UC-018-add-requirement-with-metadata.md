---
id: UC-018
title: Add requirement with metadata
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Arc project initialized
main_flow:
  - step: 1
    actor: User
    action: Run arc add requirement with title and flags
  - step: 2
    actor: System
    action: Generate next ID, create Markdown file
  - step: 3
    actor: System
    action: Write YAML frontmatter with id, title, status, date, tags
acceptance_criteria:
  - Markdown file created with valid YAML frontmatter
derived_from:
  - R-002
requested_by: []
---

# Use Case: Add requirement with metadata

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
