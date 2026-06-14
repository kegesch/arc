import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { initAgentCommand } from "../src/commands/init-agent";

const TMP = join(import.meta.dir, "_tmp_init_agent");
const ARC_DIR = ".arc";

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	// Set up a minimal .arc/ directory so isArcProject() returns true
	mkdirSync(join(TMP, ARC_DIR, "decisions"), { recursive: true });
	writeFileSync(join(TMP, ARC_DIR, "arc.yaml"), "name: test\n", "utf-8");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("init-agent command", () => {
	test("creates AGENTS.md with ARC section if it does not exist", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);

			initAgentCommand();

			const agentsPath = join(TMP, "AGENTS.md");
			expect(existsSync(agentsPath)).toBe(true);

			const content = readFileSync(agentsPath, "utf-8");
			expect(content).toContain("ARC");
			expect(content).toContain("arc add");
			expect(content).toContain("arc check");
			expect(content).toContain("<!-- arc:agent-instructions -->");
		} finally {
			process.chdir(originalDir);
		}
	});

	test("appends ARC section to existing AGENTS.md", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);

			// Create existing AGENTS.md
			writeFileSync(
				join(TMP, "AGENTS.md"),
				"# My Project\n\nSome existing content.\n",
				"utf-8",
			);

			initAgentCommand();

			const content = readFileSync(join(TMP, "AGENTS.md"), "utf-8");
			expect(content).toContain("My Project");
			expect(content).toContain("Some existing content");
			expect(content).toContain("<!-- arc:agent-instructions -->");
			expect(content).toContain("arc add");
		} finally {
			process.chdir(originalDir);
		}
	});

	test("updates existing ARC section if already present", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);

			// Create AGENTS.md with an old ARC section
			const oldSection = `<!-- arc:agent-instructions -->
## ARC — Old Version

Old instructions here.
<!-- /arc:agent-instructions -->`;

			writeFileSync(
				join(TMP, "AGENTS.md"),
				`# Project\n\n${oldSection}\n`,
				"utf-8",
			);

			initAgentCommand();

			const content = readFileSync(join(TMP, "AGENTS.md"), "utf-8");
			expect(content).toContain("# Project");
			expect(content).not.toContain("Old instructions here");
			expect(content).toContain("arc add");
			expect(content).toContain("<!-- arc:agent-instructions -->");

			// Should only have one ARC section
			const markerOccurrences =
				content.split("<!-- arc:agent-instructions -->").length - 1;
			expect(markerOccurrences).toBe(1);
		} finally {
			process.chdir(originalDir);
		}
	});

	test("does not duplicate ARC section on repeated runs", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);

			initAgentCommand();
			initAgentCommand();

			const content = readFileSync(join(TMP, "AGENTS.md"), "utf-8");
			const markerOccurrences =
				content.split("<!-- arc:agent-instructions -->").length - 1;
			expect(markerOccurrences).toBe(1);
		} finally {
			process.chdir(originalDir);
		}
	});

	test("exits with error if not an ARC project", () => {
		const originalDir = process.cwd();
		const noArcDir = join(TMP, "no-arc");
		mkdirSync(noArcDir, { recursive: true });

		// Mock process.exit to catch the exit code
		const originalExit = process.exit;
		let exitCode = -1;
		process.exit = ((code: number) => {
			exitCode = code ?? 0;
			// Don't actually exit — throw to stop execution
			throw new Error(`process.exit(${exitCode})`);
		}) as never;

		try {
			process.chdir(noArcDir);
			expect(() => initAgentCommand()).toThrow("process.exit(1)");
			expect(exitCode).toBe(1);
		} finally {
			process.exit = originalExit;
			process.chdir(originalDir);
		}
	});

	test("includes all seven entity types", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);

			initAgentCommand();

			const content = readFileSync(join(TMP, "AGENTS.md"), "utf-8");
			expect(content).toContain("Requirement");
			expect(content).toContain("Assumption");
			expect(content).toContain("Decision");
			expect(content).toContain("Idea");
			expect(content).toContain("Stakeholder");
			expect(content).toContain("Risk");
			expect(content).toContain("Term");
		} finally {
			process.chdir(originalDir);
		}
	});
});

describe("init-agent delegation stack", () => {
	test("installs requirements-engineer agent to .pi/agents/", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);
			initAgentCommand();
			const agentPath = join(
				TMP,
				".pi",
				"agents",
				"arc-requirements-engineer.md",
			);
			expect(existsSync(agentPath)).toBe(true);
			const content = readFileSync(agentPath, "utf-8");
			expect(content).toContain("arc-requirements-engineer");
			expect(content).toContain("requirements engineer");
			expect(content).toContain("arc context");
		} finally {
			process.chdir(originalDir);
		}
	});

	test("installs ketchup validator and reminder when .ketchup exists", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);
			mkdirSync(join(TMP, ".ketchup"), { recursive: true });
			initAgentCommand();
			expect(
				existsSync(join(TMP, ".ketchup", "validators", "arc-dogfooding.md")),
			).toBe(true);
			expect(existsSync(join(TMP, ".ketchup", "reminders", "arc.md"))).toBe(
				true,
			);
			const validator = readFileSync(
				join(TMP, ".ketchup", "validators", "arc-dogfooding.md"),
				"utf-8",
			);
			expect(validator).toContain("Semantic relevance");
		} finally {
			process.chdir(originalDir);
		}
	});

	test("skips ketchup artifacts when .ketchup absent and creates no .ketchup dir", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);
			initAgentCommand();
			expect(existsSync(join(TMP, ".ketchup"))).toBe(false);
			expect(
				existsSync(join(TMP, ".ketchup", "validators", "arc-dogfooding.md")),
			).toBe(false);
			expect(existsSync(join(TMP, ".ketchup", "reminders", "arc.md"))).toBe(
				false,
			);
		} finally {
			process.chdir(originalDir);
		}
	});

	test("templates are genericized — no arc-internal references", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);
			initAgentCommand();
			const agent = readFileSync(
				join(TMP, ".pi", "agents", "arc-requirements-engineer.md"),
				"utf-8",
			);
			expect(agent).not.toContain("bun run dev");
			expect(agent).not.toMatch(/[DA]-0\d{2}/);
			expect(agent).not.toContain("4cdcbcb");
			expect(agent).toContain("arc status");
		} finally {
			process.chdir(originalDir);
		}
	});

	test("idempotent — re-running overwrites templates without error", () => {
		const originalDir = process.cwd();
		try {
			process.chdir(TMP);
			initAgentCommand();
			initAgentCommand();
			const agentPath = join(
				TMP,
				".pi",
				"agents",
				"arc-requirements-engineer.md",
			);
			expect(existsSync(agentPath)).toBe(true);
		} finally {
			process.chdir(originalDir);
		}
	});
});
