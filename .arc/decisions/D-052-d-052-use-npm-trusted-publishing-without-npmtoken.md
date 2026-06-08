---
id: D-052
title: "D-052: Use npm trusted publishing without NPM_TOKEN"
status: proposed
date: 2026-06-07
driven_by:
  - R-044
  - A-017
  - A-016
enables: []
depends_on: []
affects: []
---

Use npm linked publishing (OIDC-based trusted publishing) instead of a stored NPM_TOKEN secret. Reasons: no secret to rotate or leak, npm directly verifies the GitHub Actions OIDC identity, provenance is signed automatically.
