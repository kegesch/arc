import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { diffEntityChanges } from "../src/git";

const TMP = join(import.meta.dir, "_tmp_diff");

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
});
