---
id: D-041
title: "Reuse requirement lifecycle for new types"
status: proposed
date: 2026-05-30
driven_by: [R-035, R-036]
---

Use case (UC-xxx) and entity model (EM-xxx) entity types will reuse the same status lifecycle as requirements: draft → accepted → deprecated. This keeps the state machine simple and predictable. The status is stored in the status frontmatter field, same as all other entity types.
