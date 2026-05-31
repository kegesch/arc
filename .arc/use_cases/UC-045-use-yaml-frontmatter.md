---
id: UC-045
title: Use YAML frontmatter
status: draft
date: 2026-05-31
actors:
  - Human
  - Agent
preconditions:
  - Entity file created
main_flow:
  - step: 1
    actor: System
    action: Write entity as Markdown file
  - step: 2
    actor: System
    action: Include YAML frontmatter between --- delimiters
  - step: 3
    actor: System
    action: Store relationships as YAML arrays
acceptance_criteria:
  - YAML frontmatter contains all metadata
derived_from:
  - R-018
requested_by: []
---

# Use Case: Use YAML frontmatter

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
