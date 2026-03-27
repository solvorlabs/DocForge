#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const PLATFORM_PACKAGES = {
  "linux-x64":    "@docforge-cli/cli-linux-x64",
  "linux-arm64":  "@docforge-cli/cli-linux-arm64",
  "darwin-x64":   "@docforge-cli/cli-darwin-x64",
  "darwin-arm64": "@docforge-cli/cli-darwin-arm64",
  "win32-x64":    "@docforge-cli/cli-win32-x64",
};

function getRustBinary() {
  const key = `${process.platform}-${process.arch}`;
  const pkgName = PLATFORM_PACKAGES[key];
  if (!pkgName) return null;

  try {
    const pkgDir = path.dirname(require.resolve(`${pkgName}/package.json`));
    const binName = process.platform === "win32" ? "dcf.exe" : "dcf";
    const binPath = path.join(pkgDir, "bin", binName);
    if (fs.existsSync(binPath)) return binPath;
  } catch (_) {}
  return null;
}

const rustBin = getRustBinary();

if (rustBin) {
  const result = spawnSync(rustBin, process.argv.slice(2), { stdio: "inherit" });
  process.exit(result.status != null ? result.status : 0);
} else {
  console.error(
    "\n  ✗ DocForge native binary not found for your platform.\n" +
    "  Try reinstalling: npm install -g docforge-cli\n" +
    "  Or download a binary from: https://github.com/solvorlabs/DocForge/releases\n"
  );
  process.exit(1);
}
