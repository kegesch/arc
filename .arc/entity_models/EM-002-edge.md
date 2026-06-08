---
id: EM-002
title: Edge
status: draft
date: 2026-05-30
context: core
entities:
  - name: Edge
    attributes:
      - name: from
        type: Entity ID
        required: true
      - name: to
        type: Entity ID
        required: true
      - name: type
        type: EdgeType
        required: true
    relationships:
      - target: ArcGraph
        type: belongs to
derived_from:
  - R-003
---

# Entity Model: Edge

## Entities

(Describe the entities and their relationships)

## Context

(What domain does this model belong to?)
