---
id: D-063
title: Shell out to git via child_process for all git-scope operations
status: accepted
date: 2026-08-06
tags:
  - git
driven_by:
  - R-052
  - R-053
  - A-020
enables: []
depends_on: []
affects: []
---

All git interaction (diff, rev-list, show) shells out to the installed `git` binary via `child_process.spawnSync`. We do not parse `.git` objects. Git is already installed wherever arc runs (R-001 commits .arc to git); reimplementing object parsing is unmaintainable.
