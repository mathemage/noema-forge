# NoemaForge roadmap

## Problem

Build a hosted, mobile-friendly journaling web app that turns raw thought capture into clearer reflection.

The first version should:

- support a private journal that works well on both phones and laptops
- make typing the default capture path while leaving room for voice and handwriting imports
- keep entries searchable in one archive
- guide the user from a raw dump toward a clearer feeling, root issue, and next step
- keep any LLM usage narrow and optional through a separately hosted Ollama service

## Proposed approach

Recommended stack for v1:

- Next.js (current stable) with TypeScript for the full-stack web app
- PostgreSQL for journal data, metadata, and search
- Drizzle ORM for schema management and migrations
- Tailwind CSS for a responsive mobile-first UI
- Vitest and Testing Library for unit and component tests
- Playwright for end-to-end workflow coverage
- Vercel for the web app, with S3-compatible object storage for audio and image uploads
- an optional Ollama service for the narrow reflection-assist flow

Why this stack:

- Next.js fits the existing Vercel hosting direction and keeps the app in one codebase
- PostgreSQL can handle both normal relational data and simple full-text search without extra infrastructure
- Drizzle keeps the schema explicit and easy to review in small PRs
- Tailwind is enough for a polished UI without committing to a heavy design system too early
- Vitest plus Playwright matches the repo guidance to emphasize both unit and integration testing
- Exact framework and library versions should be pinned in the bootstrap PR, not in this long-lived roadmap

Assumptions for MVP:

- single-user or very small-account setup first
- responsive web first, not native apps
- typed capture ships before multimodal polish
- voice and handwriting flows normalize into the same text-based journal model
- LLM support is optional and limited to one follow-up question plus 2-3 next-step suggestions

Keep `README.md` aligned with this plan if the recommended stack or MVP scope changes.

## Roadmap

### Roadmap item 1

- **Title:** `docs(product): Define NoemaForge MVP and roadmap`
- **Branch:** `docs/mvp-roadmap-8`
- **Status:** Completed in issue #8
- **Goal:** lock the product shape, technical direction, and staged PR plan before app scaffolding starts
- **PR body:**

```md
## Why
The repository has the long-form product philosophy, but it still needs an explicit MVP roadmap that keeps future implementation PRs small and reviewable.

## What changed
- added `plan.md` for the NoemaForge MVP
- defined the recommended stack and implementation assumptions
- translated the product philosophy into a staged roadmap with at most five PR-sized items

## Success criteria
- the repository has a dedicated roadmap document
- the roadmap has no more than five implementation items
- each roadmap item is scoped as a reviewable PR slice

## Out of scope
- application code
- deployment configuration
```

- **Prompt for GitHub Copilot:**

```text
Read PHILOSOPHY.md, README.md, AGENTS.md, and .github/copilot-instructions.md first.

Create a new GitHub Issue for defining the NoemaForge MVP roadmap, then create a branch named docs/mvp-roadmap and implement only this PR. Add a root-level `plan.md` that defines:
- the product problem
- the recommended stack
- MVP assumptions
- a staged roadmap with at most five PR-sized items

Keep the PR documentation-only and easy to review. Use a scoped commit message with the issue number, then open a draft PR with the planned title and body.
```

### Roadmap item 2

- **Title:** `chore(app): Bootstrap the web app, tooling, and CI`
- **Branch:** `chore/app-bootstrap`
- **Goal:** create the project skeleton that future feature PRs can build on
- **PR body:**

```md
## Why
Before shipping journal features, the project needs a clean app scaffold, environment handling, testing, and CI.

## What changed
- scaffolded the Next.js application and root project structure
- added `.gitignore`, package management, environment configuration, and local setup docs
- wired PostgreSQL and Drizzle for local and hosted environments
- added linting, unit tests, Playwright, and GitHub Actions CI
- added a simple responsive shell, health route, and storage configuration for future uploads

## Success criteria
- the app starts locally with documented setup steps
- CI runs linting, unit tests, and at least one Playwright smoke test
- the repository has a clean foundation for auth, entries, and uploads

## Out of scope
- real journal features
- LLM integration
- OCR and transcription flows
```

- **Prompt for GitHub Copilot:**

```text
Read plan.md, README.md, AGENTS.md, and .github/copilot-instructions.md first.

Create a new GitHub Issue for bootstrapping the NoemaForge app foundation, then create branch chore/app-bootstrap and implement only this PR. Scaffold a Next.js web app with:
- TypeScript and modern app routing
- PostgreSQL-ready configuration and Drizzle setup
- a `.gitignore` and environment-based config
- a simple mobile-friendly base layout and health route
- Vitest, Testing Library, Playwright, and GitHub Actions CI

Keep this PR foundational only. Do not add journal product features yet. Add or update tests and docs where appropriate.
```

### Roadmap item 3

- **Title:** `feat(journal): Add authenticated typed capture and journal history`
- **Branch:** `feat/typed-journal`
- **Goal:** ship the lowest-friction usable version of the product with typing as the backbone
- **PR body:**

```md
## Why
Typing is the core capture mode and the fastest path to a real private journaling product.

## What changed
- added authentication for a private personal journal
- added create, edit, and view flows for typed journal entries
- added a chronological journal history with basic full-text search
- added entry metadata such as timestamps and source type

## Success criteria
- a signed-in user can create and edit typed entries
- the journal history is usable on phone and laptop screen sizes
- entries can be searched by text without extra search infrastructure
- the new models and flows are covered by unit tests and Playwright coverage

## Out of scope
- voice capture
- handwriting OCR
- Ollama-powered prompts
```

- **Prompt for GitHub Copilot:**

```text
Read plan.md, README.md, AGENTS.md, and .github/copilot-instructions.md first.

Create a new GitHub Issue for the typed journal MVP, then create branch feat/typed-journal and implement only this PR. Add the first real product slice:
- authentication for a private journal
- create and edit flows for typed entries
- a journal history view ordered by time
- simple PostgreSQL-backed search over entry text

Keep the UX simple and mobile-friendly. Add tests for auth, entry CRUD, and search. Do not add voice, OCR, or LLM features in this PR.
```

### Roadmap item 4

- **Title:** `feat(capture): Add voice dictation and handwriting OCR ingestion`
- **Branch:** `feat/multimodal-capture`
- **Goal:** let non-typing capture modes feed the same journal without splitting the data model
- **PR body:**

```md
## Why
The product philosophy depends on low-friction capture across multiple modes, not just typing.

## What changed
- added voice upload or recording flow that becomes editable journal text
- added image upload flow for handwriting OCR
- stored source metadata so entries can be traced back to typed, voice, or OCR capture
- normalized multimodal capture into the same journal entry model and history view

## Success criteria
- a user can create a journal entry from voice input and from a handwritten note image
- extracted text can be reviewed and edited before final save
- all capture modes land in the same searchable journal archive
- upload, transcription, and OCR flows have automated test coverage where practical

## Out of scope
- advanced media management
- broad AI coaching
- offline-first sync
```

- **Prompt for GitHub Copilot:**

```text
Read plan.md, README.md, PHILOSOPHY.md, AGENTS.md, and .github/copilot-instructions.md first.

Create a new GitHub Issue for multimodal journal capture, then create branch feat/multimodal-capture and implement only this PR. Extend the typed journal app with:
- voice capture that becomes editable text
- handwriting image upload with OCR
- source metadata that keeps all entry types in one shared journal model

Prefer the simplest reliable implementation. Keep the review step explicit so the user can fix transcription or OCR mistakes before saving. Add tests and docs as needed.
```

### Roadmap item 5

- **Title:** `feat(reflection): Add guided distillation and narrow Ollama assistance`
- **Branch:** `feat/guided-reflection`
- **Goal:** turn the journal from a capture tool into a reflection tool without expanding into a broad chat app
- **PR body:**

```md
## Why
NoemaForge should help move the user from raw input to clarity, not just store notes.

## What changed
- added a guided reflection step after capture with fields for feeling, root issue, and next step
- added an optional Ollama-backed follow-up question and 2-3 next-step suggestions
- kept the journaling flow useful even when the Ollama service is unavailable
- expanded Playwright coverage across the core end-to-end journaling workflow

## Success criteria
- a user can turn a raw entry into a clearer reflection inside the app
- Ollama support remains narrow and optional rather than becoming a general assistant UI
- the main journaling workflow is covered by end-to-end tests
- the MVP is usable without requiring extra manual admin work after deployment

## Out of scope
- open-ended chat
- collaboration features
- complex analytics or sentiment dashboards
```

- **Prompt for GitHub Copilot:**

```text
Read plan.md, README.md, PHILOSOPHY.md, AGENTS.md, and .github/copilot-instructions.md first.

Create a new GitHub Issue for guided reflection and narrow Ollama assistance, then create branch feat/guided-reflection and implement only this PR. Add the reflection layer to the journal:
- structured fields or prompts for feeling, real issue, and next step
- an optional call to a separately hosted Ollama service
- exactly one follow-up question and 2-3 next-step suggestions when the model path is enabled
- Playwright coverage for the main journaling flow

Keep the implementation narrow. Do not turn this into a general-purpose AI chat interface.
```
