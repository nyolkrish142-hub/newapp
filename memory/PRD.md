# PRD — HR Digital Services (formerly Haryana Enterprises)

## Original Problem Statement
User's existing app (GitHub: sanjivkumar71771-commits/Haryana-Enterprises) — Haryana govt-jobs + solar portal. Requested additions into THEIR code:
1. **WhatsApp Smart Engine** — auto WhatsApp summary per new job (API/manual): 🔥 Job Name 🔥 | ✅ कुल पद | ✅ योग्यता | 📅 आखरी तारीख | 👇 लिंक; Join WhatsApp Channel buttons in header/footer/every post.
2. **SEO Shuffler & Manager** — rotate API jobs' Title/Description for uniqueness; Rank Math style per-job SEO (Custom Title, Focus Keyword, Description) in admin.
3. **Homepage Swap** — vacancy listing at `/`, solar homepage at `/solar`, menu link 'Solar Services'.
4. **Performance & Admin** — 20 vacancies/page with pagination; Resume/CV template upload system in admin.
5. **Blogs Section** — public blogs + admin 'Manage Blogs' with text editor & image upload.
6. **Rebrand** — "Haryana Enterprises" → "HR DIGITAL SERVICES" (एचआर डिजिटल सर्विसेज).

## User Choices
- WhatsApp Channel: https://whatsapp.com/channel/0029Va4Owji5Ui2bLEktCl1C
- WhatsApp summary: auto-generate + copy button in admin (no auto-send)
- Admin: simple email/password (nyolkrish142@gmail.com / Haryana@123)
- Jobs source: existing FreeJobAlert scraper (API) + manual admin posts

## Architecture
- **Backend**: FastAPI + Motor (MongoDB), APScheduler (6h scrape refresh), JWT+cookie auth (auth.py), Emergent object storage for uploads (blog images, CV files) served via `/api/uploads/{fname}`.
- **Frontend**: React CRA, react-helmet-async SEO, i18n (hi/en), dark/glass theme, react-icons.
- **DB collections**: vacancies (manual + scraped), blogs, resume_templates, uploads, users, site_content, etc.

## Implemented (2026-09-03)
- WhatsApp Smart Engine: `build_whatsapp_summary()` in server.py; auto on manual create/update, scraper refresh, startup backfill; copy buttons in AdminVacancies rows + Job SEO Manager; WhatsAppSummaryCard on vacancy detail; Join Channel buttons in Header (desktop+mobile), Footer, vacancy listing banner, job detail, blog detail.
- SEO Shuffler: `_seo_variant()` + 6 title prefixes/6 desc openers; auto-applied to scraped jobs; POST `/api/admin/vacancies/shuffle-seo` re-rotates; per-job SEO edit PUT `/api/admin/vacancies/{id}/seo`; live SEO score in VacancyForm + AdminJobSEO.
- Homepage swap: `/` = Vacancies, `/solar` = old Home, `/vacancies` redirects to `/`; nav + footer updated.
- Pagination: GET `/api/vacancies` returns `{items,total,page,pages}` (20/page default); UI controls on homepage.
- Resume/CV templates: admin upload (PDF/DOC/DOCX/images → object storage), public list on /downloads.
- Blogs: full CRUD (multipart + image upload), public /blogs + /blogs/{slug}, admin rich-text editor.
- Rebrand: strings.js, Header, Footer, index.html, backend seeds, DEFAULT_SITE_CONTENT (added seo:solar, seo:blogs keys).
- Migrated 24 demo Haryana jobs into `vacancies` (manual source) so homepage has Haryana-specific content.
- Fixed CORS: frontend now same-origin (REACT_APP_BACKEND_URL = current preview URL); backend CORS_ORIGINS explicit list.

## Implemented (2026-09-03, round 2)
- Homepage redesign per user's FreeJobAlert reference images: filter panel simplified to Search + Qualification only (state select, saved toggle, category chips, offline-mode chip removed from panel to reduce customer confusion).
- "New Updates" section below email-alerts box: 9 latest vacancies in numbered modern cards (3-col grid), blue gradient header with live pulse dot, "View All" button scrolls to listing.
- Category pills (modern gradient blue, rounded-full) + State pills (HR, DL, PB... short codes) above the listing — both functional (set filters + scroll).
- Webpushr push notifications: snippet in public/index.html (site key placeholder WEBPUSHR_SITE_KEY_HERE — awaiting user's key), public/webpushr-sw.js (standard importScripts worker), PushSubscribeButton (bell) in New Updates header, backend POST /api/webpushr/subscriber stores subscriber IDs in Mongo `push_subscribers`.

## Admin Panel Tabs
Manual Vacancies | Job SEO Manager | Manage Blogs | CV Templates | Site SEO | Front-page Text

## Backlog
- P1: WhatsApp auto-post to channel (needs WhatsApp Business API key from user)
- P1: Public /resume-templates standalone page (currently inside /downloads)
- P1: Webpushr site key from user (placeholder in index.html — everything else ready)
- P2: Blog categories/tags, blog SEO fields
- P2: Sitemap.xml update for /solar + /blogs routes
- P2: Admin inquiries view for solar enquiry form

## Implemented (2026-09-03, round 3)
- **2nd job source: Haryana DC Rate / HKRN** — `fetch_haryana_dcrate()` in scrapers.py scrapes jobpulse.in DC-Rate + HKRN category pages (official HKRN portal blocks non-India traffic; haryanadcratejobs.com is now a spam preset site, so jobpulse mirrors are used). Tagged source="haryana_dcrate", auto category/state (default haryana), WhatsApp summaries + SEO variants auto-applied.
- **Cross-source dedupe** — every vacancy gets `dedupe_key` (normalized title); refresh merges same-title-different-URL posts into one doc (alt_urls) instead of duplicating; one-time startup backfill; cleaned 44 legacy duplicates.
- **Scheduler: 6h → 1h** auto refresh for BOTH sources; frontend text updated ("हर 1 घंटे में automatic update").
- `_cat_from_title` now recognizes hkrn/dc-rate keywords → haryana category.

## Test Credentials
- Admin: nyolkrish142@gmail.com / Haryana@123
