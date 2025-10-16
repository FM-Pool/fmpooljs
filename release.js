#!/usr/bin/env node
/**
 * fmpooljs Release Script
 * Automatisiert:
 * - Version in package.json und index.js anpassen
 * - Build starten
 * - Commit + Tags (vX.Y.Z + latest)
 * - Push an GitHub
 * - jsDelivr Cache für 'latest' invalidieren
 * - Validiert, dass die neue Version im dist-Build enthalten ist
 *
 * Usage:
 *   node release.js 0.1.0
 */

import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const versionArg = process.argv[2];
if (!versionArg) {
  console.error("❌ Bitte eine Versionsnummer angeben, z.B.: node release.js 0.1.0");
  process.exit(1);
}
const version = versionArg;

function run(cmd, opts = {}) {
  console.log("▶", cmd);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

// --- 1️⃣ package.json aktualisieren ---
const pkgPath = path.resolve("./package.json");
if (!fileExists(pkgPath)) {
  console.error("❌ package.json nicht gefunden im Projektroot.");
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
console.log(`✅ package.json auf Version ${version} gesetzt`);

// --- 2️⃣ src/index.js suchen und Version ersetzen ---
const indexPath = fileExists("./src/index.js")
  ? "./src/index.js"
  : fileExists("./index.js")
  ? "./index.js"
  : null;

if (!indexPath) {
  console.error("❌ Konnte index.js nicht finden (erwartet ./src/index.js oder ./index.js).");
  process.exit(1);
}
console.log(`ℹ️ Gefundene index.js: ${indexPath}`);

let src = fs.readFileSync(indexPath, "utf-8");
const regex = /const\s+version\s*=\s*["'].*?["']/;
if (!regex.test(src)) {
  console.error("❌ Kein Version-Pattern gefunden. Erwartet z.B. 'const version = \"0.1.0\"'");
  process.exit(1);
}
src = src.replace(regex, `const version = "${version}"`);
fs.writeFileSync(indexPath, src, "utf-8");
console.log(`✅ index.js auf Version ${version} aktualisiert`);

// --- 3️⃣ Build ausführen ---
try {
  run("npm ci");
} catch {
  console.log("ℹ️ 'npm ci' nicht möglich, versuche 'npm install'...");
  run("npm install");
}
run("npm run build");

// --- 4️⃣ Sicherstellen, dass dist/fmpooljs.min.js die neue Version enthält ---
const distPath = "./dist/fmpooljs.min.js";
if (!fileExists(distPath)) {
  console.error("❌ Keine dist/fmpooljs.min.js gefunden – Build fehlgeschlagen?");
  process.exit(1);
}
const distContent = fs.readFileSync(distPath, "utf-8");
if (!distContent.includes(version)) {
  console.warn("⚠️ WARNUNG: dist/fmpooljs.min.js enthält die neue Version NICHT!");
  console.warn("Bitte prüfe, ob dein Build-Script die Version aus src/index.js korrekt übernimmt.");
} else {
  console.log("✅ dist enthält neue Versionsnummer");
}

// --- 5️⃣ Commit + Tag + Push ---
try {
  run("git add -A");
  run(`git commit -m "build: release v${version}" || echo 'Keine Änderungen zu committen'`);
  run(`git tag -a v${version} -m "Release v${version}"`);
  run("git tag -fa latest -m 'Latest release'");
  run("git push origin main");
  run(`git push origin v${version}`);
  run("git push origin -f latest");
  console.log(`🎉 Release v${version} erfolgreich erstellt und gepusht.`);
} catch (err) {
  console.error("❌ Git-Operation fehlgeschlagen:", err.message || err);
  process.exit(1);
}

// --- 6️⃣ jsDelivr Cache invalidieren ---
const purgeUrl =
  "https://purge.jsdelivr.net/gh/FM-Pool/fmpooljs@latest/dist/fmpooljs.min.js";
console.log(`🚀 jsDelivr Cache leeren: ${purgeUrl}`);

try {
  const res = await fetch(purgeUrl);
  const text = await res.text();
  console.log("✅ jsDelivr purge result:", text);
} catch (err) {
  console.warn("⚠️ jsDelivr purge fehlgeschlagen:", err.message);
}

console.log("\nURLs:");
console.log(` - Versioned: https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@v${version}/dist/fmpooljs.min.js`);
console.log(` - Latest:    https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@latest/dist/fmpooljs.min.js`);
