---
id: EM-003
title: ArcGraph
status: draft
date: 2026-05-30
context: core
entities:
  - name: ArcGraph
    attributes:
      - name: entities
        type: Map of Entity
        required: true
      - name: edges
        type: Edge array
        required: true
      - name: outgoing
        type: Map of Edge array
        required: true
      - name: incoming
        type: Map of Edge array
        required: true
      - name: byContext
        type: Map of Entity array
        required: true
    relationships: []
derived_from:
  - R-003
---

# Entity Model: ArcGraph

## Entities

(Describe the entities and their relationships)

## Context

(What domain does this model belong to?)
