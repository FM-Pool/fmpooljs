# fmpooljs

## Usage

The script can be included with the following syntax:

``` html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@stable/dist/fmpooljs.min.js" data-hide-selector=".pss_helptext"></script>
``` 

The `data-hide-selector`can be used to directly hide hide the parent HTML tags for example, when the script is included via `help text` in Planon.

## Development

Available versions are release at [jsdelivr](https://www.jsdelivr.com/package/gh/FM-Pool/fmpooljs?tab=files&version=stable).

[![](https://data.jsdelivr.com/v1/package/gh/FM-Pool/fmpooljs/badge)](https://www.jsdelivr.com/package/gh/FM-Pool/fmpooljs)

### Build and Release on GitHub

Automated with the following command:

```bash
npm run release x.y.z
```

#### 1️⃣ Create build

Run the following command in the project directory to generate the minified file `dist/fmpooljs.min.js`:

```bash
npm install
npm run build
```

#### 2️⃣ Commit changes and tag the version

```bash
git add .
git commit -m "build: release v0.0.1"
git tag v0.0.1
git push origin main --follow-tags
```

#### 3️⃣ Publish GitHub release

1. Open your repository on GitHub.
2. Go to Releases → “Draft a new release”.
3. Select the newly created tag v0.0.1.
4. Optionally, enter a title and description.
5. Click “Publish release”.

Release available at: https://cdn.jsdelivr.net/gh/FM-Pool/fmpooljs@stable/dist/fmpooljs.min.js

### 4️⃣ Always up-to-date version (latest)

To ensure that users of your website or application **always automatically receive the latest stable version** of `fmpooljs`, you can configure jsDelivr to load the most recent version using a special `latest` tag.

***<span style="background-color:red;color:black">
TODO: There is a problem with the latest tag and it does not update. For now use tag `stable`.
</span>***

---

#### 1️⃣ Manually update the “latest” tag

After each new release (e.g. `v0.0.2`), you can move the Git tag `latest` to point to the current version:

```bash
git tag -d latest
git push origin :refs/tags/latest
git tag latest
git push origin latest
```

### Create documentation

``` bash
npm run docs
```

#### Need packages

``` bash
npm install --save-dev jsdoc

npm install --save-dev minami

npm install --save-dev taffydb
```


