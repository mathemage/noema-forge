# NoemaForge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://choosealicense.com/licenses/agpl-3.0/)

NoemaForge is a journaling web app focused on turning raw thoughts into clearer, searchable reflections.

It is a self-guided reflection practice, not therapy. It is not a therapist, it does not diagnose,
and it is not a substitute for professional care. If you are in crisis, contact your local emergency
services or a crisis line.

## Local setup

1. Copy the example environment file: `cp .env.example .env.local`
2. Start local Postgres with Docker if you do not already have one running: `docker compose up -d postgres`
   - If your Docker install does not include Compose, use:
     `docker run --name noema-forge-postgres -e POSTGRES_DB=noema_forge -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:17-alpine`
3. Install dependencies: `npm install`
4. Apply the checked-in migrations: `npm run db:migrate`
5. Start the app: `npm run dev`

The app runs at `http://127.0.0.1:3000`. Open it to create a journal account or sign in, and use `http://127.0.0.1:3000/api/health` for the health route.

`db:migrate` expects a fresh database or one already managed by that command. If a disposable local database was previously initialized with `db:push`, recreate it before migrating. Back up any data-bearing database instead of recreating it.

Entries written before v2 keep their text in one `body` column. `db:migrate` copies that text into `raw_body` and leaves it there; `db:backfill-reflections` then reads the section headings back out into the reflection columns. It is a dry run unless you pass `-- --apply`, it never writes `body`, `source`, or either timestamp, and any entry whose text it cannot reproduce exactly, up to CRLF line endings, stays a raw capture. Run it against a copy of your database first and diff the plan on stdout.

The sign-in page still loads without Postgres configured. The health route returns `503` until Postgres is reachable, and account creation, journal entry saves, edits, and search require `DATABASE_URL`.

By default, auth stays on the first-party journal session flow. To enable the optional Auth.js credentials alternative, set `AUTH_SIGN_IN_MODE=authjs-credentials`, provide `AUTH_SECRET`, and set `AUTH_TRUST_HOST=true` if your deployment relies on forwarded proxy headers. The same journal user records and entry routes stay in place; only the sign-in/session mechanism changes.

Guided reflection works without extra services. To enable optional Ollama suggestions, set `OLLAMA_BASE_URL` and `OLLAMA_MODEL` to a trusted service; assist requests send it the current draft and reflection fields.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js app |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint across the app and test files |
| `npm run test:unit` | Run Vitest unit and route tests |
| `npm run test:e2e` | Run the Playwright smoke suite |
| `npm run db:generate` | Generate Drizzle SQL from the schema |
| `npm run db:backfill-reflections` | Print the plan for filling reflection columns on pre-v2 entries; add `-- --apply` to write it |
| `npm run db:migrate` | Apply checked-in Drizzle migrations |
| `npm run db:push` | Push the current schema during local prototyping |
| `npm run db:studio` | Open Drizzle Studio against the configured database |

Run `npx playwright install chromium` once before the first local Playwright run.

See [docs/deployment.md](docs/deployment.md) for the Vercel and Neon production runbook.

## Stack

- Next.js 16 with TypeScript and App Router
- Tailwind CSS 4 for the responsive shell
- PostgreSQL with Drizzle ORM for schema management
- S3-compatible storage wiring for future uploads
- Vitest, Testing Library, and Playwright for automated coverage
- GitHub Actions CI for linting and test automation

See [plan_v2.0.0.md](plan_v2.0.0.md) for the current roadmap, [plan_v1.0.0.md](plan_v1.0.0.md) for the
historical v1 roadmap, and [PHILOSOPHY.md](PHILOSOPHY.md) for the longer-form product rationale.
