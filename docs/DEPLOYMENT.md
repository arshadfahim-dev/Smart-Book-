# Deployment Notes — Smart Book

## Production Architecture

Smart Book builds into two artifacts via `npm run build`:
1. `dist/` — Static Vite/React SPA assets (`index.html`, JS/CSS bundles).
2. `dist/server.cjs` — Bundled Express server serving `/api/*` routes and static `dist/` assets with SPA fallback.

## Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name smartbook.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Static SPA Hosting (Netlify / Vercel)

When deploying strictly as a static frontend (`npm run build` -> publish `dist/`):
- `netlify.toml` and `public/_redirects` automatically rewrite unknown routes to `/index.html`.
- Authentication falls back gracefully to offline local workspace mode with Base64 JSON export/restore.
