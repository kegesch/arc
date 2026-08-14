---
id: R-055
title: opencode sandboxes must authenticate to the user's model providers (Z.AI GLM Coding Plan, OpenCode Go) without raw API keys persisting in container storage
status: accepted
date: 2026-08-14
tags:
  - sandbox
  - credentials
  - opencode
  - zai
context: toolchain
derived_from:
  - V-001
conflicts_with: []
requested_by: []
---

The arc sandbox kit targets opencode running against zai-coding-plan (GLM Coding Plan) and opencode-go subscriptions. Keys are long-lived API credentials; if written into container storage (opencode auth.json) they would be exposed to any code the agent executes and would survive image/volume inspection. The kit must provision authentication such that the real keys stay host-side.
