---
id: D-035
title: "Extract pure functions from list, show, trace, impact commands"
status: accepted
date: 2026-05-30
driven_by: [R-012, D-032]
---

Refactored list.ts (getListResult), show.ts (getShowResult), trace.ts (getTraceResult), impact.ts (getImpactResult) following the status.ts/getStatus() pattern. Each pure function takes a dir parameter and returns structured data. CLI wrappers handle display and process.exit. This directly enables JSON output mode (issue #4) since the pure functions return the data needed for JSON serialization.
