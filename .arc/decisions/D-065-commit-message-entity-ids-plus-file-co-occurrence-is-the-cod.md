---
id: D-065
title: Commit-message entity IDs plus file co-occurrence is the code-to-entity link
status: accepted
date: 2026-08-08
tags:
  - git
  - traceability
driven_by:
  - R-053
enables: []
supersedes: D-064
depends_on: []
affects: []
---

The link from a code file to its arc rationale is extracted from git history: entity IDs referenced in the commit messages of commits touching the file (this repo's arc-dogfooding validator makes those IDs mandatory and semantically checked), unioned with entity files changed in the same commits (co-occurrence). Validation showed co-occurrence alone returns nothing when R/D are captured in a separate docs commit before the code — the commit-message IDs are the enforced linkage.
