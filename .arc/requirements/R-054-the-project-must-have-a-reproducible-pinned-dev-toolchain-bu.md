---
id: R-054
title: The project must have a reproducible, pinned dev toolchain (bun, node) provisionable in CI, locally, and inside agent sandboxes
status: accepted
date: 2026-08-14
tags:
  - toolchain
  - mise
  - sandbox
context: toolchain
derived_from:
  - V-001
conflicts_with: []
requested_by: []
---

arc is developed with bun and published via node/npm. Tool versions were previously implicit (CI used unpinned latest bun). A single source of truth (mise.toml) must pin bun 1.3.x and node 24.x so local dev, CI, and Docker Sandbox agents all run the same toolchain.
