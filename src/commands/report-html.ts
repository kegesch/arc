import {
	reportRequirements,
	reportDecisions,
	reportTraceability,
	reportRisks,
	reportFull,
} from "./report.js";
import { buildGraph } from "../graph/graph.js";
import type { Entity } from "../types.js";

export function mdToHtml(md: string): string {
	const lines = md.split("\n");
	const blocks: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (line.startsWith("#### ")) {
			const summary = inlineHtml(line.slice(5));
			const contentLines: string[] = [];
			i++;
			while (
				i < lines.length &&
				!lines[i].match(/^#{1,4} /) &&
				!lines[i].startsWith("|")
			) {
				contentLines.push(lines[i]);
				i++;
			}
			const content = mdToHtml(contentLines.join("\n"));
			if (content.trim()) {
				blocks.push(
					`<details class="sub-detail">\n<summary>${summary}</summary>\n<div class="detail-content">${content}</div>\n</details>`,
				);
			} else {
				blocks.push(
					`<details class="sub-detail">\n<summary>${summary}</summary>\n</details>`,
				);
			}
		} else if (line.startsWith("### ")) {
			const summary = inlineHtml(line.slice(4));
			const contentLines: string[] = [];
			i++;
			while (
				i < lines.length &&
				!lines[i].match(/^#{1,3} /) &&
				!lines[i].startsWith("|")
			) {
				contentLines.push(lines[i]);
				i++;
			}
			const content = mdToHtml(contentLines.join("\n"));
			if (content.trim()) {
				blocks.push(
					`<details>\n<summary>${summary}</summary>\n<div class="detail-content">${content}</div>\n</details>`,
				);
			} else {
				blocks.push(`<details>\n<summary>${summary}</summary>\n</details>`);
			}
		} else if (line.startsWith("## ")) {
			blocks.push(`<h2>${inlineHtml(line.slice(3))}</h2>`);
			i++;
		} else if (line.startsWith("# ")) {
			blocks.push(`<h1>${inlineHtml(line.slice(2))}</h1>`);
			i++;
		} else if (line.startsWith("|")) {
			const tableLines: string[] = [];
			while (i < lines.length && lines[i].startsWith("|")) {
				tableLines.push(lines[i]);
				i++;
			}
			blocks.push(tableToHtml(tableLines));
		} else if (line.startsWith("- ")) {
			const items: string[] = [];
			while (i < lines.length && lines[i].startsWith("- ")) {
				items.push(lines[i].slice(2));
				i++;
			}
			blocks.push(
				`<ul>\n${items.map((it) => `  <li>${inlineHtml(it)}</li>`).join("\n")}\n</ul>`,
			);
		} else if (line.trim() === "") {
			i++;
		} else {
			blocks.push(`<p>${inlineHtml(line)}</p>`);
			i++;
		}
	}

	return blocks.join("\n");
}

function inlineHtml(text: string): string {
	return text
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		.replace(/⚠/g, '<span class="warning-icon">⚠</span>');
}

function tableToHtml(lines: string[]): string {
	if (lines.length < 2) return "";

	const parseRow = (row: string): string[] =>
		row
			.split("|")
			.slice(1, -1)
			.map((cell) => cell.trim());

	const headers = parseRow(lines[0]);
	const dataLines = lines.slice(2);

	const thHtml = headers.map((h) => `    <th>${inlineHtml(h)}</th>`).join("\n");
	const rowsHtml = dataLines
		.map((row) => {
			const cells = parseRow(row);
			return `    <tr>\n${cells.map((c) => `      <td>${inlineHtml(c)}</td>`).join("\n")}\n    </tr>`;
		})
		.join("\n");

	return `<table>
  <thead>
    <tr>\n${thHtml}\n    </tr>
  </thead>
  <tbody>\n${rowsHtml}\n  </tbody>
</table>`;
}

const CSS = `
:root {
  --bg: #ffffff;
  --text: #1a1a2e;
  --accent: #0f3460;
  --accent-light: #e8f0fe;
  --border: #dde1e6;
  --warning: #f0ad4e;
  --error: #dc3545;
  --success: #28a745;
  --muted: #6c757d;
  --surface: #f8f9fa;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (min-width: 900px) {
  .layout { display: flex; gap: 2rem; }
  nav.sidebar { width: 240px; flex-shrink: 0; }
  main { flex: 1; min-width: 0; }
}

nav.sidebar {
  position: sticky;
  top: 2rem;
  align-self: start;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.sidebar-group {
  margin-bottom: 0.75rem;
}

.sidebar-group-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 0.25rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-group li {
  margin-bottom: 0.15rem;
}

.sidebar-group a {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
}

.sidebar-group a:hover {
  text-decoration: underline;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: var(--accent);
  scroll-margin-top: 2rem;
}

h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}

p {
  margin-bottom: 0.75rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0 2rem 0;
  font-size: 0.9rem;
}

thead {
  background: var(--accent);
  color: white;
}

th {
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

tbody tr:hover {
  background: var(--accent-light);
}

ul {
  margin: 0.5rem 0 1rem 1.5rem;
}

li {
  margin-bottom: 0.25rem;
}

strong {
  font-weight: 600;
}

.warning-icon {
  color: var(--warning);
}

details {
  margin: 0.5rem 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

summary {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

summary::before {
  content: "▸";
  font-size: 0.8rem;
  transition: transform 0.15s;
  display: inline-block;
}

details[open] summary::before {
  transform: rotate(90deg);
}

summary:hover {
  background: var(--accent-light);
}

.detail-content {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
}

.sub-detail {
  margin: 0.25rem 0;
  border-color: var(--border);
}

.sub-detail summary {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.sub-detail .detail-content {
  padding: 0.5rem 0.75rem;
}

.report-meta {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 3rem;
}

@media print {
  nav.sidebar { display: none; }
  .graph-section { display: none; }
  .layout { display: block; }
  body { font-size: 11pt; }
  h2 { page-break-before: auto; }
  table { font-size: 9pt; }
  details[open] .detail-content { display: block; }
}

.graph-section {
  margin: 2rem 0 3rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.graph-section h2 { margin-top: 0; margin-bottom: 0.5rem; }
.graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}
.graph-legend span { display: flex; align-items: center; gap: 0.3rem; }
.graph-legend .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
#graph-canvas {
  width: 100%;
  height: 500px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  cursor: grab;
}
#graph-canvas:active { cursor: grabbing; }
#graph-tooltip {
  position: absolute;
  display: none;
  background: var(--text);
  color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}
`.trim();

const CATEGORY_MAP: Record<string, string> = {
	requirements: "Requirements",
	unaddressed: "Requirements",
	"vision-derivation": "Requirements",
	decisions: "Decisions",
	traceability: "Traceability",
	"traceability-matrix": "Traceability",
	"untraced-requirements": "Traceability",
	risks: "Risks",
	"risk-register": "Risks",
};

export interface SectionGroup {
	category: string;
	sections: { id: string; title: string }[];
}

export function groupSectionsByCategory(
	sections: { id: string; title: string; level: number }[],
): SectionGroup[] {
	const map = new Map<string, { id: string; title: string }[]>();
	const order: string[] = [];

	for (const s of sections) {
		let category = "Overview";
		for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
			if (s.id.startsWith(key) || s.id === key) {
				category = cat;
				break;
			}
		}
		if (!map.has(category)) {
			map.set(category, []);
			order.push(category);
		}
		map.get(category)!.push({ id: s.id, title: s.title });
	}

	return order.map((cat) => ({ category: cat, sections: map.get(cat)! }));
}

function extractSections(
	md: string,
): { id: string; title: string; level: number }[] {
	const sections: { id: string; title: string; level: number }[] = [];
	for (const line of md.split("\n")) {
		const h2 = line.match(/^## (.+)$/);
		if (h2) {
			const title = h2[1];
			const id = title
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, "")
				.replace(/\s+/g, "-");
			sections.push({ id, title, level: 2 });
		}
	}
	return sections;
}

function buildSidebar(
	sections: { id: string; title: string; level: number }[],
): string {
	if (sections.length <= 1) return "";

	const groups = groupSectionsByCategory(sections);

	const groupHtml = groups
		.map(
			(g) =>
				`<div class="sidebar-group">
  <div class="sidebar-group-title">${g.category}</div>
  <ul>
${g.sections.map((s) => `    <li><a href="#${s.id}">${s.title}</a></li>`).join("\n")}
  </ul>
</div>`,
		)
		.join("\n");

	return `<nav class="sidebar">
${groupHtml}
</nav>`;
}

export function reportToHtml(title: string, mdContent: string): string {
	const bodyHtml = mdToHtml(mdContent);
	const sections = extractSections(mdContent);

	const navHtml = buildSidebar(sections);

	const bodyWithIds = bodyHtml.replace(/<h2>(.*?)<\/h2>/g, (_, content) => {
		const id = content
			.replace(/<[^>]+>/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, "")
			.replace(/\s+/g, "-");
		return `<h2 id="${id}">${content}</h2>`;
	});

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${CSS}
  </style>
</head>
<body>
  <div class="container">
    <div class="layout">
${navHtml}
      <main>
${bodyWithIds}
      </main>
    </div>
  </div>
</body>
</html>`;
}

const TYPE_COLORS: Record<string, string> = {
	requirement: "#4da6ff",
	assumption: "#ffb347",
	decision: "#77dd77",
	idea: "#dda0dd",
	risk: "#ff6b6b",
	term: "#87ceeb",
	use_case: "#98d8c8",
	entity_model: "#c9b1ff",
	vision: "#ffa500",
	stakeholder: "#b0b0b0",
};

export function buildGraphJson(entities: Entity[]): {
	nodes: {
		id: string;
		title: string;
		type: string;
		color: string;
		anchor: string;
	}[];
	edges: { from: string; to: string; type: string }[];
} {
	const graph = buildGraph(entities);

	const nodes = entities.map((e) => ({
		id: e.id,
		title: e.title,
		type: e.type,
		color: TYPE_COLORS[e.type] ?? "#999",
		anchor: e.id.toLowerCase().replace(/[^a-z0-9]/g, "-"),
	}));

	const seen = new Set<string>();
	const edges: { from: string; to: string; type: string }[] = [];
	for (const edge of graph.edges) {
		const key = `${edge.from}-${edge.to}-${edge.type}`;
		if (seen.has(key)) continue;
		seen.add(key);
		edges.push({ from: edge.from, to: edge.to, type: edge.type });
	}

	return { nodes, edges };
}

export function generateHtmlReport(
	type: string,
	entities: import("../types.js").Entity[],
): string {
	let md: string;
	let title: string;

	switch (type) {
		case "requirements":
			title = "Requirements Catalog";
			md = reportRequirements(entities);
			break;
		case "decisions":
			title = "Decision Log";
			md = reportDecisions(entities);
			break;
		case "traceability":
			title = "Traceability Matrix";
			md = reportTraceability(entities);
			break;
		case "risks":
			title = "Risk Register";
			md = reportRisks(entities);
			break;
		case "full":
			title = "Architecture Report";
			md = reportFull(entities);
			break;
		default:
			title = "Report";
			md = "# Unknown Report Type\n";
	}

	return reportToHtml(title, md);
}

function buildGraphJs(graphData: ReturnType<typeof buildGraphJson>): string {
	return `
(function(){
  var data = ${JSON.stringify(graphData)};
  var svg = document.getElementById('graph-canvas');
  var tooltip = document.getElementById('graph-tooltip');
  if (!svg || !data || data.nodes.length === 0) return;

  var w = svg.clientWidth || 800;
  var h = svg.clientHeight || 500;
  var ns = 'http://www.w3.org/2000/svg';

  var nodeMap = {};
  data.nodes.forEach(function(n) {
    nodeMap[n.id] = Object.assign({}, n, {
      x: w/2 + (Math.random()-0.5)*w*0.6,
      y: h/2 + (Math.random()-0.5)*h*0.6,
      vx: 0, vy: 0
    });
  });

  function el(tag, attrs, parent) {
    var e = document.createElementNS(ns, tag);
    if (attrs) Object.keys(attrs).forEach(function(k){ e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }

  var gEl = el('g', {id:'graph-group'}, svg);
  var defs = el('defs', {}, gEl);
  var marker = el('marker', {
    id:'arrow', viewBox:'0 0 10 10', refX:'24', refY:'5',
    markerWidth:'6', markerHeight:'6', orient:'auto-start-reverse'
  }, defs);
  el('path', {d:'M 0 0 L 10 5 L 0 10 z', fill:'#ccc'}, marker);

  var edgeEls = data.edges.map(function(e) {
    var line = el('line', {
      stroke:'#ccc', 'stroke-width':'1', 'marker-end':'url(#arrow)'
    }, gEl);
    line._from = e.from;
    line._to = e.to;
    return line;
  });

  var nodeEls = data.nodes.map(function(n) {
    var g = el('g', {style:'cursor:pointer'}, gEl);
    var radius = n.type==='vision' ? 14 : n.type==='decision' ? 10 : 8;
    el('circle', {
      r: radius, fill: n.color, stroke:'#fff', 'stroke-width':'2'
    }, g);
    var text = el('text', {
      'font-size':'7', 'font-family':'sans-serif',
      'text-anchor':'middle', dy:'-16', fill:'#555'
    }, g);
    text.textContent = n.id;
    g.addEventListener('mouseenter', function() {
      tooltip.style.display = 'block';
      tooltip.textContent = n.id + ': ' + n.title;
    });
    g.addEventListener('mousemove', function(ev) {
      tooltip.style.left = (ev.clientX + 8) + 'px';
      tooltip.style.top = (ev.clientY - 24) + 'px';
    });
    g.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
    });
    g.addEventListener('click', function() {
      var anchor = document.getElementById('entity-' + n.anchor);
      if (anchor) anchor.scrollIntoView({behavior:'smooth', block:'center'});
    });
    return {g: g, n: nodeMap[n.id]};
  });

  var running = true;
  var frameCount = 0;
  function tick() {
    if (!running) return;
    frameCount++;
    if (frameCount > 300) { running = false; return; }
    for (var i = 0; i < data.nodes.length; i++) {
      for (var j = i+1; j < data.nodes.length; j++) {
        var a = nodeMap[data.nodes[i].id];
        var b = nodeMap[data.nodes[j].id];
        var dx = b.x - a.x, dy = b.y - a.y;
        var dist = Math.sqrt(dx*dx+dy*dy) || 1;
        var force = 2000 / (dist*dist);
        a.vx -= dx/dist*force; a.vy -= dy/dist*force;
        b.vx += dx/dist*force; b.vy += dy/dist*force;
      }
    }
    data.edges.forEach(function(e) {
      var a = nodeMap[e.from], b = nodeMap[e.to];
      if (!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y;
      var dist = Math.sqrt(dx*dx+dy*dy) || 1;
      var force = (dist - 80) * 0.05;
      a.vx += dx/dist*force; a.vy += dy/dist*force;
      b.vx -= dx/dist*force; b.vy -= dy/dist*force;
    });
    data.nodes.forEach(function(n) {
      var nd = nodeMap[n.id];
      nd.vx += (w/2 - nd.x) * 0.01;
      nd.vy += (h/2 - nd.y) * 0.01;
      nd.vx *= 0.6; nd.vy *= 0.6;
      nd.x += nd.vx * 0.3;
      nd.y += nd.vy * 0.3;
      nd.x = Math.max(20, Math.min(w-20, nd.x));
      nd.y = Math.max(20, Math.min(h-20, nd.y));
    });
    nodeEls.forEach(function(ne) {
      ne.g.setAttribute('transform','translate('+ne.n.x+','+ne.n.y+')');
    });
    edgeEls.forEach(function(le) {
      var a = nodeMap[le._from], b = nodeMap[le._to];
      if (!a || !b) return;
      le.setAttribute('x1',a.x); le.setAttribute('y1',a.y);
      le.setAttribute('x2',b.x); le.setAttribute('y2',b.y);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();`;
}

export function generateHtmlReportWithGraph(
	type: string,
	entities: Entity[],
): string {
	const graphData = buildGraphJson(entities);
	const baseHtml = generateHtmlReport(type, entities);

	if (graphData.nodes.length === 0) return baseHtml;

	const legendTypes = [...new Set(entities.map((e) => e.type))].sort();
	const legendHtml = legendTypes
		.map(
			(t) =>
				`<span><span class="dot" style="background:${TYPE_COLORS[t] ?? "#999"}"></span>${t}</span>`,
		)
		.join("");

	const graphSection = `<div class="graph-section">
<h2>Graph</h2>
<div class="graph-legend">${legendHtml}</div>
<svg id="graph-canvas"></svg>
<div id="graph-tooltip"></div>
</div>`;

	const script = `<script>${buildGraphJs(graphData)}</script>`;

	const withGraph = baseHtml
		.replace("</main>", `${graphSection}\n      </main>`)
		.replace("</body>", `${script}\n</body>`);

	return withGraph;
}
