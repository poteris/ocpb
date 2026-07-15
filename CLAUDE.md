# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Convo Coach ("ocpb") is a training app where trade-union organisers practise workplace
conversations against an LLM-driven persona, then receive scored feedback. A per-scenario
leaderboard ranks participants by their best score.

## Commands

Run everything from the repo root (a pnpm workspace with `frontend` and `backend` packages).

- `pnpm install` — install all workspace deps
- `pnpm db:start` — start local Supabase (Docker). Stop with `pnpm db:stop`.
- `pnpm db:reset` — reset local DB and re-run migrations. `pnpm db:reset:all` fully rebuilds (⚠️ erases data).
- `pnpm dev` — Next.js dev server (frontend only) with hot reload
- `pnpm build` — production build; `prebuild` runs `next lint` + `tsc --noEmit`, so a build fails on lint or type errors
- `pnpm lint` — ESLint (next config)
- `pnpm test` — Jest unit tests (jsdom). From `frontend/`: `pnpm test -- <path>` or `-t "<name>"` for a single test/pattern; `pnpm test:watch`.
- `pnpm test:ui` — Playwright E2E suite. Requires a running dev server. First-time setup: `pnpm exec playwright install --with-deps`.

### E2E environment expectations
Playwright specs read `E2E_TEST_BASE_URL` (e.g. `http://localhost:3000`) and expect `USE_MOCK_OPENAI=true`
in `.env`. Set `SKIP_LEADERBOARD_TESTS=true` to exclude the leaderboard specs (CI does this); they run
locally by default. `e2e/global-setup.ts` warms the dev server to avoid first-compile timeouts.

## Environment

`.env` lives at the **repo root** (not in `frontend/`). `frontend/next.config.js` loads it via
`dotenv` from `../.env` and re-exports the vars through `next.config`'s `env` block. Required:
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`. Optional:
`LLM_MODEL` (defaults to `gpt-4o`), `USE_MOCK_OPENAI`.

## Architecture

**Stack:** Next.js 15 App Router (React 18), TypeScript (strict), Supabase (Postgres) via
`@supabase/supabase-js`, OpenAI SDK, Jotai for client state, Zod for validation, Tailwind + Radix/shadcn UI,
Handlebars for prompt templating.

### Request → LLM flow
API routes live under `frontend/app/api/**/route.ts`. Server-only logic sits in
`frontend/src/lib/server/` (files marked `'use server'`):
- `db.ts` — all Supabase reads/writes (conversations, personas, prompts, feedback). This is the data layer; routes and services call into it rather than querying Supabase directly.
- `llm.ts` — `getAIResponse()` (chat completion) and `createBasePromptForMessage()` (compiles the DB-stored system prompt as a Handlebars template with persona/scenario fields).
- `services/` — feature logic: `chat/` (createNewChat, sendMessage), `feedback/`, `persona/`, `scenarios/`, `assertions/`, and `openai/`.

**All Supabase access uses the service-role client** in `frontend/app/api/service-init.ts`
(`supabaseService`). RLS was deliberately removed (see migrations); do not assume row-level auth —
tenant scoping is enforced in application code, not the database.

### OpenAI client abstraction
Never instantiate the OpenAI SDK directly. Go through `getOpenAIClient(headers)` in
`services/openai/OpenAIClientFactory.ts`, which returns an `AIClientInterface`:
- `USE_MOCK_OPENAI=true` → `MockOpenAIClient` (canned responses for `generate_persona`/`generate_feedback` tool calls; used in tests/E2E to avoid real API calls and cost)
- an `x-use-real-openai` request header forces the real client even when mocks are on
- otherwise → real `OpenAIClient`

Structured outputs (persona generation, feedback scoring) use OpenAI **function/tool calls** defined in
`frontend/src/utils/openaiTools.ts` with `tool_choice` forcing the function. The mock mirrors those tool shapes.

### Multi-tenancy
Organisations are resolved from the **request host/subdomain** via `frontend/src/lib/tenant.ts`
(`getTenantFromRequest` → org id, `'default'` fallback). Most DB queries filter on `organisation_id`.
When adding data access, thread the org id through — it is not derived automatically inside `db.ts`.

### Participants & leaderboard
There is no user login. A participant is an anonymous UUID + display name stored in `localStorage`
(`frontend/src/lib/participant.ts`). The `users` table mirrors this; display names are **unique per
organisation** (Postgres unique constraint → routes return **409** on clash, surfaced as
`ParticipantNameTakenError`). The `scenario_leaderboard` view ranks by best score, tie-broken by
earliest achievement, and inner-joins `users` (a missing users row is self-healed before starting a chat).

### App screens
Pages in `frontend/app/*/page.tsx` are thin wrappers around screen components in
`frontend/src/components/screens/`. Flow: Welcome (pick scenario) → ScenarioSetup (generate persona) →
Chat → Feedback (scored). Admin surfaces: `admin` (site), `organiser-admin`, `evals`. UI primitives in
`src/components/ui/` (shadcn); shared Jotai atoms in `src/store/index.ts`.

## Database

Migrations are in `backend/supabase/migrations/` (timestamped SQL, applied in order). The `deploy.yml`
GitHub Action applies them to the remote project on push to `main`/`develop` when `backend/**` changes.
To change the schema, add a new migration file — do not edit existing ones. Prompts (system + feedback)
are versioned **rows** in the DB (`system_prompts`, `feedback_prompts`); code fetches the latest id at
runtime rather than hardcoding prompt text.

## Conventions

- Path alias `@/` → `frontend/src/` (except `app/` which is `frontend/app/`).
- Validate all external input (request bodies, DB rows) with Zod schemas defined in `src/types/`.
- Server data-layer errors use the typed `DatabaseError` class (`src/utils/errors.ts`) with `.toLog()`.
