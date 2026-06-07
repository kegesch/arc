import { describe, expect, test } from "bun:test";
import {
	reportToHtml,
	mdToHtml,
	groupSectionsByCategory,
	buildGraphJson,
	generateHtmlReportWithGraph,
} from "../src/commands/report-html";

describe("mdToHtml", () => {
	test("converts markdown headings to HTML", () => {
		expect(mdToHtml("# Title")).toBe("<h1>Title</h1>");
		expect(mdToHtml("## Subtitle")).toBe("<h2>Subtitle</h2>");
		expect(mdToHtml("### Section")).toContain("<summary>Section</summary>");
	});

	test("converts bold text", () => {
		expect(mdToHtml("**bold**")).toBe("<p><strong>bold</strong></p>");
	});

	test("converts markdown tables to HTML tables", () => {
		const md = `| ID | Title |\n|---|---|\n| R-001 | Encrypt data |`;
		const html = mdToHtml(md);
		expect(html).toContain("<table>");
		expect(html).toContain("<th>ID</th>");
		expect(html).toContain("<td>R-001</td>");
		expect(html).toContain("<td>Encrypt data</td>");
	});

	test("converts unordered list items", () => {
		const md = "- item one\n- item two";
		const html = mdToHtml(md);
		expect(html).toContain("<li>item one</li>");
		expect(html).toContain("<li>item two</li>");
		expect(html).toContain("<ul>");
	});

	test("preserves plain text as paragraphs", () => {
		const html = mdToHtml("Hello world");
		expect(html).toBe("<p>Hello world</p>");
	});

	test("handles em dash characters", () => {
		expect(mdToHtml("—")).toBe("<p>—</p>");
	});
});

describe("reportToHtml", () => {
	test("generates full HTML document with title and styled body", () => {
		const html = reportToHtml(
			"Requirements Catalog",
			"# Requirements Catalog\n\nSome content here.",
		);
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<html");
		expect(html).toContain("</html>");
		expect(html).toContain("<title>Requirements Catalog</title>");
		expect(html).toContain("<style>");
		expect(html).toContain("Requirements Catalog");
		expect(html).toContain("Some content here");
	});

	test("includes navigation sidebar for full report", () => {
		const html = reportToHtml(
			"Architecture Report",
			"## Requirements\n\nContent\n\n## Decisions\n\nMore",
		);
		expect(html).toContain("nav");
		expect(html).toContain("Requirements");
		expect(html).toContain("Decisions");
	});

	test("HTML is valid and self-contained", () => {
		const html = reportToHtml("Test", "# Test");
		expect(html).toMatch(/<meta charset="UTF-8">/);
		expect(html).toMatch(/<style>[\s\S]+<\/style>/);
		expect(html).not.toContain("<link");
		expect(html).not.toContain("<script src");
	});

	test("sidebar groups sections by entity category", () => {
		const html = reportToHtml(
			"Architecture Report",
			"## Requirements\n\nContent\n\n## Unaddressed Requirements\n\nMore\n\n## Decisions\n\nStuff\n\n## Risks\n\nRisk content",
		);
		expect(html).toContain("sidebar-group");
		expect(html).toContain("Requirements");
		expect(html).toContain("Decisions");
		expect(html).toContain("Risks");
	});

	test("wraps h3 sections in collapsible details with nested h4 sub-details", () => {
		const html = reportToHtml(
			"Decisions",
			"# Decision Log\n\n### D-001: Use SQLite\n\n**Status:** accepted\n\n#### Context\n\nWe need local persistence.\n\n#### Decision\n\nUse SQLite.",
		);
		expect(html).toContain('<details id="entity-d-001">');
		expect(html).toContain("<summary>D-001: Use SQLite</summary>");
		expect(html).toContain("<strong>Status:</strong> accepted");
		expect(html).toContain('<details class="sub-detail">');
		expect(html).toContain("<summary>Context</summary>");
		expect(html).toContain("We need local persistence");
		expect(html).toContain("<summary>Decision</summary>");
		expect(html).toContain("Use SQLite");
	});
});

describe("groupSectionsByCategory", () => {
	test("groups sections into entity categories", () => {
		const sections = [
			{ id: "requirements", title: "Requirements", level: 2 },
			{
				id: "unaddressed-requirements",
				title: "Unaddressed Requirements",
				level: 2,
			},
			{ id: "decisions", title: "Decisions", level: 2 },
			{ id: "traceability", title: "Traceability", level: 2 },
			{ id: "risks", title: "Risks", level: 2 },
		];
		const groups = groupSectionsByCategory(sections);
		expect(groups.length).toBeGreaterThanOrEqual(3);
		const reqGroup = groups.find((g) => g.category === "Requirements");
		expect(reqGroup).toBeDefined();
		expect(reqGroup!.sections.length).toBe(2);
	});

	test("uncategorized sections go into overview", () => {
		const sections = [{ id: "summary", title: "Summary", level: 2 }];
		const groups = groupSectionsByCategory(sections);
		const overview = groups.find((g) => g.category === "Overview");
		expect(overview).toBeDefined();
	});
});

describe("buildGraphJson", () => {
	test("extracts nodes with id, title, type, color, and anchor from entities", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
			{
				type: "decision",
				id: "D-001",
				title: "Use AES",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				driven_by: ["R-001"],
				enables: [],
				affects: [],
				depends_on: [],
			},
		];
		const graph = buildGraphJson(entities as any);
		expect(graph.nodes).toHaveLength(2);
		const r = graph.nodes.find((n) => n.id === "R-001");
		expect(r).toBeDefined();
		expect(r!.title).toBe("Encrypt data");
		expect(r!.type).toBe("requirement");
		expect(r!.color).toBe("#4da6ff");
		expect(r!.anchor).toBe("r-001");
	});

	test("extracts edges from entity relationships", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
			{
				type: "decision",
				id: "D-001",
				title: "Use AES",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				driven_by: ["R-001"],
				enables: [],
				affects: [],
				depends_on: [],
			},
		];
		const graph = buildGraphJson(entities as any);
		expect(graph.edges).toHaveLength(1);
		expect(graph.edges[0].from).toBe("D-001");
		expect(graph.edges[0].to).toBe("R-001");
		expect(graph.edges[0].type).toBe("driven_by");
	});

	test("deduplicates duplicate edges", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "A",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
			{
				type: "decision",
				id: "D-001",
				title: "B",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				driven_by: ["R-001", "R-001"],
				enables: [],
				affects: [],
				depends_on: [],
			},
		];
		const graph = buildGraphJson(entities as any);
		const drivenEdges = graph.edges.filter((e) => e.type === "driven_by");
		expect(drivenEdges).toHaveLength(1);
	});
});

describe("generateHtmlReportWithGraph", () => {
	test("embeds interactive graph SVG with nodes, edges, and tooltip", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
			{
				type: "decision",
				id: "D-001",
				title: "Use AES",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				driven_by: ["R-001"],
				enables: [],
				affects: [],
				depends_on: [],
			},
		];
		const html = generateHtmlReportWithGraph("full", entities as any);
		expect(html).toContain("graph-canvas");
		expect(html).toContain("graph-tooltip");
		expect(html).toContain("graph-legend");
		expect(html).toContain("R-001");
		expect(html).toContain("D-001");
		expect(html).toContain("<script>");
	});

	test("includes pan and zoom controls in graph script", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
		];
		const html = generateHtmlReportWithGraph("full", entities as any);
		expect(html).toContain("viewBox");
		expect(html).toContain("wheel");
		expect(html).toContain("mousedown");
	});

	test("includes graph link in sidebar", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
		];
		const html = generateHtmlReportWithGraph("full", entities as any);
		expect(html).toContain('<a href="#graph">Graph</a>');
	});

	test("tooltip uses fixed positioning", () => {
		const entities = [
			{
				type: "requirement",
				id: "R-001",
				title: "Encrypt data",
				status: "accepted",
				date: "2026-01-01",
				tags: [],
				body: "",
				filePath: "",
				derived_from: [],
				conflicts_with: [],
				requested_by: [],
			},
		];
		const html = generateHtmlReportWithGraph("full", entities as any);
		expect(html).toContain("position: fixed");
	});
});
