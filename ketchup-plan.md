### Bottle: arc report command (#12)

Goal: `arc report <type>` generates stakeholder-facing markdown documents from the graph.

- [ ] Burst 1: reportRequirements generates requirements catalog [depends: none]
- [ ] Burst 2: reportDecisions generates decision log [depends: none]
- [ ] Burst 3: reportTraceability generates requirement→decision matrix [depends: none]
- [ ] Burst 4: reportRisks generates risk register [depends: none]
- [ ] Burst 5: reportFull generates complete project doc [depends: 1, 2, 3, 4]
- [ ] Burst 6: reportCommand CLI entry point + --output + --format + --context [depends: 5]
- [ ] Burst 7: Register report command in index.ts [depends: 6]
