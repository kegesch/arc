import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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

describe("arc npm shim executable handling", () => {
	test("spawns the binary even when the installed package marks it non-executable", () => {
		const tmp = join(tmpdir(), "arc-shim-exec");
		mkdirSync(tmp, { recursive: true });
		mkdirSync(join(tmp, "node_modules", "@kegesch", "arc-linux-x64"), {
			recursive: true,
		});
		writeFileSync(
			join(tmp, "node_modules", "@kegesch", "arc-linux-x64", "package.json"),
			JSON.stringify({ name: "@kegesch/arc-linux-x64", version: "0.0.0" }),
		);
		const binary = join(tmp, "node_modules", "@kegesch", "arc-linux-x64", "arc");
		writeFileSync(binary, process.execPath, { mode: 0o644 });
		copyFileSync(join(import.meta.dir, "..", "bin", "arc.cjs"), join(tmp, "arc.cjs"));
		copyFileSync(
			join(import.meta.dir, "..", "bin", "platforms.cjs"),
			join(tmp, "platforms.cjs"),
		);
		const result = spawnSync(process.execPath, [join(tmp, "arc.cjs"), "--version"], {
			encoding: "utf-8",
		});
		const mode = statSync(binary).mode & 0o777;
		rmSync(tmp, { recursive: true, force: true });
		if (process.platform === "win32") return;
		expect(result.status).toBe(0);
		expect(mode & 0o111).not.toBe(0);
	});
});
