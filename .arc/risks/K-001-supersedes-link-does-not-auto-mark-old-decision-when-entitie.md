---
id: K-001
title: "Supersedes link does not auto-mark old decision when entities are hand-edited"
status: mitigated
date: 2026-05-30
---

When D-033 was hand-edited (not created via arc add --supersedes), D-009 remained in accepted status instead of being auto-marked as superseded. The auto-marking only works via createEntity, not when linking after the fact. This caused arc check to flag a status anomaly.
