---
id: D-064
title: Git-log co-occurrence is the code-to-entity link; no source field
status: accepted
date: 2026-08-06
tags:
  - git
  - traceability
driven_by:
  - R-053
  - A-021
enables: []
depends_on: []
affects: []
---

The link from code files to arc entities is inferred: a commit that changes a code file and also changes entity files relates those entities to that code. No `source:` frontmatter field is added. Precision is lower than explicit annotation but works retroactively on any repo with zero schema change (issue 31 chose this over an explicit field).

Co-occurrence is computed at two granularities, unioned: (1) per commit touching the file, and (2) at branch scope — entity files changed anywhere since the `merge-base` with the integration branch (detected in order: `origin/HEAD`, the branch upstream, `origin/main`, local `main`, local `master`; skipped when none exist). Branch scope covers features whose entity capture (R/D burst) and code land in separate commits, which the per-commit scan alone misses. Validation on this repo: `arc related src/commands/diff.ts` returns the feature's entities (R-052, R-053, D-063, D-064, A-020, A-021) even though no commit touching `diff.ts` changed an entity file.
