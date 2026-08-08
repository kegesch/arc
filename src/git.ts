import { spawnSync } from "node:child_process";

export interface EntityChange {
	id: string;
	path: string;
}

export interface EntityDiff {
	added: EntityChange[];
	removed: EntityChange[];
	modified: EntityChange[];
}

export function runGit(
	dir: string,
	args: string[],
): { status: number; stdout: string; stderr: string } {
	const r = spawnSync("git", args, { cwd: dir, encoding: "utf-8" });
	return {
		status: r.status ?? -1,
		stdout: r.stdout ?? "",
		stderr: r.stderr ?? "",
	};
}

function idFromPath(path: string): string {
	const name = path.split("/").pop() ?? path;
	const match = name.match(/^([A-Z]+-\d+)-/);
	return match ? match[1] : name.replace(/\.md$/, "");
}

export function diffEntityChanges(
	dir: string,
	refA: string,
	refB: string,
): EntityDiff {
	const r = runGit(dir, [
		"diff",
		"--name-status",
		"-z",
		refA,
		refB,
		"--",
		".arc",
	]);
	if (r.status !== 0) {
		throw new Error(r.stderr.trim() || `git diff failed (${r.status})`);
	}
	const tokens = r.stdout.split("\0").filter((t) => t !== "");
	const ops: { kind: "add" | "remove" | "modify"; path: string }[] = [];
	let i = 0;
	while (i < tokens.length) {
		const code = tokens[i];
		if (code.startsWith("R")) {
			const oldPath = tokens[i + 1];
			const newPath = tokens[i + 2];
			if (idFromPath(oldPath) === idFromPath(newPath)) {
				ops.push({ kind: "modify", path: newPath });
			} else {
				ops.push({ kind: "remove", path: oldPath });
				ops.push({ kind: "add", path: newPath });
			}
			i += 3;
		} else {
			const path = tokens[i + 1];
			if (code.startsWith("A")) ops.push({ kind: "add", path });
			else if (code.startsWith("D")) ops.push({ kind: "remove", path });
			else ops.push({ kind: "modify", path });
			i += 2;
		}
	}
	const byId = new Map<
		string,
		{ kind: "add" | "remove" | "modify"; path: string }
	>();
	for (const op of ops) {
		const id = idFromPath(op.path);
		const prev = byId.get(id);
		if (op.kind === "add") {
			byId.set(
				id,
				prev?.kind === "remove"
					? { kind: "modify", path: op.path }
					: { kind: "add", path: op.path },
			);
		} else if (op.kind === "remove") {
			byId.set(
				id,
				prev?.kind === "add"
					? { kind: "modify", path: prev.path }
					: { kind: "remove", path: op.path },
			);
		} else {
			byId.set(id, { kind: "modify", path: op.path });
		}
	}
	const added: EntityChange[] = [];
	const removed: EntityChange[] = [];
	const modified: EntityChange[] = [];
	for (const [id, c] of byId) {
		const entry = { id, path: c.path };
		if (c.kind === "add") added.push(entry);
		else if (c.kind === "remove") removed.push(entry);
		else modified.push(entry);
	}
	const sort = (a: EntityChange, b: EntityChange) => a.id.localeCompare(b.id);
	return {
		added: added.sort(sort),
		removed: removed.sort(sort),
		modified: modified.sort(sort),
	};
}

export function relatedEntityIds(dir: string, file: string): RelatedResult {
const r = runGit(dir, ["rev-list", "HEAD", "--", file]);
if (r.status !== 0) {
throw new Error(r.stderr.trim() || `git rev-list failed (${r.status})`);
}
const shas = r.stdout.split("\n").filter((s) => s !== "");
const ids = new Set<string>();
const log = runGit(dir, ["log", "--format=%B%x00", "HEAD", "--", file]);
for (const token of log.stdout.split("\0")) {
const message = token.trim();
for (const m of message.matchAll(/\b(?:R|D|A|K|T|S|I|UC|EM|V)-\d+\b/g)) {
ids.add(m[0]);
}
}
for (const sha of shas) {
const show = runGit(dir, ["show", "--name-only", "--format=", sha]);
for (const line of show.stdout.split("\n")) {
if (line.startsWith(".arc/")) ids.add(idFromPath(line));
}
}
return { ids: [...ids].sort(), commitCount: shas.length };
}

export interface RelatedResult {
	ids: string[];
	commitCount: number;
}
