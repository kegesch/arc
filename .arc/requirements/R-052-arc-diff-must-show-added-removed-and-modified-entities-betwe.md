---
id: R-052
title: arc diff must show added, removed, and modified entities between git refs
status: accepted
date: 2026-08-06
tags:
  - git
  - diff
  - traceability
derived_from:
  - V-001
conflicts_with: []
requested_by: []
---

`arc diff <ref> [ref2]` must report which arc entities changed between two git refs (optional second ref defaults to HEAD), grouped by status: added, removed, modified. Output is human-readable status-grouped briefs, with `--format json` for machine consumers. Covers issue 31 bullet 1 and the intent of issue #6.
