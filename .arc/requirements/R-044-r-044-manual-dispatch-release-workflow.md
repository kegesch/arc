---
id: R-044
title: "R-044: Manual dispatch release workflow"
status: draft
date: 2026-06-07
derived_from: []
conflicts_with: []
requested_by: []
---

Provide a GitHub Actions workflow triggered via workflow_dispatch with a version input. The workflow must build cross-platform binaries (linux-x64, darwin-arm64, windows-x64), create a GitHub Release with those binaries as assets, and publish the package to npm.
