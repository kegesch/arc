---
id: D-066
title: Inject model-provider keys via sbx proxy-managed credentials bound to opencode registry env vars (ZHIPU_API_KEY, OPENCODE_API_KEY), with /connect fallback on a persistent volume
status: accepted
date: 2026-08-14
tags:
  - sandbox
  - credentials
  - opencode
  - zai
context: toolchain
driven_by:
  - R-055
enables: []
depends_on: []
affects: []
---

sbx credentials[] declares services `zai` and `opencode-go` with proxyManaged: true, Bearer injection on api.z.ai and opencode.ai (endpoints and env var names taken from the models.dev registry opencode itself uses; both providers are @ai-sdk/openai-compatible). Service ids deliberately match the secret names already stored on this host (`sbx secret ls`: global `zai`, `opencode-go`), so the existing bindings apply with zero setup. The container sees only the proxy-managed sentinel env var; the host egress proxy swaps the real key into the Authorization header. New machines bind once via `sbx secret set zai` / `sbx secret set opencode-go`. Fallback path: manual /connect inside the TUI, with ~/.local/share/opencode mounted as a 1g persistent volume so auth.json survives restarts. Alternative rejected: shipping keys via kit environment.variables — v2 kit env vars are static values, which would put the raw secret into spec.yaml/CLI history.
