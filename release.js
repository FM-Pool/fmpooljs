#!/usr/bin/env node
/**
 * Release-Script für fmpooljs
 * Automatisiert Versionierung, Build, Commit, Tagging und Push.
 */

import fs from "fs";
import { execSync } from "child_process";

const version = process.argv[2];

if (!version) {
  console.error("❌ Bitte eine Version angeben, z. B.:");
  console.error("   node release.js 0.0.2");
  process.exit(1);
}

// --- Helper-Funktion ---
function run(cmd) {
  console.log("▶", cmd);
  execSync(cmd, { stdio: "inherit" });
}

// --- 1️⃣ package.json aktualisieren ---
const pkgPath = "./package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✅ package.json auf Version ${version} aktualisiert`);

// --- 2️⃣ Version in src/index.js aktualisieren ---
const srcPath = "./src/index.js";
let src = fs.readFileSync(srcPath, "utf-8");
src = src.replace(/version:\s*["'].*?["']/, `version: "${version}"`);
fs.writeFileSync(srcPath, src);
console.log(`✅ src/index.js Version auf ${version} gesetzt`);

// --- 3️⃣ Build ausführen ---
run("npm run build");

// --- 4️⃣ Änderungen committen und taggen ---
run("git add .");
run(`git commit -m "build: release v${version}"`);
run(`git tag v${version}`);
run("git tag -f latest");

// --- 5️⃣ Push an GitHub ---
run("git push origin main --follow-tags");
run(`git push origin v${version}`);
run("git push origin -f latest");

console.log(`🎉 Release v${version} erfolgreich erstellt und gepusht!`);
console.log(`👉 jsDelivr URL: https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@v${version}/dist/fmpooljs.min.js`);
console.log(`👉 Always latest: https://cdn.jsdelivr.net/gh/FM-Pool>/fmpooljs@latest/dist/fmpooljs.min.js`);
