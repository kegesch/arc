---
id: A-020
title: Entity filenames follow the id-slug-title convention, so ids can be derived from paths without reading file content
status: validated
date: 2026-08-06
tags:
  - git
  - traceability
---

D-016 defines filenames as `<id>-<slugified-title>.md`. arc diff and arc related classify entities by extracting the id from the file path instead of reading frontmatter. This relies on the convention being followed; today no validator enforces it.
