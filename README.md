# NoemaForge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://choosealicense.com/licenses/agpl-3.0/)

NoemaForge is a journaling web app focused on turning raw thoughts into clearer, searchable reflections.

## Local setup

1. Copy the example environment file: `cp .env.example .env.local`
2. Start local Postgres with Docker if you do not already have one running: `docker compose up -d postgres`
   - If your Docker install does not include Compose, use:
     `docker run --name noema-forge-postgres -e POSTGRES_DB=noema_forge -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:17-alpine`
3. Install dependencies: `npm install`
4. Apply the bootstrap schema: `npm run db:push`
5. Start the app: `npm run dev`

The app runs at `http://127.0.0.1:3000`. Open it to create a journal account or sign in, and use `http://127.0.0.1:3000/api/health` for the health route.

The sign-in page and health route still load without Postgres configured, but account creation, journal entry saves, edits, and search require `DATABASE_URL`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js app |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint across the app and test files |
| `npm run test:unit` | Run Vitest unit and route tests |
| `npm run test:e2e` | Run the Playwright smoke suite |
| `npm run db:generate` | Generate Drizzle SQL from the schema |
| `npm run db:push` | Push the current Drizzle schema to Postgres |
| `npm run db:studio` | Open Drizzle Studio against the configured database |

Run `npx playwright install chromium` once before the first local Playwright run.

## Stack

- Next.js 16 with TypeScript and App Router
- Tailwind CSS 4 for the responsive shell
- PostgreSQL with Drizzle ORM for schema management
- S3-compatible storage wiring for future uploads
- Vitest, Testing Library, and Playwright for automated coverage
- GitHub Actions CI for linting and test automation

See [plan.md](plan.md) for the roadmap and [PHILOSOPHY.md](PHILOSOPHY.md) for the longer-form product rationale.
