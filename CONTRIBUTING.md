# Contributing to Graph Lens Lite

## Setup

```bash
git clone https://github.com/Delta4AI/GraphLensLite.git
cd GraphLensLite
npm install
```

Build dependencies (Fedora/RHEL):
```bash
dnf install libxcrypt-compat wine   # only needed for cross-platform builds
```

## npm Scripts

| Command | Purpose |
|---|---|
| `npm run bundle:serve` | Dev server with watch + sourcemaps (recommended for development) |
| `npm run serve` | Static http-server on :8000 |
| `npm start` | Electron app (injects version automatically) |
| `npm run bundle` | One-off bundle (no minify) |
| `npm run bundle:prod` | Production bundle (minified) |
| `npm run dist-linux` | Build Linux packages (AppImage, deb, snap) |
| `npm run dist-windows` | Build Windows packages (nsis, portable) |
| `npm run dist-mac` | Build macOS packages (dmg, zip) |
| `npm run inject-version` | Sync version from `package.json` into `src/config.js` |

## Version Management

The app version is defined in `package.json` and displayed in the UI via `src/config.js`.
The `inject-version` script keeps them in sync — `package.json` is the source of truth.

### Bumping a version

```bash
npm version minor --no-git-tag-version   # or: major, patch
npm run inject-version
git add package.json src/config.js
git commit -m "chore: bump to v$(node -p "require('./package.json').version")"
git tag "v$(node -p "require('./package.json').version")"
git push origin main --tags
```

## Code Style

- Follow the style of the file you're editing
- No docstrings or type annotations unless already present
- Comments only where logic is non-obvious
- No unnecessary abstractions

## Commits

- Lowercase start, under 30 words, imperative mood
- One logical change per commit
- Examples from the log:
  - `fix query editor cursor jumping, bracket processing, caret flicker and overlay alignment`
  - `add guided tour with sample dataset and step-by-step UI walkthrough`

## Pull Requests

- One feature or fix per PR
- Read relevant source files before modifying — understand existing patterns
- Test in both browser (`npm run bundle:serve`) and Electron (`npm start`)
