---
id: D-051
title: "D-051: Manual dispatch release workflow over tag-triggered"
status: proposed
date: 2026-06-07
driven_by:
  - R-044
enables: []
depends_on: []
affects: []
---

Use workflow_dispatch with a version input instead of tag-triggered release. Reasons: explicit control over when releases happen, no accidental releases from stray tags, operator can verify before triggering. The existing CI workflow continues to run on push/PR for continuous integration.
