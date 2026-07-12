# Vis Processing Agency

A pixel-faithful Next.js migration of the supplied Visim immigration and visa consulting HTML template, backed by a MongoDB CMS.

## Included

- 25 imported public template pages with the original CSS, JavaScript, fonts and media
- Next.js 16 App Router and Tailwind CSS 4
- MongoDB/Mongoose page, settings, user, enquiry, activity and media models
- Secure role-based authentication with bcrypt and signed HTTP-only JWT cookies
- Full-page HTML CMS editor with live preview
- Per-page SEO, canonical URL, Open Graph image, no-index and JSON-LD controls
- Global settings and global search/replace
- User account with activity and enquiry history
- Dynamic sitemap and robots.txt
- Asset and route integrity verification

## Setup

```bash
cp .env.example .env.local
npm install
npm run verify
npm run seed
npm run dev
```

`npm install` runs `bootstrap.mjs`. It expands the checked-in, verified Next.js source bundle and restores the matching Visim template assets. The bootstrap validates the complete local asset archive when all 36 parts are available; otherwise it restores the exact original assets from the pinned matching template commit.

The first administrator is created by `npm run seed` using `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` from `.env.local`.

## Architecture

Every imported public page retains its original body markup and theme assets to preserve the supplied design. The body HTML is stored as an editable MongoDB value, so every visible section can be changed from the admin panel. Admin pages are native React/Tailwind interfaces.

## Admin routes

- `/admin` dashboard
- `/admin/pages` content and SEO
- `/admin/settings` global settings and custom code
- `/admin/submissions` form enquiries
- `/admin/users` accounts
- `/admin/media` MongoDB media library
- `/admin/global` global content replacement

## Verification

The imported project was checked for 25 pages, 25 unique routes and 268 referenced local assets. TypeScript, ESLint and the production Next.js build were also run against the generated project.
