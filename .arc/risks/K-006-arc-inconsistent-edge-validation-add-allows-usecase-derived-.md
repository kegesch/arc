---
id: K-006
title: "arc inconsistent edge validation: add allows use_case --derived-from <decision>, link rejects it, but check requires it"
status: identified
date: 2026-08-14
tags:
  - dogfooding
  - bug
mitigated_by: []
---

Repro (this session): (1) arc add use_case ... --derived-from D-065 succeeds and creates a UC→D derived_from edge; (2) arc unlink + arc link UC-048 D-065 fails with 'No valid relationship from use_case to decision'; (3) findDecisionsWithoutUseCases (src/graph/analysis.ts:546) warns for any accepted, contextualized decision without an incoming derived_from edge from a use_case — an edge the linker refuses to create. Net effect: the missing_use_case warning is only satisfiable via the add command's unvalidated path, so the graph holds edges the linker considers invalid.
