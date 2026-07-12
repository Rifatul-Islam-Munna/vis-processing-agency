# Vis Processing Agency

A Next.js and MongoDB CMS migration of the supplied **Visim immigration and visa consulting HTML template**.

## Source ZIP audit

The supplied ZIP contains:

- 25 usable Visim website HTML pages
- 497 files under the original `visim/assets` directory
- separate documentation files
- macOS `__MACOSX` duplicate metadata

The migration includes all 25 website pages and the CSS, JavaScript, fonts, images and icons needed at runtime. Documentation, macOS metadata and authoring-only source files such as unused SCSS/source maps are not served by the Next.js application.

## Included application features

- Original template markup and runtime styling preserved for the 25 public routes
- Next.js 16 App Router
- Tailwind CSS administration, authentication and account interfaces
- MongoDB/Mongoose models for pages, settings, users, enquiries, activity and media
- bcrypt password hashing and signed HTTP-only JWT sessions
- Optional user registration, account history and enquiry history
- Full-page HTML editor with live visual preview
- Page creation, publishing, slug editing, custom CSS/JavaScript and head markup
- SEO title, description, keywords, canonical URL, Open Graph, Twitter cards, no-index and JSON-LD
- Global site settings and global content replacement
- Public form capture for the template contact, consultation, comment and checkout forms
- Enquiry status management and deletion
- User role, activation and deletion management
- MongoDB image/PDF upload plus local/external media URL registration
- Dynamic sitemap and robots.txt
- Checksum-verified theme asset restoration

## Setup

```bash
cp .env.example .env.local
npm install
npm run verify
npm run seed
npm run dev
```

Set a real MongoDB connection and a random authentication secret of at least 32 characters in `.env.local`.

## Initial administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run:

```bash
npm run seed
```

## Main routes

- `/admin` — overview
- `/admin/pages` — complete page content and SEO
- `/admin/settings` — global details and custom code
- `/admin/global` — global content replacement
- `/admin/enquiries` — captured form submissions
- `/admin/users` — account roles and access
- `/admin/media` — uploaded and linked media
- `/admin/activity` — authenticated browsing history
- `/account` — user history

## Route mapping

`index.html` becomes `/`; `index-2.html` through `index-5.html` become `/home-2` through `/home-5`; every other supplied page uses its filename without `.html`.

The vendor ZIP links to three HTML files that it does not include. They are repaired as follows:

- `course.html` → `/course-v1`
- `price.html` → `/services`
- `login.html` → `/login`

The missing vendor `arrow-6.svg` reference is also replaced with a supplied matching arrow asset, and `/site.webmanifest` is provided.

## Verification

`npm run verify` checks the exact 25-route set, duplicate or empty pages, unresolved vendor links, form preservation, direct HTML asset references, nested CSS asset references, the materialized theme file count and required CMS/authentication files.

The GitHub Actions workflow additionally runs TypeScript checking, a production Next.js build and live HTTP smoke tests for all 25 public pages, authentication pages, SEO endpoints and core CSS/JavaScript assets. On success it commits `VERIFICATION.md`, `package-lock.json` and the materialized assets to `main`.
