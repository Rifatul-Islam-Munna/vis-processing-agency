# Production verification

Independent clean-directory verification completed on 13 July 2026 against the production source and the supplied Visim ZIP archives.

The following checks passed:

- `npm install` restored the checksum-verified production source and the 12-part original ZIP runtime asset bundle.
- `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities** after upgrading Mongoose and pinning the patched PostCSS release.
- `npm run verify` validated **25 pages, 39 forms, 1,034 page asset references, 444 deployed runtime files, and 6 seeded products**.
- The transformed public pages retained the original non-script HTML tag and CSS-class counts from their ZIP source pages.
- `npm run build` completed successfully with Next.js 16.2.10.
- `npm run typecheck` completed successfully after generated Next.js types were available.
- A production server returned HTTP 200 for all 25 public routes, `/login`, `/register`, `/search`, `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/assets/css/main.css`, `/assets/js/main.js`, and `/assets/js/cms-runtime.js`.

Database-backed writes require a reachable MongoDB instance configured through `MONGODB_URI`. The clean build and public-route checks use the application's documented static fallback where a database is not configured.
