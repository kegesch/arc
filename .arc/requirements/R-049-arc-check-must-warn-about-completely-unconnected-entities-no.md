---
id: R-049
title: arc check must warn about completely unconnected entities (no incoming or outgoing edges)
status: accepted
date: 2026-06-08
derived_from: []
conflicts_with: []
requested_by: []
---

# Requirement: arc check must warn about completely unconnected entities (no incoming or outgoing edges)

## Description

`arc check` must detect entities that have zero incoming and zero outgoing edges — completely disconnected nodes in the graph. These represent architectural knowledge that is not connected to anything else and therefore has no traceability.

## Acceptance Criteria

- Given an entity with no edges in either direction, `arc check` emits a warning of kind `unconnected_entity`
- The warning includes the entity ID, title, and type
- The suggestion recommends linking the entity to related requirements or decisions
