# Note-Taking App

A warm, friendly note-taking application with category-based organization, built with Django REST Framework and Next.js.

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend    | Django 5.1, Django REST Framework, SimpleJWT       |
| Database   | PostgreSQL 16                                      |
| Infra      | Docker Compose                                     |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (included with Docker Desktop)

That's it — everything runs in containers.

## Getting Started

1. **Clone the repo**

```bash
git clone <repo-url>
cd note-taking-app
```

2. **Create your environment file**

```bash
cp .env.example .env
```

Edit `.env` if you want to change defaults (database credentials, Django secret key, etc.).

3. **Start the stack**

```bash
docker compose up --build
```

This will:
- Pull/build all images (PostgreSQL, Django, Next.js)
- Start the database and wait for it to be healthy
- Run Django migrations automatically (including seeding the 4 default categories)
- Start the Django dev server on port 8000
- Start the Next.js dev server on port 3000

4. **Open the app**

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000       |
| Backend API | http://localhost:8000     |
| Django Admin | http://localhost:8000/admin |

5. **Create an account** — go to http://localhost:3000/signup, enter an email and password, and you're in.

## Stopping the App

```bash
docker compose down
```

To also remove the database volume (wipes all data):

```bash
docker compose down -v
```

## Project Structure

```
note-taking-app/
├── docker-compose.yml
├── .env / .env.example
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh        # Waits for DB, runs migrations
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/               # Django project settings
│   ├── accounts/             # Auth (register, login)
│   └── notes/                # Notes + Categories CRUD
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app/              # Next.js pages (login, signup, dashboard, notes/[id])
│   │   ├── components/       # React components
│   │   └── lib/              # API client, auth context, types, utilities
│   └── ...
└── designs/                  # Original UI mockups
```

## API Endpoints

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| POST   | `/api/auth/`          | Register (email + password)   |
| POST   | `/api/auth/login/`    | Login (returns JWT tokens)    |
| POST   | `/api/auth/refresh/`  | Refresh access token          |
| GET    | `/api/categories/`    | List categories + note counts |
| GET    | `/api/notes/`         | List current user's notes     |
| POST   | `/api/notes/`         | Create a note                 |
| GET    | `/api/notes/:id/`     | Get a single note             |
| PUT    | `/api/notes/:id/`     | Update a note                 |
| DELETE | `/api/notes/:id/`     | Delete a note                 |

## Development

Both backend and frontend support **hot-reload** inside Docker — edit files locally and see changes immediately.

To run frontend lint:

```bash
cd frontend && npx next lint
```

To run a TypeScript check:

```bash
cd frontend && npx tsc --noEmit
```

To open a Django shell inside the container:

```bash
docker compose exec backend python manage.py shell
```

---

## AI-Driven Development Workflow

This application was built entirely through an AI-driven, spec-first development workflow using Cursor's agent mode. No code was written manually — every file was generated, reviewed, and refined through structured collaboration between a human (providing requirements and approvals) and an AI coding agent (designing, implementing, and verifying).

### The Process

#### 1. Design Analysis

The process started with 5 UI mockup screenshots placed in the `designs/` folder. The AI agent analyzed every screenshot to extract:
- Page layouts (auth, dashboard, note editor)
- Component inventory (note cards, category sidebar, dropdowns, illustrations)
- Color palette and typography choices
- Interaction patterns (auto-save, category filtering, navigation flow)

#### 2. Spec-Driven Planning (Requirements → Design → Tasks)

Following a `/build-feature` workflow, the project went through three approval gates before any code was written:

**Phase 1 — Requirements**: The AI translated the visual designs into a structured requirements document with acceptance criteria. The human reviewed and approved.

**Phase 2 — Architecture Design**: The AI produced:
- A system architecture diagram (frontend ↔ backend ↔ database)
- Data flow sequence diagrams
- API endpoint contracts
- Database model definitions
- Frontend component tree and file structure
- Key technical decisions (JWT auth, auto-save strategy, category color mapping)

The human asked clarifying questions about Docker and database choice (PostgreSQL + full Docker Compose), and the design was updated before approval.

**Phase 3 — Task Breakdown**: Work was organized into dependency waves:

```
Wave A (parallel)  → Docker infra + Django scaffold + Next.js scaffold
Wave B (sequential) → Models → Auth API → Notes API
Wave C (parallel)   → Auth pages + Dashboard + Note editor
Wave D (sequential) → Integration wiring → Visual polish
```

Tasks were explicitly tagged with dependencies so independent work could be parallelized. The human approved the task plan.

#### 3. Parallel Implementation

With the approved spec as the source of truth, implementation used **parallel AI subagents**:

- **Backend agent**: Scaffolded the Django project, created models with migrations, built the auth API (register + JWT login), and implemented the notes/categories CRUD API — all in one pass.
- **Frontend agent**: Scaffolded Next.js with Tailwind, built the API client with JWT handling, created the auth context, implemented all page components (login, signup, dashboard, note editor), and generated SVG illustrations — all in one pass.

Both agents worked simultaneously on disjoint directories (`backend/` and `frontend/`), guided by the shared API contract from the spec.

#### 4. Integration and Verification

After both agents completed, the orchestrating agent:
- Reviewed all generated code for cross-boundary consistency (API URLs, request/response shapes, auth flow)
- Found and fixed a serializer issue where `NoteSerializer` returned category as a plain ID on write responses instead of a nested object (the frontend expected the full object)
- Built Docker images and brought up the full stack
- Verified end-to-end: database migrations, category seeding, user registration, JWT auth, note CRUD — all tested via `curl` against the running containers
- Ran ESLint and TypeScript checks (zero errors)

#### 5. Visual Polish Pass

A final pass compared the running UI against the original design mockups and refined:
- Auth pages simplified to match the flat, card-free design
- Dashboard header removed to match the minimal layout in the mockups
- Note card styling adjusted for better design fidelity
- Category sidebar refined with logout placement

#### 6. Bug Fix — New Note Ignores Selected Category

After manual testing, a bug was discovered: clicking "+ New Note" while filtering by a category (e.g., Personal) would always create the note under Drama instead of the selected category.

**Root cause**: The `onNewNote` callback in `dashboard/page.tsx` hardcoded `categories[0]?.id` as the category for new notes. The API returns categories sorted alphabetically by name, so Drama was always index 0. The `selectedCategoryId` state — which tracks the active sidebar filter — was never consulted.

**Fix**: One-line logic change — use `selectedCategoryId` when a specific category is active, fall back to `categories[0]` only when the filter is set to "all". The AI agent identified the root cause from the bug description alone (no reproduction needed) and applied the minimal fix.

This illustrates a common AI-generation gap: the generated code was locally correct (it picked a valid default category) but missed the **user intent** that creating a note while viewing a category should inherit that category. Human testing caught the mismatch.

### Key Observations

- **Spec as contract**: The detailed spec with API tables, model definitions, and component trees meant both subagents produced compatible code on the first try. The only integration fix needed was the serializer response shape.
- **Parallelization**: Backend and frontend were built simultaneously because the API contract was defined upfront. This cut wall-clock time roughly in half.
- **Approval gates prevented waste**: The human caught the missing Docker/PostgreSQL requirement during design review — before any code existed. Changing a spec line is cheaper than refactoring a codebase.
- **AI handles boilerplate well**: Django settings, JWT configuration, Tailwind setup, TypeScript types, Docker Compose — the agent produced correct, production-quality boilerplate without manual templating.
- **Human judgment still matters**: The choice of PostgreSQL over SQLite, full Docker Compose over native, and design taste calls (flat auth layout vs. card wrapper) all came from human direction.
