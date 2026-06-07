import { describe, expect, test } from "bun:test";
import {
	reportToHtml,
	mdToHtml,
	groupSectionsByCategory,
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

	test("wraps h3 sections in collapsible details elements", () => {
		const html = reportToHtml(
			"Decisions",
			"# Decision Log\n\n## D-001: Use SQLite\n\n**Status:** accepted\n\n### Context\n\nWe need local persistence.\n\n### Decision\n\nUse SQLite.",
		);
		expect(html).toContain("<details>");
		expect(html).toContain("<summary>");
		expect(html).toContain("Context");
		expect(html).toContain("We need local persistence");
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
