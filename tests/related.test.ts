import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { relatedEntityIds } from "../src/git";
import { relatedCommand } from "../src/commands/related";

const TMP = join(import.meta.dir, "_tmp_related");
const SRC_INDEX = join(import.meta.dir, "..", "src", "index.ts");

function git(dir: string, args: string[]): string {
	const r = spawnSync("git", args, { cwd: dir, encoding: "utf-8" });
	if (r.status !== 0) throw new Error(r.stderr);
	return r.stdout;
}

function write(dir: string, path: string, content: string): void {
	const full = join(dir, path);
	mkdirSync(dirname(full), { recursive: true });
	writeFileSync(full, content);
}

function commit(dir: string, message: string): void {
	git(dir, ["add", "-A"]);
	git(dir, ["-c", "core.hooksPath=/dev/null", "commit", "-m", message]);
}

function runCli(
	dir: string,
	args: string[],
): { status: number; stdout: string; stderr: string } {
	const r = spawnSync(process.execPath, [SRC_INDEX, ...args], {
		cwd: dir,
		encoding: "utf-8",
	});
	return {
		status: r.status ?? -1,
		stdout: r.stdout ?? "",
		stderr: r.stderr ?? "",
	};
}

function capture(fn: () => void): {
	stdout: string;
	stderr: string;
	exitCode: number | undefined;
} {
	const originalLog = console.log;
	const originalError = console.error;
	const originalExit = process.exit;
	let stdout = "";
	let stderr = "";
	let exitCode: number | undefined;
	console.log = (...args: unknown[]) => {
		stdout += `${args.join(" ")}\n`;
	};
	console.error = (...args: unknown[]) => {
		stderr += `${args.join(" ")}\n`;
	};
	process.exit = ((code?: number) => {
		exitCode = code;
	}) as unknown as typeof process.exit;
	try {
		fn();
	} finally {
		console.log = originalLog;
		console.error = originalError;
		process.exit = originalExit;
	}
	return { stdout, stderr, exitCode };
}

function inDir(dir: string, fn: () => void): void {
	const original = process.cwd();
	process.chdir(dir);
	try {
		fn();
	} finally {
		process.chdir(original);
	}
}

function entity(id: string, title: string, body = ""): string {
	return `---\nid: ${id}\ntitle: ${title}\nstatus: accepted\n---\n${body}`;
}

function mergeWithConflicts(dir: string): void {
	spawnSync("git", ["merge", "--no-ff", "feat"], {
		cwd: dir,
		encoding: "utf-8",
	});
	write(dir, "code.ts", "merged");
	write(
		dir,
		".arc/decisions/D-001-one.md",
		entity("D-001", "One", "merged-v1"),
	);
	commit(dir, "merge feat");
}

let dir: string;

beforeEach(() => {
	dir = join(TMP, "repo");
	mkdirSync(dir, { recursive: true });
	git(dir, ["init", "-q", "-b", "main"]);
	git(dir, ["config", "user.email", "t@t"]);
	git(dir, ["config", "user.name", "t"]);
	git(dir, ["config", "core.autocrlf", "false"]);
	write(dir, "code.ts", "a");
	write(dir, ".arc/decisions/D-001-one.md", entity("D-001", "One", "v1"));
	write(dir, ".arc/decisions/D-002-two.md", entity("D-002", "Two", "v2"));
	commit(dir, "c1");
	git(dir, ["checkout", "-q", "-b", "feat"]);
	write(dir, "code.ts", "b");
	write(dir, ".arc/decisions/D-001-one.md", entity("D-001", "One", "f1"));
	commit(dir, "c2");
	git(dir, ["checkout", "-q", "main"]);
	write(dir, "code.ts", "c");
	write(dir, ".arc/decisions/D-001-one.md", entity("D-001", "One", "m1"));
	commit(dir, "c3");
	mergeWithConflicts(dir);
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("relatedEntityIds", () => {
	test("returns distinct co-occurring entity ids across history including merges", () => {
		expect(relatedEntityIds(dir, "code.ts")).toEqual({
			ids: ["D-001", "D-002"],
			commitCount: 4,
		});
	});

	test("reports zero commits for a file with no history", () => {
		write(dir, "untracked.ts", "x");

		expect(relatedEntityIds(dir, "untracked.ts")).toEqual({
			ids: [],
			commitCount: 0,
		});
	});

	test("reports empty ids when commits touch no arc files", () => {
		write(dir, "code2.ts", "x");
		commit(dir, "c4");

		expect(relatedEntityIds(dir, "code2.ts")).toEqual({
			ids: [],
			commitCount: 1,
		});
	});
});

describe("arc related command", () => {
	test("renders related entities with their rationale trace", () => {
		const r = runCli(dir, ["related", "code.ts"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("Entities related to code.ts");
		expect(r.stdout).toContain("D-001");
		expect(r.stdout).toContain("D-002");
	});

	test("emits machine-readable json", () => {
		const r = runCli(dir, ["related", "code.ts", "--format", "json"]);

		expect(r.status).toBe(0);
		expect(JSON.parse(r.stdout)).toEqual({
			file: "code.ts",
			related: [
				{
					id: "D-001",
					title: "One",
					trace: {
						id: "D-001",
						title: "One",
						type: "decision",
						status: "accepted",
						edgeType: "root",
						children: [],
					},
				},
				{
					id: "D-002",
					title: "Two",
					trace: {
						id: "D-002",
						title: "Two",
						type: "decision",
						status: "accepted",
						edgeType: "root",
						children: [],
					},
				},
			],
		});
	});

	test("skips entities no longer in the graph", () => {
		rmSync(join(dir, ".arc/decisions/D-002-two.md"));

		const r = runCli(dir, ["related", "code.ts"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("D-001");
		expect(r.stdout).not.toContain("D-002");
	});

	test("exits 1 with a clear message for a file with no commits", () => {
		write(dir, "untracked.ts", "x");

		const r = runCli(dir, ["related", "untracked.ts"]);

		expect(r.status).toBe(1);
		expect(r.stderr).toContain("No commits found");
	});

	test("reports no related entities when commits touch no arc files", () => {
		write(dir, "code2.ts", "x");
		commit(dir, "c4");

		const r = runCli(dir, ["related", "code2.ts"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("No related entities found");
	});

	test("exits 1 outside a git repository", () => {
		const noGitDir = join(
			tmpdir(),
			`arc-related-no-git-${process.pid}-${Date.now()}`,
		);
		mkdirSync(join(noGitDir, ".arc/decisions"), { recursive: true });
		writeFileSync(
			join(noGitDir, ".arc/decisions/D-001-one.md"),
			entity("D-001", "One", "v1"),
		);
		try {
			const r = runCli(noGitDir, ["related", "code.ts"]);

			expect(r.status).toBe(1);
			expect(r.stderr).toContain("not a git repository");
		} finally {
			rmSync(noGitDir, { recursive: true, force: true });
		}
	});
});

describe("arc related command (in-process coverage)", () => {
	test("renders related entities with their rationale trace", () => {
		inDir(dir, () => {
			const { stdout } = capture(() =>
				relatedCommand("code.ts", { format: "text" }),
			);

			expect(stdout).toContain("Entities related to code.ts");
			expect(stdout).toContain("D-001");
			expect(stdout).toContain("D-002");
		});
	});

	test("emits machine-readable json", () => {
		inDir(dir, () => {
			const { stdout } = capture(() =>
				relatedCommand("code.ts", { format: "json" }),
			);

			expect(JSON.parse(stdout)).toEqual({
				file: "code.ts",
				related: [
					{
						id: "D-001",
						title: "One",
						trace: {
							id: "D-001",
							title: "One",
							type: "decision",
							status: "accepted",
							edgeType: "root",
							children: [],
						},
					},
					{
						id: "D-002",
						title: "Two",
						trace: {
							id: "D-002",
							title: "Two",
							type: "decision",
							status: "accepted",
							edgeType: "root",
							children: [],
						},
					},
				],
			});
		});
	});

	test("skips entities no longer in the graph", () => {
		rmSync(join(dir, ".arc/decisions/D-002-two.md"));

		inDir(dir, () => {
			const { stdout } = capture(() =>
				relatedCommand("code.ts", { format: "text" }),
			);

			expect(stdout).toContain("D-001");
			expect(stdout).not.toContain("D-002");
		});
	});

	test("exits 1 with a clear message for a file with no commits", () => {
		write(dir, "untracked.ts", "x");

		inDir(dir, () => {
			const { stderr, exitCode } = capture(() =>
				relatedCommand("untracked.ts", { format: "text" }),
			);

			expect(exitCode).toBe(1);
			expect(stderr).toContain("No commits found");
		});
	});

	test("reports no related entities when commits touch no arc files", () => {
		write(dir, "code2.ts", "x");
		commit(dir, "c4");

		inDir(dir, () => {
			const { stdout } = capture(() =>
				relatedCommand("code2.ts", { format: "text" }),
			);

			expect(stdout).toContain("No related entities found");
		});
	});

	test("exits 1 outside a git repository", () => {
		const noGitDir = join(
			tmpdir(),
			`arc-related-inproc-${process.pid}-${Date.now()}`,
		);
		mkdirSync(join(noGitDir, ".arc/decisions"), { recursive: true });
		writeFileSync(
			join(noGitDir, ".arc/decisions/D-001-one.md"),
			entity("D-001", "One", "v1"),
		);
		try {
			inDir(noGitDir, () => {
				const { stderr, exitCode } = capture(() =>
					relatedCommand("code.ts", { format: "text" }),
				);

				expect(exitCode).toBe(1);
				expect(stderr).toContain("not a git repository");
			});
		} finally {
			rmSync(noGitDir, { recursive: true, force: true });
		}
	});
});
