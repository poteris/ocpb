# Architecture

Convo Coach is a training tool for trade-union organisers. A participant picks a scenario, the app
generates an LLM persona to role-play against, they hold a conversation, and an LLM scores it. Scores
feed a per-scenario leaderboard. This document describes the system's intended *shape* — its boundaries
and the decisions that are expensive to reverse. For commands and day-to-day conventions, see `CLAUDE.md`.

## Shape at a glance

```
Browser (Next.js client components, Jotai state, localStorage identity)
   │  fetch
   ▼
app/api/**/route.ts      ← HTTP boundary: parse + Zod-validate, resolve tenant, map errors → status
   │
   ▼
src/lib/server/          ← 'use server' modules; the only code that talks to Supabase or OpenAI
   ├── services/*        ← feature logic (chat, feedback, persona, scenarios, assertions)
   ├── db.ts             ← data-access layer: every Supabase query lives here
   ├── llm.ts            ← prompt assembly + chat completion
   └── services/openai/  ← AIClientInterface: real vs mock client behind a factory
   │
   ├──────────────► Supabase (Postgres)   via service-role client
   └──────────────► OpenAI                via AIClientInterface
```

## Boundaries (the load-bearing ones)

### 1. HTTP layer is thin; server modules own the logic
`app/api/**/route.ts` handlers do four things and no more: read the body, validate it with a Zod schema
from `src/types/`, resolve the tenant from the request, and translate results/errors into HTTP status
codes. All real work is delegated to `src/lib/server/`. **Keep business logic out of route handlers** —
if a route grows a decision, that decision belongs in a service.

### 2. `db.ts` is the single data-access seam
Every Supabase query goes through `src/lib/server/db.ts` (or a `services/*` module that itself calls
`db.ts`). Routes and components never construct Supabase queries inline. This is what makes tenant
scoping, error typing, and schema changes tractable in one place. Adding a query means adding a function
here, not reaching for the client elsewhere.

### 3. OpenAI is always behind `AIClientInterface`
No module instantiates the OpenAI SDK directly. `services/openai/OpenAIClientFactory.getOpenAIClient()`
returns either the real `OpenAIClient` or the `MockOpenAIClient`, chosen by `USE_MOCK_OPENAI` (with an
`x-use-real-openai` header override). Because the mock and real clients implement the same interface —
including the shapes of the `generate_persona` and `generate_feedback` tool calls — tests and E2E runs
exercise the full flow with zero API cost. **The interface is the contract:** when you change a tool's
schema in `src/utils/openaiTools.ts`, update the mock to match, or the mocked path silently diverges.

## Key data-flows

### Conversation
`createNewChat` upserts the persona, resolves the latest system + feedback prompt ids, inserts a
`conversations` row, then seeds the first assistant turn. `sendMessage` rebuilds context each turn:
it fetches the persona/scenario/system-prompt for the conversation, compiles the system prompt as a
**Handlebars template** filled with persona and scenario fields (`llm.ts:createBasePromptForMessage`),
replays stored message history, and appends the new user turn. Conversation state is the message rows in
Postgres — there is no server-side session object.

### Scoring → leaderboard
Feedback is produced by a forced `generate_feedback` tool call and stored in the `feedback` table
(1–5 score + structured strengths/improvements). The **`scenario_leaderboard` view** derives the board:
one row per (scenario, user) at their best score, tie-broken by earliest achievement, joined to `users`.
The join is deliberately an inner join — legacy conversations that used throwaway per-conversation ids
are excluded because they have no `users` row. The leaderboard is a *projection of feedback*, not a
separately maintained table; nothing writes to it directly.

### Assertions / evals
`services/assertions` and the `evals` surfaces validate feedback *quality* (e.g. minimum content in
strengths/summary) rather than product behaviour. Treat this as an offline/QA lane, separate from the
participant-facing request path.

## Cross-cutting decisions

### No authentication; identity is a client-minted UUID
There is no login. A participant is a `uuid` generated in the browser and kept in `localStorage`
alongside a display name (`src/lib/participant.ts`), mirrored into the `users` table. Display names are
**unique per organisation** (Postgres unique constraint); the API returns **409** on a clash, surfaced
to the client as `ParticipantNameTakenError`. A missing `users` row is self-healed before a chat starts.
*Assumption that would break things if false:* the client UUID is stable and trustworthy — anyone who
clears storage or forges the id becomes a "new" or different participant. Acceptable for a training tool,
not for anything requiring real accountability.

### Service-role client + RLS removed
All server access uses the Supabase **service-role** client (`app/api/service-init.ts`). Row-Level
Security was intentionally dropped (see the `remove-rls` migration). Consequence: **the database enforces
no access control.** Every tenant boundary is enforced in application code by filtering on
`organisation_id`. Any new query that omits the org filter is a data-leak between tenants, not a caught
error.

### Multi-tenancy by host/subdomain
The organisation id is derived from the request host (`src/lib/tenant.ts`), defaulting to `'default'`.
Org id must be threaded explicitly into `db.ts` calls — it is not ambient. Branding and scenarios are
per-organisation.

### Prompts are versioned data, not code
System and feedback prompts live as rows in `system_prompts` / `feedback_prompts`. Code fetches the
latest id at runtime. Prompt changes are DB/migration changes (and editable via the admin surfaces),
not code deploys.

### Schema evolves only by migration
`backend/supabase/migrations/*` are append-only, timestamped, and applied in order; `deploy.yml` pushes
them to the remote on `main`/`develop`. Never edit an applied migration — add a new one. The DB schema
is the source of truth that `db.ts` and the Zod row schemas must agree with.

## Where things live

| Concern | Location |
| --- | --- |
| HTTP endpoints | `frontend/app/api/**/route.ts` |
| Server logic (data, LLM, services) | `frontend/src/lib/server/` |
| Type + validation schemas | `frontend/src/types/` |
| Screens (thin page wrappers → components) | `frontend/app/*/page.tsx`, `frontend/src/components/screens/` |
| Client state | `frontend/src/store/` (Jotai) |
| Schema & seed | `backend/supabase/migrations/` |

## If you're changing the shape

Propose edits to this file as a diff — do not rewrite it silently. A change is "shape-changing" if it
moves a boundary (e.g. logic into a route, a new direct Supabase caller, an OpenAI call outside the
factory), alters a cross-cutting decision (auth, RLS, tenancy, prompt storage), or changes how scores
become the leaderboard. Local changes within a boundary do not belong here.
