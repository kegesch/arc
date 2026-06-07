### Bottle: Graph Visualization in HTML Report

- [ ] Burst 1: `buildGraphJson` extracts nodes+edges from entities [depends: none]
- [ ] Burst 2: `generateHtmlReportWithGraph` embeds graph data + SVG in full report [depends: 1]
- [ ] Burst 3: Entity `<details>` get anchor IDs for click-to-scroll [depends: 2]
- [ ] Burst 4: Visual polish — graph CSS, legend, tooltip, pan/zoom [depends: 2]
- [ ] Burst 5: Wire into `reportCommand` so `arc report full` includes graph [depends: 2, 3]
