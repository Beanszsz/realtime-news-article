# News Article — Project README

This repository is a Next.js-based web application for publishing and serving news articles. It uses Prisma as the ORM with a PostgreSQL database and includes a serverless cron cleanup route that deletes expired articles.

This README explains what you need to run the project locally, required environment variables / APIs, and the common commands for development, building, and deployment.

---

## Table of contents

- Project overview
- Requirements
- Environment variables
- Local development setup
- Database (Prisma) setup
- Available npm scripts
- Deployment notes (Vercel)
- Security & secrets
- Troubleshooting
- Contributing

---

## Project overview

- Framework: Next.js
- Language: JavaScript (React)
- Database: PostgreSQL (accessed via Prisma)
- ORM: Prisma (schema: `prisma/schema.prisma`)
- Cron cleanup: `GET /api/cron/cleanup` — expects `Authorization: Bearer <CRON_SECRET>`

## Requirements

- Node.js (recommended LTS; Node 18+ is commonly compatible with modern Next versions)
- npm (or yarn / pnpm)
- PostgreSQL (local or remote) or any other datasource compatible with Prisma's `postgresql` provider
- (Optional) Vercel account for deployment and cron scheduling

---

## Environment variables

Create a `.env` file in the project root (this repo already ignores `.env` — do not commit secrets). The following variables are required for local development and production:

- `DATABASE_URL` — Postgres connection string, e.g.:
  - `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
- `CRON_SECRET` — a secret token used by your cron service to authenticate calls to the cleanup endpoint:
  - The cleanup endpoint checks `Authorization: Bearer <CRON_SECRET>`.

Important: `.env` is private and should not be committed.

---

## Local development setup

1. Clone the repo and change to the project directory:
```news-article/README.md#L100-106
git clone <your-repo-url>
cd news-article
```

2. Install dependencies:
```news-article/README.md#L107-111
npm install
# or (if you prefer)
# yarn install
# pnpm install
```

3. Generate Prisma client:
```news-article/README.md#L112-114
npx prisma generate
```

4. Configure your database:
- Ensure you have a running PostgreSQL instance.
- Add `DATABASE_URL` and `CRON_SECRET` to `.env`.

5. Run database migrations (creates initial schema and tracking):
```news-article/README.md#L115-118
npx prisma migrate dev --name init
# OR, if you prefer to push the schema without creating migrations:
# npx prisma db push
```

6. Start the dev server:
```news-article/README.md#L119-121
npm run dev
# Opens on http://localhost:3000 by default
```

Notes:
- If you change the Prisma schema, run `npx prisma migrate dev` (or `npx prisma db push` for development but note differences).
- If you see "Prisma Client not found" errors, ensure `npx prisma generate` completed successfully.

---

## Common npm scripts

- `npm run dev` — Start Next.js in development mode (with Turbopack as configured).
- `npm run build` — Build the production assets.
- `npm run start` — Run the production server (after build).
- `npm run lint` — Run ESLint.

Examples:
```news-article/README.md#L122-129
# Development
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start
```

---

## Prisma & database notes

Prisma schema is in `prisma/schema.prisma`. The `NewsArticle` model uses a `expiresAt` field — the project has a cleanup route that deletes expired articles.

Helpful Prisma commands:
```news-article/README.md#L130-140
# Generate Prisma client (run after any schema change)
npx prisma generate

# Create a new migration (development)
npx prisma migrate dev --name <migration-name>

# Apply migrations in non-interactive environments
npx prisma migrate deploy

# Push schema to the database (no migration history)
npx prisma db push
```

If you want to inspect your database during development:
```news-article/README.md#L141-144
npx prisma studio
# Opens a web UI to view and edit DB rows
```

---

## The cron cleanup endpoint

This project exposes a scheduled cleanup route:

- Endpoint: `GET /api/cron/cleanup`
- Authentication: request must include header `Authorization: Bearer <CRON_SECRET>`

If you deploy to Vercel:
- Use Vercel Cron to request this endpoint at your desired interval.
- Configure the environment variable `CRON_SECRET` on Vercel (Project settings > Environment Variables).
- Configure the cron to include the header `Authorization: Bearer <CRON_SECRET>`.

Local testing:
```news-article/README.md#L145-152
# Example curl (replace <CRON_SECRET> with your secret)
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/cleanup
```

---

## Deployment notes (Vercel)

- `vercel.json` exists to help configure Vercel-specific settings.
- On Vercel, configure the `DATABASE_URL` and `CRON_SECRET` environment variables in the dashboard.
- On Vercel you can add a Cron Job to call the cleanup endpoint regularly (set `Authorization` header).

Other platforms:
- Any platform that supports Node.js and environment variables should work, but ensure Prisma can connect to your Postgres instance and you run migrations or `prisma db push`.

---

## Security & secrets

- Never commit `.env` or secret files. This repo includes `.gitignore` entries to ignore dev-only secret files (example: `test-cleanup.js`) — those are local-only files.
- If a secret is accidentally committed, rotate the secret and remove it from history using appropriate git history tools.
- Use secure random values for `CRON_SECRET`.

---

## Troubleshooting

- "Prisma Client not found" — run `npx prisma generate`.
- "Database connection error" — verify `DATABASE_URL`, database is running, and network access is permitted.
- Port conflicts — ensure no other service is using the port (default 3000). Use `PORT` env var to change.
- If build fails, check Node version compatibility and dependency versions in `package.json`.

Quick diagnostic commands:
```news-article/README.md#L153-158
# Show uncommitted changes and untracked files
git status

# Search for references to a string in the repo
git grep -n "test-cleanup" || true
```

---

## Contributing

- Follow existing code style and lint rules (`npm run lint`).
- If you modify database models, add/modify Prisma migrations and run the corresponding `prisma generate`.
- Open pull requests with descriptive titles and change descriptions.

---

## Additional notes

- This project uses Prisma v6 and Next.js. Make sure to follow Prisma and Next.js documentation for advanced configuration and deployment scenarios.
- If you expect to run production workloads, configure connection pooling and secrets management according to your platform best practices.

---

## Test commits
