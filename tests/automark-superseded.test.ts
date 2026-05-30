import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createEntity } from "../src/commands/add";
import { autoMarkSuperseded } from "../src/entities/registry";
import { initArcDir, readEntityById } from "../src/io/files";

const TMP = join(import.meta.dir, "_tmp_automark");

beforeEach(() => {
	mkdirSync(TMP, { recursive: true });
	initArcDir(TMP, "test-project");
});

afterEach(() => {
	rmSync(TMP, { recursive: true, force: true });
});

describe("autoMarkSuperseded", () => {
	test("marks a decision as superseded", () => {
		createEntity(TMP, { type: "decision", title: "Old decision" });
		expect(readEntityById(TMP, "D-001")!.status).toBe("proposed");

		const result = autoMarkSuperseded(TMP, "D-001");

		expect(result).toBe(true);
		const updated = readEntityById(TMP, "D-001")!;
		expect(updated.status).toBe("superseded");
	});

	test("returns false when entity does not exist", () => {
		const result = autoMarkSuperseded(TMP, "D-999");

		expect(result).toBe(false);
	});

	test("returns false when entity is already superseded", () => {
		createEntity(TMP, { type: "decision", title: "Already superseded" });
		const entity = readEntityById(TMP, "D-001")!;
		entity.status = "superseded";
		const { updateEntity } = require("../src/io/files");
		updateEntity(TMP, entity);

		const result = autoMarkSuperseded(TMP, "D-001");

		expect(result).toBe(false);
	});

	test("returns false for non-decision entity types", () => {
		createEntity(TMP, { type: "requirement", title: "A requirement" });

		const result = autoMarkSuperseded(TMP, "R-001");

		expect(result).toBe(false);
		const req = readEntityById(TMP, "R-001")!;
		expect(req.status).not.toBe("superseded");
	});

	test("is used by createEntity when supersedes is set", () => {
		createEntity(TMP, { type: "decision", title: "Old decision" });
		expect(readEntityById(TMP, "D-001")!.status).toBe("proposed");

		createEntity(TMP, {
			type: "decision",
			title: "New decision",
			supersedes: "D-001",
		});

		const old = readEntityById(TMP, "D-001")!;
		expect(old.status).toBe("superseded");
	});
});
