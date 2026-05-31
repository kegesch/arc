---
id: UC-046
title: Expose MCP tools
status: draft
date: 2026-05-31
actors:
  - Agent
preconditions:
  - MCP server running
main_flow:
  - step: 1
    actor: Agent
    action: Connect to arc MCP server
  - step: 2
    actor: System
    action: Expose link, unlink, graph tools
  - step: 3
    actor: Agent
    action: Call tools to manipulate graph
acceptance_criteria:
  - link
  - unlink
  - graph tools available
derived_from:
  - R-021
requested_by: []
---

# Use Case: Expose MCP tools

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
