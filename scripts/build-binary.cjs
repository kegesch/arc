#!/usr/bin/env node
"use strict";
const { spawnSync } = require("node:child_process");

const OUTFILE = {
	"linux-x64": "packages/arc-linux-x64/arc",
	"linux-arm64": "packages/arc-linux-arm64/arc",
	"darwin-x64": "packages/arc-darwin-x64/arc",
	"darwin-arm64": "packages/arc-darwin-arm64/arc",
	"win32-x64": "packages/arc-win32-x64/arc.exe",
};

const key = `${process.platform}-${process.arch}`;
const outfile = OUTFILE[key];

if (!outfile) {
	console.error(`build-binary: unsupported platform ${key}.`);
	console.error(`Supported: ${Object.keys(OUTFILE).join(", ")}.`);
	process.exit(1);
}

const result = spawnSync(
	"bun",
	["build", "src/index.ts", "--compile", "--outfile", outfile],
	{ stdio: "inherit" },
);
process.exit(result.status ?? 1);
