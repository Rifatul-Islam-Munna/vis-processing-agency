# Vis Processing Agency

A pixel-faithful Next.js migration of the supplied **Visim immigration and visa consulting HTML template**, backed by a MongoDB CMS.

## Included

- All 25 supplied HTML pages converted to working Next.js routes
- Every CSS, JavaScript, font and media file referenced by those pages, packed locally in the repository
- Next.js 16 App Router and Tailwind CSS 4 for the administration, authentication and account interfaces
- MongoDB/Mongoose page, setting, user, enquiry, activity and media models
- Secure bcrypt password hashing and signed HTTP-only JWT sessions
- Optional public registration and a user history/enquiry dashboard
- Complete page HTML editor with publishing, preview, page CSS, page JavaScript and head code
- Per-page SEO title, description, keywords, canonical URL, Open Graph image, no-index and JSON-LD
- Global site settings and global find/replace across every saved page
- Dynamic sitemap.xml and robots.txt
- Public form capture and an admin enquiry inbox

## Setup

```bash
cp .env.example .env.local
npm install
npm run verify
npm run seed
npm run dev
```

`npm install` verifies and expands the checked-in source and theme archives. It does not depend on a third-party template repository.

## Initial administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env.local`, then run `npm run seed`.

## Admin routes

- `/admin` — overview
- `/admin/pages` — complete content and SEO editing
- `/admin/settings` — global details and custom code
- `/admin/global` — global content replacement
- `/admin/enquiries` — public form submissions
- `/admin/users` — registered accounts
- `/admin/media` — reusable media URLs
- `/admin/activity` — authenticated browsing history

## Route mapping

`index.html` becomes `/`; `index-2.html` through `index-5.html` become `/home-2` through `/home-5`; every other supplied page uses its filename without `.html`.

The vendor template links to three files that are not present in the ZIP. These are repaired as follows:

- `course.html` → `/course-v1`
- `price.html` → `/services`
- `login.html` → `/login`
