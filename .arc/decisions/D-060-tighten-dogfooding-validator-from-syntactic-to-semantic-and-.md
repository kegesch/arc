---
id: D-060
title: Tighten dogfooding validator from syntactic to semantic and add a pre-edit reminder
status: proposed
date: 2026-06-14
tags:
  - agents
  - integration
driven_by:
  - R-010
enables: []
depends_on:
  - D-059
affects: []
---

## Context

The current dogfooding validator (`.ketchup/validators/arc-dogfooding.md`) has two gaps exposed by K-004:

1. **Timing.** It fires at commit time — after code already exists. The SessionStart reminder fires once, then goes silent exactly during the focused-coding window A-013 describes.
2. **Semantics.** The check is syntactic — "did the commit message mention *an* entity ID?" — and `appeal:` is an unconstrained override. An agent can satisfy the letter while violating the spirit.

## Decision (gated on D-059 adoption)

1. **Pre-edit reminder/hook.** When an agent is about to modify `src/`, surface: *"Is there an R-xxx for this? If not, hand to the RE agent. If yes, run `arc context <id>`."* This closes the timing gap — the prompt arrives at the decision moment, not after the code is written.
2. **Semantic validator (v2).** The referenced R-xxx must actually relate to the diff — e.g. overlap checked via `arc context <id>` against the changed files — not merely appear in the message. Tighten `appeal:` so it requires a real justification that the validator (or a reviewer) can assess.

## Consequences

- Closes both the timing gap and the appeal loophole.
- **Only worth building once D-059 exists:** a semantic check needs a real, RE-authored requirement to check against. Building it before the delegation contract exists would just reject more commits without giving agents a path to satisfy it. Hence `depends_on D-059` and `status: proposed`.
- Keeps the validator honest: enforcement is only as good as the escape hatch is narrow.

## Non-goal

This does not add graph features to arc. It tightens the ketchup enforcement layer that already references arc. It is a process decision, governed by arc because process decisions are architecture too.
