---
id: EM-001
title: Arc domain model
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

# Entity Model: Arc domain model

## Entities

(Describe the entities and their relationships)

## Context

(What domain does this model belong to?)
