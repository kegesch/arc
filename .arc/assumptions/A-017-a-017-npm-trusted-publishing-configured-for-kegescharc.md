---
id: A-017
title: "A-017: npm trusted publishing configured for @kegesch/arc"
status: validated
date: 2026-06-07
---

The npm package @kegesch/arc is configured for trusted publishing (linked publishing) on npmjs.com, linking the kegesch/arc GitHub repository and the release.yml workflow. No NPM_TOKEN secret is required — OIDC handles authentication via id-token: write permission.
