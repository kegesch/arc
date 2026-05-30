---
id: D-036
title: "Add --format json to all commands"
status: accepted
date: 2026-05-30
driven_by: [R-012, D-032]
---

Added --format json to: list, show, trace, impact, status, add, validate, invalidate, promote. Each command's CLI wrapper checks opts.format and outputs JSON via the pure functions extracted in D-035. status already had getStatus() pure function so just needed the CLI flag. This satisfies issue #4 and R-012 for programmatic use.
