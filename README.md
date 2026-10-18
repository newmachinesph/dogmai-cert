# DOGM.AI Certificates

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma)
![Turso / SQLite](https://img.shields.io/badge/DB-Turso%20%2F%20SQLite-4ff8d2)

A digital certificate management platform from DOGM.AI: admins issue
certificates from reusable templates, and recipients get a public, shareable
certificate page they can download as PNG or PDF, share to LinkedIn, X/Twitter or
Facebook, and that anyone can verify by code or QR. Built with Next.js (App Router),
React 19, Tailwind CSS 4, Prisma and Turso (libSQL).

Related: [dogmai-cohort](https://github.com/newmachinesph/dogmai-cohort), the
bootcamp's cohort management platform.

## Features

- **Certificate pages** (`/c/[publicId]`) rendered on a canvas from a template's
  JSON layout and style config, with signatures and an embedded verification QR code.
- **Download** as PNG (html2canvas) or A4-landscape PDF (jsPDF).
- **Social sharing** to LinkedIn, X/Twitter and Facebook.
- **Public verification** (`/verify`, `/verify/[code]`) showing active, revoked or
  expired status.
- **JSON API** for auth (signup/login with bcrypt + JWT, in-memory login rate
  limiting), certificates (list, issue, update, revoke, delete), templates and
  signatures. Issuing and managing certificates, templates and signatures is
  admin-only.
- **Analytics tables** for certificate views and shares.

There is no admin UI yet: certificates, templates and signatures are created through
the API (or the seed scripts).

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
```

Create a `.env` file (ignored by git):

```bash
# Local SQLite database used by Prisma when Turso is not configured
DATABASE_URL="file:./dev.db"

# Required in production (min. 32 chars); a dev fallback is used in development
JWT_SECRET="replace-with-a-long-random-string"

# Optional: use Turso instead of local SQLite
TURSO_DATABASE_URL="libsql://<your-db>.turso.io"
TURSO_AUTH_TOKEN="<your-turso-token>"

# Base URL used in share links and QR codes (defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Create the schema and seed sample data:

```bash
npx prisma db push          # local SQLite
npx tsx prisma/seed.ts      # local sample data

# or, against Turso
npx tsx prisma/push-to-turso.ts
npx tsx prisma/seed-turso.ts
```

The seed scripts **clear all tables** before inserting sample users, signatures, two
templates and three certificates. They create demo accounts with well-known
passwords (printed at the end of the run) — never run them against a production
database, and change those passwords if you ever do.

Run the dev server and open [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Vitest with v8 coverage |

Tests use Vitest, jsdom and Testing Library.

## Project structure

```
prisma/
  schema.prisma          Data model (users, templates, certificates, signatures, views, shares, settings)
  seed.ts                Local SQLite seed
  push-to-turso.ts       Create tables and indexes on Turso
  seed-turso.ts          Turso seed
src/
  app/
    page.tsx             Home: recent certificates and stats
    c/[publicId]/        Public certificate page
    verify/              Verification search and result pages
    api/                 auth, certificates, templates, signatures route handlers
  components/certificate/
    CertificateCanvas.tsx   Canvas renderer (template layout, signatures, QR)
    CertificateActions.tsx  Download and share actions
  lib/
    auth.ts              Password hashing, JWT, validation, rate limiting
    db.ts                Prisma client (Turso adapter or local SQLite)
    utils.ts             IDs, dates, app/share URLs
  __tests__/             Vitest suites
```

## License

[MIT](LICENSE). MIT covers the code; the DOGM.AI name identifies the project.
