---
id: A-014
title: "arc list and arc status provide enough context for an agent to understand a codebase"
status: invalidated
date: 2026-05-30
---

When I started, I read ~15 source files to understand the codebase. Running arc status would have shown 77 entities and 66 relationships. Running arc list would have shown all entity titles. But the entity titles are summaries — they don't contain enough detail to understand implementation patterns. arc show on individual entities would have been needed for each relevant decision. The question is whether this would have been faster than reading source files directly.
