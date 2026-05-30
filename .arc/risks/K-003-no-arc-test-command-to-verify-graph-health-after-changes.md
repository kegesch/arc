---
id: K-003
title: "No arc test command to verify graph health after changes"
status: mitigated
date: 2026-05-30
---

When making changes to the arc codebase, there is no way to verify the .arc/ graph is still healthy without running arc check manually. A pre-commit hook or arc test command that runs arc check alongside bun test would catch issues like D-009 being left in accepted status.
