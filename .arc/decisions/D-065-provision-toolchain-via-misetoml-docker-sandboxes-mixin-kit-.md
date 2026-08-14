---
id: D-065
title: Provision toolchain via mise.toml + Docker Sandboxes mixin kit (sbx-opencode/arc-toolchain), and pin bun in CI workflows
status: accepted
date: 2026-08-14
tags:
  - toolchain
  - mise
  - sbx
  - sandbox
context: toolchain
driven_by:
  - R-054
enables: []
depends_on: []
affects: []
---

mise.toml pins bun=1.3 and node=24 as the single source of truth. CI workflows pin setup-bun to 1.3.x explicitly. For Docker Sandboxes, a kind:mixin kit (sbx-opencode/, schemaVersion 2, requires.agent=opencode) installs a digest-pinned mise, provisions bun+node from the repo mise.toml, pre-warms bun install, and wires mise shims into both interactive (mise activate in ~/.bashrc) and non-interactive (BASH_ENV) shells. Alternative considered: baking a custom template image — rejected because a declarative kit stays version-controlled next to the code and needs no image build/publish pipeline.
