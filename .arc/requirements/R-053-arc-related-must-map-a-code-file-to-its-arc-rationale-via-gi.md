---
id: R-053
title: arc related must map a code file to its arc rationale via git history
status: accepted
date: 2026-08-06
tags:
  - git
  - traceability
derived_from:
  - V-001
conflicts_with: []
requested_by: []
---

`arc related <file>` must find the arc entities that co-occur with a given code file in git history (commits that touched the file also touched the entity files) and show their rationale chain traced up through the graph. Full history, distinct entities, merge commits included. Covers issue 31 bullet 2.
