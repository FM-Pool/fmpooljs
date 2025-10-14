# fmpooljs

## Development

### 1. Build und Release auf GitHub

#### 1️⃣ Build erstellen

Führe folgenden Befehl im Projektverzeichnis aus, um die minimierte Datei `dist/fmpooljs.min.js` zu erzeugen:

```bash
npm install
npm run build
```

#### 2️⃣ Änderungen committen und Version taggen

```bash
git add .
git commit -m "build: release v0.0.1"
git tag v0.0.1
git push origin main --follow-tags
```

#### 3️⃣ GitHub Release veröffentlichen

1. Öffne dein Repository auf GitHub.
2. Gehe zu Releases → “Draft a new release”.
3. Wähle den eben erstellten Tag v0.0.1 aus.
4. Gib optional einen Titel und eine Beschreibung ein.
5. Klicke auf “Publish release”.

Release verfügbar unter: https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@v0.0.1/dist/fmpooljs.min.js