---
id: V-001
title: Arc is the driver for agentic software engineering
status: active
date: 2026-05-31
---

# Vision: Arc is the driver for agentic software engineering

## Purpose

Arc is the architecture knowledge graph that drives agentic software engineering. An agent can read source files, scan for tests, and check if code compiles. It cannot synthesize "what should I build next?" from a web of 100+ relationships across requirements, decisions, assumptions, risks, and ideas. That synthesis is arc's job.

Arc is not a workflow orchestrator. It is not a code scanner. It does not annotate source files. Arc is the graph. Every entity traces up to a reason for existing. Every query returns structured data that agents can act on without ambiguity.

## Guiding Principle

Per D-045: Arc answers questions agents cannot answer themselves.

| Agent can do alone | Agent needs arc for |
|---|---|
| Read source files | "What should I build next?" |
| Scan for tests | "Where is the graph incomplete?" |
| Find code that implements X | "What backs this decision?" |
| Check if tests pass | "What breaks if I change this?" |
| Maintain file-level mental model | "Gather all context for R-003" |
| Formulate a project purpose | "Why does this project exist?" |

The left column is NOT arc's job. The right column IS.

## Direction

1. Record what was decided and why — the knowledge graph with rich entity types and relationships (done)
2. Root the graph in a vision — every entity traces to a reason (done, V-xxx)
3. Structure decisions, requirements, and specs so machines can read them — UC-xxx, EM-xxx types (done)
4. Drive the generative pipeline — arc next, arc gaps, arc context answer what next? (#25)
5. Diff to show architectural change over time (#6)
6. Render stakeholder-readable reports so humans stay in the loop (#12)
7. Enforce process rules in CI so nothing ships without traceability (#14)

## Success Criteria

An AI agent queries arc to answer:
- "Why does this project exist?" → arc show V-001
- "What should I build next?" → arc next
- "Where is the graph incomplete?" → arc gaps
- "Give me everything for R-003" → arc context R-003 --format json
- "What backs this decision?" → arc trace D-001 --format json
- "What breaks if I change this?" → arc impact A-001 --format json
- "What changed since yesterday?" → arc diff HEAD~10
- "Are we ready to deploy?" → arc check --ci
