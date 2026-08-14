---
id: UC-048
title: Developer launches arc repo in an opencode sandbox with pinned toolchain
status: accepted
date: 2026-08-14
tags:
  - toolchain
  - sbx
context: toolchain
actors:
  - Developer
preconditions:
  - Docker Sandboxes (sbx >= 0.38) installed
  - repo checked out
main_flow:
  - Developer runs sbx run opencode --kit ./sbx-opencode/ . from repo root
  - Kit installs digest-pinned mise
  - mise install provisions bun + node from mise.toml
  - Kit runs bun install to pre-warm dependencies
  - opencode agent starts with working toolchain
acceptance_criteria:
  - sbx run opencode --kit ./sbx-opencode/ . succeeds
  - mise installs bun 1.3.x and node 24.x from mise.toml
  - bun install completes before agent starts
  - bun on PATH in both interactive and bash -c shells
derived_from:
  - R-054
requested_by: []
---

# Use Case: Developer launches arc repo in an opencode sandbox with pinned toolchain

## Description

(Describe the use case)

## Main Flow

(Describe the main success scenario)

## Acceptance Criteria

(How do we know this is working?)
