#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const version = process.argv[2];
if (!version) {
	console.error("usage: bump-version.cjs <version>");
	process.exit(1);
}

const PER_ARCH = [
	"packages/arc-linux-x64",
	"packages/arc-linux-arm64",
	"packages/arc-darwin-x64",
	"packages/arc-darwin-arm64",
	"packages/arc-win32-x64",
];

for (const dir of PER_ARCH) {
	const file = path.join(dir, "package.json");
	const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
	pkg.version = version;
	fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}

const rootFile = "package.json";
const root = JSON.parse(fs.readFileSync(rootFile, "utf-8"));
root.version = version;
root.optionalDependencies = root.optionalDependencies || {};
for (const dir of PER_ARCH) {
	const pkg = JSON.parse(
		fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
	);
	root.optionalDependencies[pkg.name] = version;
}
fs.writeFileSync(rootFile, JSON.stringify(root, null, 2) + "\n");

console.log(`Bumped all 6 packages to ${version}.`);
