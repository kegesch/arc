import { afterEach, describe, expect, setDefaultTimeout, test } from "bun:test";

setDefaultTimeout(20000);
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { relatedEntityIds } from "../src/git";

const TMP = join(import.meta.dir, "_tmp_related_branch");

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

function initRepo(dir: string): void {
	mkdirSync(dir, { recursive: true });
	git(dir, ["init", "-q", "-b", "main"]);
	git(dir, ["config", "user.email", "t@t"]);
	git(dir, ["config", "user.name", "t"]);
	git(dir, ["config", "core.autocrlf", "false"]);
}

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("relatedEntityIds branch scope", () => {
	test("unions branch-scope co-occurrence since the remote default fork", () => {
		const dir = join(TMP, "origin-head");
		initRepo(dir);
		write(dir, "code.ts", "a");
		commit(dir, "base");
		const baseSha = git(dir, ["rev-parse", "HEAD"]).trim();
		git(dir, ["update-ref", "refs/remotes/origin/main", baseSha]);
		git(dir, [
			"symbolic-ref",
			"refs/remotes/origin/HEAD",
			"refs/remotes/origin/main",
		]);
		write(
			dir,
			".arc/requirements/R-010-req.md",
			entity("R-010", "Req Ten", "r10"),
		);
		commit(dir, "docs(arc): add R-010");
		write(dir, "code.ts", "b");
		commit(dir, "feat(git): touch code");

		expect(relatedEntityIds(dir, "code.ts")).toEqual({
			ids: ["R-010"],
			commitCount: 2,
		});
	});

	test("falls back to the branch upstream for branch scope", () => {
		const dir = join(TMP, "upstream");
		initRepo(dir);
		write(dir, "code.ts", "a");
		commit(dir, "base");
		git(dir, ["checkout", "-q", "-b", "feat"]);
		git(dir, ["branch", "--set-upstream-to=main"]);
		write(
			dir,
			".arc/requirements/R-011-req.md",
			entity("R-011", "Req Eleven", "r11"),
		);
		commit(dir, "docs(arc): add R-011");
		write(dir, "code.ts", "b");
		commit(dir, "feat(git): touch code");

		expect(relatedEntityIds(dir, "code.ts")).toEqual({
			ids: ["R-011"],
			commitCount: 2,
		});
	});

	test("uses origin/main when no upstream or origin head exists", () => {
		const dir = join(TMP, "origin-main");
		initRepo(dir);
		write(dir, "code.ts", "a");
		commit(dir, "base");
		const baseSha = git(dir, ["rev-parse", "HEAD"]).trim();
		git(dir, ["update-ref", "refs/remotes/origin/main", baseSha]);
		write(
			dir,
			".arc/requirements/R-012-req.md",
			entity("R-012", "Req Twelve", "r12"),
		);
		commit(dir, "docs(arc): add R-012");
		write(dir, "code.ts", "b");
		commit(dir, "feat(git): touch code");

		expect(relatedEntityIds(dir, "code.ts")).toEqual({
			ids: ["R-012"],
			commitCount: 2,
		});
	});

	test("skips branch scope when no integration ref exists", () => {
		const dir = join(TMP, "no-ref");
		initRepo(dir);
		git(dir, ["branch", "-m", "main", "feature"]);
		write(dir, "code.ts", "a");
		commit(dir, "c1");
		write(
			dir,
			".arc/requirements/R-013-req.md",
			entity("R-013", "Req Thirteen", "r13"),
		);
		commit(dir, "docs(arc): add R-013");
		write(dir, "code.ts", "b");
		commit(dir, "feat(git): touch code");

		expect(relatedEntityIds(dir, "code.ts")).toEqual({
			ids: [],
			commitCount: 2,
		});
	});
});
