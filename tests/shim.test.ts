import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { getTarget, listKeys } from "../bin/platforms.cjs";

const SHIM = join(import.meta.dir, "..", "bin", "arc.cjs");

describe("arc npm shim platform map", () => {
	test("covers all five supported platforms", () => {
		expect(listKeys().sort()).toEqual([
			"darwin-arm64",
			"darwin-x64",
			"linux-arm64",
			"linux-x64",
			"win32-x64",
		]);
	});

	test("returns null for an unknown OS", () => {
		expect(getTarget("plan9", "x64")).toBeNull();
	});

	test("returns null for an unknown CPU arch", () => {
		expect(getTarget("linux", "z80")).toBeNull();
	});

	for (const key of listKeys()) {
		const [platform, arch] = key.split("-") as [string, string];
		test(`resolves ${key} to its per-arch package and binary`, () => {
			expect(getTarget(platform, arch)).toEqual({
				pkg: `@kegesch/arc-${key}`,
				binary: platform === "win32" ? "arc.exe" : "arc",
			});
		});
	}
});

describe("arc npm shim file", () => {
	test("starts with the node shebang", () => {
		const firstLine = readFileSync(SHIM, "utf-8").split("\n", 1)[0].trimEnd();
		expect(firstLine).toBe("#!/usr/bin/env node");
	});

	test("imports the platform resolver", () => {
		const content = readFileSync(SHIM, "utf-8");
		expect(content).toContain('require("./platforms.cjs")');
	});
});

describe("arc npm shim runtime", () => {
	test("exits 1 pointing at GitHub Releases when the platform package is missing", () => {
		const result = spawnSync(process.execPath, [SHIM, "--version"], {
			encoding: "utf-8",
			env: { ...process.env, NODE_PATH: "" },
		});
		if (result.status === 0) return;
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("https://github.com/kegesch/arc/releases");
	});
});
