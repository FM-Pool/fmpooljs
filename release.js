#!/usr/bin/env node
/**
 * Robust Release-Script für fmpooljs
 * - Aktualisiert package.json
 * - Sucht index.js (src/index.js oder index.js) und ersetzt Version
 * - Führt "npm run build" aus
 * - Commit, annotierter Tag vX.Y.Z, latest tag (force), Push
 *
 * Usage:
 *   node release.js 0.0.5
 */

import fs from "fs";
import { execSync } from "child_process";
import path from "path";

function run(cmd, opts = {}) {
  console.log("▶", cmd);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch (e) {
    return false;
  }
}

const versionArg = process.argv[2];
if (!versionArg) {
  console.error("❌ Bitte eine Versionsnummer angeben, z.B.: node release.js 0.0.5");
  process.exit(1);
}
const version = versionArg;

// 1) package.json aktualisieren
const pkgPath = path.resolve("./package.json");
if (!fileExists(pkgPath)) {
  console.error("❌ package.json nicht gefunden im Projektroot.");
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
console.log(`✅ package.json auf Version ${version} gesetzt`);

// 2) index.js suchen (unter src/ oder im root)
const candidatePaths = [path.resolve("./src/index.js"), path.resolve("./index.js")];
let indexPath = null;
for (const p of candidatePaths) {
  if (fileExists(p)) {
    indexPath = p;
    break;
  }
}
if (!indexPath) {
  console.error("❌ Konnte index.js nicht finden. Erwartet: ./src/index.js oder ./index.js");
  process.exit(1);
}
console.log(`ℹ️ Gefundene index.js: ${indexPath}`);

// 3) Version in index.js ersetzen - mehrere RegEx-Strategien versuchen
let src = fs.readFileSync(indexPath, "utf-8");
const replacements = [
  // const version = "0.0.4";
  {
    re: /const\s+version\s*=\s*["'].*?["']/,
    repl: `const version = "${version}"`
  },
  // var version = "0.0.4";
  {
    re: /var\s+version\s*=\s*["'].*?["']/,
    repl: `var version = "${version}"`
  },
  // version: "0.0.4"   (inside object literal)
  {
    re: /version\s*:\s*["'].*?["']/,
    repl: `version: "${version}"`
  },
  // "version":"0.0.4" JSON-ish (unlikely in index.js but safe)
  {
    re: /"version"\s*:\s*"[^"]*"/,
    repl: `"version":"${version}"`
  }
];

let replaced = false;
for (const r of replacements) {
  if (r.re.test(src)) {
    src = src.replace(r.re, r.repl);
    replaced = true;
    console.log(`✅ index.js: Pattern '${r.re}' ersetzt.`);
    break;
  }
}

if (!replaced) {
  console.error("❌ Keine Version-Pattern in index.js gefunden. Abgebrochen.");
  console.error("Bitte prüfe, ob index.js eine Version wie 'const version = \"0.0.4\"' enthält.");
  process.exit(1);
}

// Schreibe die Datei zurück
fs.writeFileSync(indexPath, src, "utf-8");
console.log(`✅ index.js auf Version ${version} gesetzt (${indexPath})`);

// 4) Build ausführen
try {
  run("npm ci");
} catch (e) {
  console.log("ℹ️ 'npm ci' scheiterte oder ist nicht nötig; versuche 'npm install'...");
  run("npm install");
}
run("npm run build");

// 5) Git commit / tag / push
try {
  run("git add -A");
  run(`git commit -m "build: release v${version}" || echo "no changes to commit"`);
  // Annotated tag (empfohlen)
  run(`git tag -a v${version} -m "Release v${version}"`);
  // force latest tag to this version
  run("git tag -f latest");
  // Push commits and tags explicitly
  run("git push origin main"); // push branch
  run(`git push origin v${version}`); // push version tag
  run("git push origin -f latest"); // push latest tag (force)
  console.log(`🎉 Release v${version} erfolgreich erstellt und gepusht.`);
} catch (e) {
  console.error("❌ Git-Operation fehlgeschlagen:", e.message || e);
  process.exit(1);
}

console.log("URLs:");
console.log(` - Versioned: https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@v${version}/dist/fmpooljs.min.js`);
console.log(` - Latest:    https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@latest/dist/fmpooljs.min.js`);
