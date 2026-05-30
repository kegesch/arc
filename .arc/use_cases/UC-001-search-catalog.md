---
id: UC-001
title: "Search catalog"
status: draft
date: 2026-05-30
actors: ["Member", "Librarian"]
preconditions: ["User is authenticated", "Catalog has books"]
main_flow: [{step: 1, actor: "Member", action: "Enters search query"}, {step: 2, actor: "System", action: "Filters catalog by query"}, {step: 3, actor: "System", action: "Displays results"}]
acceptance_criteria: ["Results appear within 1 second", "Empty state shown when no results"]
---

# Use Case: Search catalog

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
