"use strict";
const TARGETS = {
	"linux-x64": { pkg: "@kegesch/arc-linux-x64", binary: "arc" },
	"linux-arm64": { pkg: "@kegesch/arc-linux-arm64", binary: "arc" },
	"darwin-x64": { pkg: "@kegesch/arc-darwin-x64", binary: "arc" },
	"darwin-arm64": { pkg: "@kegesch/arc-darwin-arm64", binary: "arc" },
	"win32-x64": { pkg: "@kegesch/arc-win32-x64", binary: "arc.exe" },
};
const listKeys = () => Object.keys(TARGETS);
const getTarget = (platform, arch) => TARGETS[`${platform}-${arch}`] ?? null;
module.exports = { listKeys, getTarget };
