---
id: D-043
title: "Use comma-separated for simple arrays, JSON for complex structures on CLI"
status: accepted
date: 2026-05-30
driven_by: [R-039]
---

Simple string arrays (actors, preconditions, acceptance_criteria) use comma-separated values like existing flags (--tags, --driven-by). Complex nested structures (main_flow, entities) accept a JSON string. This follows the principle of least surprise — simple things are simple, complex things are possible.
