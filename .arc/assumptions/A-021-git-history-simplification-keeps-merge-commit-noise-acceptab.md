---
id: A-021
title: Git history simplification keeps merge-commit noise acceptable in arc related
status: validated
date: 2026-08-06
tags:
  - git
  - traceability
---

`git rev-list HEAD -- <file>` includes only merge commits that actually changed the file relative to both parents (git prunes no-op merges), so including merges in arc related does not cause double counting. Verified empirically in a scratch repo. We assume this behavior is stable across git versions.
