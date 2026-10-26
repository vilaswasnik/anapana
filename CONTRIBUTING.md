# Contributing to Anapana

Thanks for looking. Anapana is a framework-free meditation timer PWA — plain HTML, CSS, and JavaScript, no build step, no backend, no tracking. Contributions of code, sounds, docs, and bug reports are all welcome.

## Run it locally

There is nothing to install. Either open `index.html` in a browser, or serve the folder so the service worker and manifest behave like production:

```bash
git clone https://github.com/vilaswasnik/anapana.git
cd anapana
python3 -m http.server 8000
# open http://localhost:8000
```

One production caveat to keep in mind: the live site is served from the `/anapana/` subpath on GitHub Pages. Paths in `sw.js` (`urlsToCache`) and `manifest.json` (`start_url`, `scope`) must stay relative to that subpath — root-absolute paths (`/index.html`, …) break the installed app.

## Ground rules

1. **No frameworks, no build step, no dependencies.** That is the project's core constraint — the whole app must keep working as static files.
2. **Privacy is the product.** No analytics, no tracking, no external requests beyond the fonts/icons CDNs already in use. All user data stays in `localStorage` on the device.
3. **Never wipe user data.** Session history, streaks, and settings in `localStorage` are precious to users. Any change to storage keys or defaults needs a migration, not a reset — a page-load data-wipe bug shipped once (fixed in PR #2) and must not come back.
4. **Bump the cache version.** If you change any cached file, increment `CACHE_NAME` in `sw.js`, or installed users will keep the old version forever.
5. **Accessibility is a feature.** Keep ARIA labels, focus states, and the dark/light themes working; test with keyboard navigation.

## Filing an issue

Use GitHub Issues. A useful bug report includes: device/browser, whether the app was installed (PWA) or in a browser tab, what you did, and what happened. For sound problems, say which bell/ambient track was selected.

## PR process

1. Fork, branch from `main`, keep the change focused.
2. Test locally in a browser **and** as an installed PWA if your change touches `sw.js`, `manifest.json`, or storage.
3. Say in the PR description how you tested, and confirm the `CACHE_NAME` bump if cached files changed.
4. One approval from the maintainer merges; pushes to `main` deploy to GitHub Pages automatically.

## Good first issues

Concrete, evidence-based starting points (each cites where the gap is):

1. **Finish the PWA subpath fix.** `sw.js` `urlsToCache` and the `manifest.json` `start_url`/`scope` still use root-absolute paths even though the site lives under `/anapana/` — make them subpath-relative and verify the installed app loads offline.
2. **Shrink the ambient audio.** `sounds/ambient/meditate1.mp3` is ~43 MB in the repo. Re-encode it at an ambient-appropriate bitrate (or split/stream it) and update the README's size claim to match reality.
3. **Retire `README_old.md`.** A 9.2 KB duplicate of the old README sits next to the current one in the root — check nothing links to it and delete it.
4. **Move the cache-reset utility pages out of the root.** `clear-cache.html`, `clear-sw-cache.html`, `nuclear-reset.html`, and `reset-sounds.html` are support tools; grouping them under a `tools/` folder (with links from `DEPLOYMENT.md`) keeps the app root clean.
