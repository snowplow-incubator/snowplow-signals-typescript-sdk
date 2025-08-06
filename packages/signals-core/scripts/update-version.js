#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const versionContent = `// This file is auto-generated. Do not edit manually.
export const version = "${packageJson.version}";
`;

const versionFilePath = path.join(__dirname, "..", "src", "version.ts");
fs.writeFileSync(versionFilePath, versionContent, "utf8");
