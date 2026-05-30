---
id: D-040
title: "Use frontmatter fields for structured data"
status: proposed
date: 2026-05-30
driven_by: [R-035, R-036]
---

Structured fields for use_case and entity_model types will be stored in YAML frontmatter, consistent with the existing pattern (driven_by, enables, etc.). This enables machine parsing without reading the markdown body. For entity models, the structured YAML defines entities[].attributes[].name/type/required/unique/length and entities[].relationships[].target/type. Use cases get actors[], preconditions[], main_flow[].step/.actor/.action, and acceptance_criteria[] in frontmatter.
