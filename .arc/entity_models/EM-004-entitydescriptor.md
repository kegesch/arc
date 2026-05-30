---
id: EM-004
title: EntityDescriptor
status: draft
date: 2026-05-30
context: core
entities:
  - name: EntityDescriptor
    attributes:
      - name: type
        type: EntityType
        required: true
      - name: prefix
        type: String
        required: true
      - name: folder
        type: String
        required: true
      - name: statuses
        type: String array
        required: true
    relationships:
      - target: Entity
        type: describes
derived_from: []
---

# Entity Model: EntityDescriptor

## Entities

(Describe the entities and their relationships)

## Context

(What domain does this model belong to?)
