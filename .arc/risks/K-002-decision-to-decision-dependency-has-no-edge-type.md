---
id: K-002
title: Decision-to-decision dependency has no edge type
status: identified
date: 2026-05-30
mitigated_by:
  - D-039
---

D-036 (JSON output) depends on D-035 (pure function extraction), but there is no edge type for decision-decision dependency. driven_by only works from decision to requirement/assumption. enables and supersedes don't capture 'depends on'. This means the dependency graph is incomplete for inter-decision relationships.
