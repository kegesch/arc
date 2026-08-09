import {
	afterEach,
	beforeEach,
	describe,
	expect,
	setDefaultTimeout,
	test,
} from "bun:test";

setDefaultTimeout(20000);
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { diffEntityChanges } from "../src/git";
import { diffCommand } from "../src/commands/diff";

const TMP = join(import.meta.dir, "_tmp_diff");
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

function rename(dir: string, from: string, to: string): void {
	renameSync(join(dir, from), join(dir, to));
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

let dir: string;

beforeEach(() => {
	dir = join(TMP, "repo");
	mkdirSync(dir, { recursive: true });
	git(dir, ["init", "-q", "-b", "main"]);
	git(dir, ["config", "user.email", "t@t"]);
	git(dir, ["config", "user.name", "t"]);
	git(dir, ["config", "core.autocrlf", "false"]);
	write(dir, ".arc/decisions/D-001-one.md", entity("D-001", "One", "v1"));
	write(dir, ".arc/decisions/D-002-two.md", entity("D-002", "Two", "v2"));
	commit(dir, "c1");
	write(
		dir,
		".arc/decisions/D-001-one.md",
		entity("D-001", "One", "v1-revised"),
	);
	write(dir, ".arc/decisions/D-003-three.md", entity("D-003", "Three", "v3"));
	rmSync(join(dir, ".arc/decisions/D-002-two.md"));
	commit(dir, "c2");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("diffEntityChanges", () => {
	test("classifies added, removed, and modified entities between refs", () => {
		const diff = diffEntityChanges(dir, "HEAD~1", "HEAD");

		expect(diff.added).toEqual([
			{ id: "D-003", path: ".arc/decisions/D-003-three.md" },
		]);
		expect(diff.removed).toEqual([
			{ id: "D-002", path: ".arc/decisions/D-002-two.md" },
		]);
		expect(diff.modified).toEqual([
			{ id: "D-001", path: ".arc/decisions/D-001-one.md" },
		]);
	});

	test("folds a same-id filename rename into modified", () => {
		rename(
			dir,
			".arc/decisions/D-001-one.md",
			".arc/decisions/D-001-one-renamed.md",
		);
		commit(dir, "c3");

		const diff = diffEntityChanges(dir, "HEAD~1", "HEAD");

		expect(diff.added).toEqual([]);
		expect(diff.removed).toEqual([]);
		expect(diff.modified).toEqual([
			{ id: "D-001", path: ".arc/decisions/D-001-one-renamed.md" },
		]);
	});

	test("classifies rename lines with the same id as modified", () => {
		git(dir, ["config", "diff.renames", "true"]);
		rename(
			dir,
			".arc/decisions/D-001-one.md",
			".arc/decisions/D-001-one-renamed.md",
		);
		commit(dir, "c3");

		const diff = diffEntityChanges(dir, "HEAD~1", "HEAD");

		expect(diff.modified).toEqual([
			{ id: "D-001", path: ".arc/decisions/D-001-one-renamed.md" },
		]);
		expect(diff.added).toEqual([]);
		expect(diff.removed).toEqual([]);
	});

	test("splits cross-id rename lines into removed and added", () => {
		git(dir, ["config", "diff.renames", "true"]);
		write(
			dir,
			".arc/decisions/D-004-four.md",
			entity("D-004", "Four", "v1-revised"),
		);
		rmSync(join(dir, ".arc/decisions/D-001-one.md"));
		commit(dir, "c3");

		const diff = diffEntityChanges(dir, "HEAD~1", "HEAD");

		expect(diff.added).toEqual([
			{ id: "D-004", path: ".arc/decisions/D-004-four.md" },
		]);
		expect(diff.removed).toEqual([
			{ id: "D-001", path: ".arc/decisions/D-001-one.md" },
		]);
		expect(diff.modified).toEqual([]);
	});

	test("throws on an invalid ref", () => {
		expect(() => diffEntityChanges(dir, "nope", "HEAD")).toThrow();
	});

	test("sorts multi-entity groups by id", () => {
		write(dir, ".arc/decisions/D-004-four.md", entity("D-004", "Four", "v4"));
		write(dir, ".arc/decisions/D-005-five.md", entity("D-005", "Five", "v5"));
		commit(dir, "c3");

		const diff = diffEntityChanges(dir, "HEAD~1", "HEAD");

		expect(diff.added).toEqual([
			{ id: "D-004", path: ".arc/decisions/D-004-four.md" },
			{ id: "D-005", path: ".arc/decisions/D-005-five.md" },
		]);
	});
});

describe("arc diff command", () => {
	test("renders status groups with titles from the current graph", () => {
		const r = runCli(dir, ["diff", "HEAD~1"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("Added (1):");
		expect(r.stdout).toContain("D-003");
		expect(r.stdout).toContain("Three");
		expect(r.stdout).toContain("Removed (1):");
		expect(r.stdout).toContain(".arc/decisions/D-002-two.md");
		expect(r.stdout).toContain("Modified (1):");
		expect(r.stdout).toContain("One");
	});

	test("renders only non-empty groups", () => {
		write(dir, ".arc/decisions/D-005-five.md", entity("D-005", "Five", "v5"));
		commit(dir, "c3");

		const r = runCli(dir, ["diff", "HEAD~1"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("Added (1):");
		expect(r.stdout).toContain("Five");
		expect(r.stdout).not.toContain("Removed");
		expect(r.stdout).not.toContain("Modified");
	});

	test("reports no changes between identical refs", () => {
		const r = runCli(dir, ["diff", "HEAD", "HEAD"]);

		expect(r.status).toBe(0);
		expect(r.stdout).toContain("No changes.");
	});

	test("emits machine-readable json", () => {
		const r = runCli(dir, ["diff", "HEAD~1", "--format", "json"]);

		expect(r.status).toBe(0);
		expect(JSON.parse(r.stdout)).toEqual({
			added: [
				{
					id: "D-003",
					title: "Three",
					path: ".arc/decisions/D-003-three.md",
				},
			],
			removed: [
				{
					id: "D-002",
					title: ".arc/decisions/D-002-two.md",
					path: ".arc/decisions/D-002-two.md",
				},
			],
			modified: [
				{
					id: "D-001",
					title: "One",
					path: ".arc/decisions/D-001-one.md",
				},
			],
		});
	});

	test("exits 1 with the git error on an invalid ref", () => {
		const r = runCli(dir, ["diff", "nope"]);

		expect(r.status).toBe(1);
		expect(r.stderr).toContain("nope");
	});

	test("exits nonzero with usage when no ref is given", () => {
		const r = runCli(dir, ["diff"]);

		expect(r.status).not.toBe(0);
		expect(r.stderr).toContain("missing required argument");
	});

	test("exits 1 outside a git repository", () => {
		const noGitDir = join(tmpdir(), `arc-no-git-${process.pid}-${Date.now()}`);
		mkdirSync(join(noGitDir, ".arc/decisions"), { recursive: true });
		writeFileSync(
			join(noGitDir, ".arc/decisions/D-001-one.md"),
			entity("D-001", "One", "v1"),
		);
		try {
			const r = runCli(noGitDir, ["diff", "HEAD"]);

			expect(r.status).toBe(1);
			expect(r.stderr).toContain("Not a git repository");
		} finally {
			rmSync(noGitDir, { recursive: true, force: true });
		}
	});
});

describe("arc diff command (in-process coverage)", () => {
	test("renders status groups with titles from the current graph", () => {
		inDir(dir, () => {
			const { stdout } = capture(() =>
				diffCommand("HEAD~1", undefined, { format: "text" }),
			);

			expect(stdout).toContain("Added (1):");
			expect(stdout).toContain("Three");
			expect(stdout).toContain("Removed (1):");
			expect(stdout).toContain(".arc/decisions/D-002-two.md");
			expect(stdout).toContain("Modified (1):");
			expect(stdout).toContain("One");
		});
	});

	test("renders only non-empty groups", () => {
		write(dir, ".arc/decisions/D-005-five.md", entity("D-005", "Five", "v5"));
		commit(dir, "c3");

		inDir(dir, () => {
			const { stdout } = capture(() =>
				diffCommand("HEAD~1", undefined, { format: "text" }),
			);

			expect(stdout).toContain("Added (1):");
			expect(stdout).not.toContain("Removed");
			expect(stdout).not.toContain("Modified");
		});
	});

	test("reports no changes between identical refs", () => {
		inDir(dir, () => {
			const { stdout } = capture(() =>
				diffCommand("HEAD", "HEAD", { format: "text" }),
			);

			expect(stdout).toContain("No changes.");
		});
	});

	test("emits machine-readable json", () => {
		inDir(dir, () => {
			const { stdout } = capture(() =>
				diffCommand("HEAD~1", undefined, { format: "json" }),
			);

			expect(JSON.parse(stdout)).toEqual({
				added: [
					{
						id: "D-003",
						title: "Three",
						path: ".arc/decisions/D-003-three.md",
					},
				],
				removed: [
					{
						id: "D-002",
						title: ".arc/decisions/D-002-two.md",
						path: ".arc/decisions/D-002-two.md",
					},
				],
				modified: [
					{
						id: "D-001",
						title: "One",
						path: ".arc/decisions/D-001-one.md",
					},
				],
			});
		});
	});

	test("exits 1 with the git error on an invalid ref", () => {
		inDir(dir, () => {
			const { stderr, exitCode } = capture(() =>
				diffCommand("nope", undefined, { format: "text" }),
			);

			expect(exitCode).toBe(1);
			expect(stderr).toContain("nope");
		});
	});

	test("exits 1 outside a git repository", () => {
		const noGitDir = join(
			tmpdir(),
			`arc-diff-inproc-${process.pid}-${Date.now()}`,
		);
		mkdirSync(join(noGitDir, ".arc/decisions"), { recursive: true });
		writeFileSync(
			join(noGitDir, ".arc/decisions/D-001-one.md"),
			entity("D-001", "One", "v1"),
		);
		try {
			inDir(noGitDir, () => {
				const { stderr, exitCode } = capture(() =>
					diffCommand("HEAD", undefined, { format: "text" }),
				);

				expect(exitCode).toBe(1);
				expect(stderr).toContain("Not a git repository");
			});
		} finally {
			rmSync(noGitDir, { recursive: true, force: true });
		}
	});
});
