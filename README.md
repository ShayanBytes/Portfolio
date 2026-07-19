# Shayan Mondal — Portfolio

A route-based developer portfolio built from ShayanBytes' real GitHub work.

## Experience

- `/enter` — a living, cursor-reactive ASCII organism rendered in real time
- `/home` — concise introduction
- `/work` — verified repositories, without mockup imagery
- `/about` — technical profile
- `/contact` — direct contact route

## Principles

- Clear navigation over spectacle
- No photographs or project mockup images
- No WebGL, Three.js, animation frameworks, or oversized portal controls
- Accessible reduced-motion behavior
- Responsive from mobile to large desktop
- Approximately 3.6 KB of production JavaScript when gzipped

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Hosted on GitHub Pages and deployed automatically by GitHub Actions
(`.github/workflows/deploy.yml`). Every push to `main` builds the Vite app and
publishes `dist/` — there is no need to build or commit `dist/` yourself.

To ship an update:

```bash
git add .
git commit -m "describe the change"
git push origin main
```

Then watch the run at
[Actions](https://github.com/ShayanBytes/Portfolio/actions) go green (~1–2 min)
and hard-refresh the live site (`Ctrl+Shift+R`) to bypass the cache:

```
https://shayanbytes.github.io/Portfolio/
```

Notes:

- Pages source must be set to **GitHub Actions** (Settings → Pages), not
  "Deploy from a branch".
- `vite.config.js` sets `base: '/Portfolio/'` for the project-pages subpath. If
  the repo is renamed, update `base` to match or the live page will be blank.
- If a push is rejected because the remote is ahead, run `git pull --no-edit`
  then `git push origin main`.
