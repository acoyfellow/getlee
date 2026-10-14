# Working on getlee

- Run `npm run check` before saying a change works. With a dev server up, run `BASE=http://localhost:8790 npm run check`.
- Effect stays at exactly `4.0.0`. Foldkit 0.168.0 requires it.
- The link format lives only in `shared/link.ts`. It must match the dashboard's documented `#lee-draft=` contract. Do not add page anchors or query values that carry the prompt.
- The prompt must never leave the browser. No backend routes, no analytics, no logging of URLs.
- Do not add source comments.
- Keep `workers_dev: false` and `preview_urls: false`.
- Never commit account IDs or tokens.
