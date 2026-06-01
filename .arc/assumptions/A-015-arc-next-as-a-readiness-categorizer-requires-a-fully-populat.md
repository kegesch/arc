---
id: A-015
title: "Arc next as a readiness categorizer requires a fully populated graph to be useful"
status: invalidated
date: 2026-05-31
---

The original D-047 design for `arc next` assumed that categorizing requirements by readiness would be useful. In practice, this requires all requirements to be recorded in arc first. Most projects track work items in GitHub Issues or Jira, not in arc. The cold start problem makes the feature useless until significant investment has been made in populating the graph.

Invalidated by the redesign in D-050: `arc next <entity>` as a per-entity completeness guide works for any single entity, even in a sparse graph.
