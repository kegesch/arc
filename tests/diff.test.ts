import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { diffEntityChanges } from "../src/git";

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
