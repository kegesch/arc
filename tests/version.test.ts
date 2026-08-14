import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import pkg from "../package.json";

const SRC_INDEX = join(import.meta.dir, "..", "src", "index.ts");

describe("arc --version", () => {
	test("prints the version from package.json", () => {
		const r = spawnSync(process.execPath, [SRC_INDEX, "--version"], {
			encoding: "utf-8",
		});
		expect(r.status).toBe(0);
		expect(r.stdout.trim()).toBe(pkg.version);
	});
});
