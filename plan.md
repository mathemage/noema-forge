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

Use the shared PR template and shared Copilot prompt in the final section for every roadmap item.

### Roadmap item 1

- **Title:** `docs(product): Define NoemaForge MVP roadmap`
- **Branch:** `docs/mvp-roadmap-8`
- **Status:** Completed by the PR that closes issue #8
- **Goal:** lock the product shape, technical direction, and staged PR plan before app scaffolding starts
- **Why:** the repository needed an explicit MVP roadmap that turns the philosophy into reviewable implementation slices
- **Key changes:**
  - add `plan.md`
  - define the recommended stack and MVP assumptions
  - translate the product philosophy into a five-item roadmap
- **Success criteria:**
  - the repository has a dedicated roadmap document
  - the roadmap has no more than five implementation items
  - each roadmap item is scoped as a reviewable PR slice
- **Out of scope:**
  - application code
  - deployment configuration

### Roadmap item 2

- **Title:** `chore(app): Bootstrap the web app, tooling, and CI`
- **Branch:** `chore/app-bootstrap`
- **Goal:** create the project skeleton that future feature PRs can build on
- **Why:** before shipping journal features, the project needs a clean app scaffold, environment handling, testing, and CI
- **Key changes:**
  - scaffold the Next.js application and root project structure
  - review/update `.gitignore`, package management, environment configuration, and local setup docs
  - wire PostgreSQL and Drizzle for local and hosted environments
  - add linting, unit tests, Playwright, and GitHub Actions CI
  - add a simple responsive shell, health route, and storage configuration for future uploads
- **Success criteria:**
  - the app starts locally with documented setup steps
  - CI runs linting, unit tests, and at least one Playwright smoke test
  - the repository has a clean foundation for auth, entries, and uploads
- **Out of scope:**
  - real journal features
  - LLM integration
  - OCR and transcription flows

### Roadmap item 3

- **Title:** `feat(journal): Add authenticated typed capture and journal history`
- **Branch:** `feat/typed-journal`
- **Goal:** ship the lowest-friction usable version of the product with typing as the backbone
- **Why:** typing is the core capture mode and the fastest path to a real private journaling product
- **Key changes:**
  - add authentication for a private personal journal
  - add create, edit, and view flows for typed journal entries
  - add a chronological journal history with basic full-text search
  - add entry metadata such as timestamps and source type
- **Success criteria:**
  - a signed-in user can create and edit typed entries
  - the journal history is usable on phone and laptop screen sizes
  - entries can be searched by text without extra search infrastructure
  - the new models and flows are covered by unit tests and Playwright coverage
- **Out of scope:**
  - voice capture
  - handwriting OCR
  - Ollama-powered prompts

### Roadmap item 4

- **Title:** `feat(capture): Add voice dictation and handwriting OCR ingestion`
- **Branch:** `feat/multimodal-capture`
- **Goal:** let non-typing capture modes feed the same journal without splitting the data model
- **Why:** the product philosophy depends on low-friction capture across multiple modes, not just typing
- **Key changes:**
  - add voice upload or recording flow that becomes editable journal text
  - add image upload flow for handwriting OCR
  - store source metadata so entries can be traced back to typed, voice, or OCR capture
  - normalize multimodal capture into the same journal entry model and history view
- **Success criteria:**
  - a user can create a journal entry from voice input and from a handwritten note image
  - extracted text can be reviewed and edited before final save
  - all capture modes land in the same searchable journal archive
  - upload, transcription, and OCR flows have automated test coverage where practical
- **Out of scope:**
  - advanced media management
  - broad AI coaching
  - offline-first sync

### Roadmap item 5

- **Title:** `feat(reflection): Add guided distillation and narrow Ollama assistance`
- **Branch:** `feat/guided-reflection`
- **Goal:** turn the journal from a capture tool into a reflection tool without expanding into a broad chat app
- **Why:** NoemaForge should help move the user from raw input to clarity, not just store notes
- **Key changes:**
  - add a guided reflection step after capture with fields for feeling, root issue, and next step
  - add an optional Ollama-backed follow-up question and 2-3 next-step suggestions
  - keep the journaling flow useful even when the Ollama service is unavailable
  - expand Playwright coverage across the core end-to-end journaling workflow
- **Success criteria:**
  - a user can turn a raw entry into a clearer reflection inside the app
  - Ollama support remains narrow and optional rather than becoming a general assistant UI
  - the main journaling workflow is covered by end-to-end tests
  - the MVP is usable without requiring extra manual admin work after deployment
- **Out of scope:**
  - open-ended chat
  - collaboration features
  - complex analytics or sentiment dashboards

## Shared templates

### Shared PR template

Use this structure when opening a PR for any roadmap item. Fill it with that item's `Why`, `Key changes`, `Success criteria`, and `Out of scope` bullets.

```md
## Why
<why from the roadmap item>

## What changed
- <key change 1>
- <key change 2>
- <key change 3>

## Success criteria
- <criterion 1>
- <criterion 2>
- <criterion 3>

## Out of scope
- <out-of-scope item 1>
- <out-of-scope item 2>
```

### Shared Copilot prompt

Use the roadmap item as the source of truth for scope. For already-started work, use the exact branch shown in that roadmap item.

```text
Read plan.md, README.md, and AGENTS.md first. `.github/copilot-instructions.md` mirrors AGENTS.md. Read PHILOSOPHY.md too when the roadmap item changes product behavior rather than only scaffolding.

Create a new GitHub Issue for <roadmap item title>, then create the branch named in that roadmap item and implement only that PR.

Use the roadmap item's Goal, Why, Key changes, Success criteria, and Out of scope bullets as the source of truth.
Keep the PR narrow, add tests that satisfy the item's success criteria, use a scoped commit message with the issue number, and open a draft PR with the shared PR template.
```
