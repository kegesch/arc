import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { relatedEntityIds } from "../src/git";

const TMP = join(import.meta.dir, "_tmp_related");

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

function entity(id: string, title: string, body = ""): string {
	return `---\nid: ${id}\ntitle: ${title}\nstatus: accepted\n---\n${body}`;
}

function mergeWithConflicts(dir: string): void {
	try {
		git(dir, ["merge", "--no-ff", "feat"]);
	} catch {
	}
	write(dir, "code.ts", "merged");
	write(dir, ".arc/decisions/D-001-one.md", entity("D-001", "One", "merged-v1"));
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
		expect(relatedEntityIds(dir, "code.ts")).toEqual(["D-001", "D-002"]);
	});

	test("returns an empty list for a file with no commits", () => {
		write(dir, "untracked.ts", "x");

		expect(relatedEntityIds(dir, "untracked.ts")).toEqual([]);
	});
});
