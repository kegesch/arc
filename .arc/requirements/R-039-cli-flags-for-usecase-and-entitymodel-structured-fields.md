---
id: R-039
title: CLI flags for use_case and entity_model structured fields
status: accepted
date: 2026-05-30
derived_from:
  - V-001
conflicts_with: []
requested_by: []
---

arc add must accept structured field flags for use_case (--actors, --preconditions, --acceptance-criteria as comma-separated strings, --main-flow as JSON) and entity_model (--entities as JSON). This enables non-interactive creation of fully-populated use cases and entity models.
