#!/usr/bin/env node
"use strict";
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");
const { getTarget, listKeys } = require("./platforms.cjs");

const target = getTarget(process.platform, process.arch);

if (!target) {
	process.stderr.write(
		`arc: unsupported platform ${process.platform}-${process.arch}.\n` +
			`Supported: ${listKeys().join(", ")}.\n` +
			`For other platforms, download a binary from https://github.com/kegesch/arc/releases\n`,
	);
	process.exit(1);
}

let pkgJsonPath;
try {
	pkgJsonPath = require.resolve(`${target.pkg}/package.json`);
} catch {
	process.stderr.write(
		`arc: the platform package ${target.pkg} was not installed.\n` +
			`Re-run \`npm install -g @kegesch/arc\` — npm should have selected it automatically.\n` +
			`If the problem persists, download a binary from https://github.com/kegesch/arc/releases\n`,
	);
	process.exit(1);
}

const binaryPath = path.join(path.dirname(pkgJsonPath), target.binary);
if (!existsSync(binaryPath)) {
	process.stderr.write(`arc: binary not found at ${binaryPath}\n`);
	process.exit(1);
}

const child = spawn(binaryPath, process.argv.slice(2), { stdio: "inherit" });
child.on("exit", (code, signal) => {
	if (signal) process.kill(process.pid, signal);
	else process.exit(code ?? 1);
});
