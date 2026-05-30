---
id: EM-001
title: Entity
status: draft
date: 2026-05-30
context: core
entities:
  - name: Entity
    attributes:
      - name: id
        type: EntityTypePrefix-NNN
        required: true
        unique: true
      - name: title
        type: String
        required: true
      - name: type
        type: EntityType
        required: true
      - name: status
        type: EntityStatus
        required: true
      - name: date
        type: ISO date string
        required: true
      - name: tags
        type: String array
        required: false
      - name: body
        type: Markdown string
        required: false
      - name: context
        type: String
        required: false
    relationships:
      - target: Edge
        type: has many outgoing
derived_from: []
---

# Entity Model: Entity

## Entities

(Describe the entities and their relationships)

## Context

(What domain does this model belong to?)
