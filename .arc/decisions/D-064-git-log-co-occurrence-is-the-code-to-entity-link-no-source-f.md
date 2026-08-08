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
