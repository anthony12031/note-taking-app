# Note-Taking App

**Status:** DESIGN_REVIEW
**Branch:** feature/note-taking-app
**Date:** 2026-03-29

---

## Requirements

### 1. Authentication
- **Sign Up**: email + password registration. Friendly heading "Yay, New Friend!" with a cow/cat illustration.
- **Login**: email + password login. Friendly heading "Yay, You're Back!" with a cactus illustration.
- Link to toggle between Sign Up ↔ Login ("We're already friends!" / "Oops! I've never been here before").
- Warm cream/beige background (`~#FFF5E6`).
- JWT-based authentication.

### 2. Dashboard (Home)
- **Left sidebar**: "All Categories" header, list of categories with colored dot indicator and note count.
- **Main area (notes grid)**: Responsive grid of note cards.
- **Empty state**: Bubble tea illustration with the message "I'm just here waiting for your charming notes..."
- **"+ New Note" button**: top-right corner, creates a new note.
- Each note card shows:
  - Date (relative: "today", "yesterday", or formatted date)
  - Category name
  - Note title (bold)
  - Content preview (truncated)
  - Background color matching the note's category

### 3. Note Editor (Full-Page)
- Occupies the full viewport.
- **Category dropdown** (top-left): shows current category with colored dot; dropdown lists all categories.
- **Close button** (X, top-right): returns to dashboard.
- **"Last Edited" timestamp** (top area, right-aligned): e.g. "Last Edited: July 31, 2024 at 8:30pm".
- **Title field**: large bold text, placeholder "Note Title".
- **Body field**: free-text area, placeholder "Pour your heart out..."
- **Background color** changes based on selected category.
- Auto-save behavior (save on close or debounced auto-save).

### 4. Categories
Pre-defined categories, each with a unique color:
| Category         | Dot / Card Color   |
|------------------|--------------------|
| Random Thoughts  | Orange / Peach     |
| School           | Yellow / Light Gold|
| Personal         | Sage / Olive Green |
| Drama            | Light Pink / Tan   |

Users select a category per note via a dropdown.

### 5. Visual Design
- Warm, friendly aesthetic with cream/beige backgrounds.
- Soft pastel card colors per category.
- Cute illustrations on auth pages and empty state.
- Rounded UI elements (buttons, cards, dropdowns).
- Font style: serif-like or warm sans-serif for headings.

---

## Acceptance Criteria

1. **Auth**: User can sign up, log in, and log out. Invalid credentials show error. Authenticated routes are protected.
2. **Dashboard**: After login, user sees their notes in a grid. Sidebar shows categories with accurate counts. Clicking a category filters notes. Empty state shows when no notes exist.
3. **Create Note**: Clicking "+ New Note" opens the full-page editor with default category. User can type title and body, select a category, and close to save.
4. **Edit Note**: Clicking a note card opens the editor pre-filled. Changes persist.
5. **Delete Note**: User can delete a note (from the editor or dashboard).
6. **Category Colors**: Note cards and editor backgrounds reflect the assigned category color.
7. **Responsive**: Works on MacBook Air-sized screens (≥1280px).
8. **Timestamps**: Notes show "Last Edited" datetime in the editor, and relative dates on cards.

---

## Design

### Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend["Next.js Frontend (port 3000)"]
        Pages["Pages"]
        Components["Components"]
        Store["State / Context"]
        API_Client["API Client (fetch)"]
        Pages --> Components
        Pages --> Store
        Store --> API_Client
    end

    subgraph Backend["Django REST Framework (port 8000)"]
        URLs["URL Router"]
        Views["API Views"]
        Serializers["Serializers"]
        Models["Models"]
        Auth["JWT Auth (SimpleJWT)"]
        URLs --> Views
        Views --> Serializers
        Views --> Auth
        Serializers --> Models
    end

    subgraph DB["SQLite (dev) / PostgreSQL (prod)"]
        Tables["User, Category, Note"]
    end

    API_Client -- "HTTP/JSON" --> URLs
    Models --> Tables
```

### Backend (Django REST Framework)

**Project structure:**
```
backend/
├── manage.py
├── requirements.txt
├── config/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/            # User auth app
│   ├── models.py        # (uses default User)
│   ├── serializers.py   # RegisterSerializer, LoginSerializer
│   ├── views.py         # RegisterView, LoginView
│   └── urls.py
└── notes/               # Notes + Categories app
    ├── models.py         # Category, Note
    ├── serializers.py    # CategorySerializer, NoteSerializer
    ├── views.py          # CategoryViewSet, NoteViewSet
    └── urls.py
```

**Models:**
- `Category`: id, name, color (hex string), created_at
- `Note`: id, user (FK→User), category (FK→Category), title, body, created_at, updated_at

**API Endpoints:**
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| POST   | /api/auth/register/    | Create account                 |
| POST   | /api/auth/login/       | Get JWT tokens                 |
| POST   | /api/auth/refresh/     | Refresh JWT token              |
| GET    | /api/categories/       | List categories (with counts)  |
| GET    | /api/notes/            | List user's notes              |
| POST   | /api/notes/            | Create note                    |
| GET    | /api/notes/:id/        | Get single note                |
| PUT    | /api/notes/:id/        | Update note                    |
| DELETE | /api/notes/:id/        | Delete note                    |

**Auth:** `djangorestframework-simplejwt` for access + refresh tokens. Notes are scoped to the authenticated user.

**Seeded data:** Categories are seeded via a migration: Random Thoughts (orange), School (yellow), Personal (sage green), Drama (tan/pink).

### Frontend (Next.js + React)

**Project structure:**
```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── public/
│   └── illustrations/    # SVG illustrations (cow, cactus, bubble tea)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Redirect → /login or /dashboard
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── notes/
│   │       └── [id]/page.tsx  # Note editor
│   ├── components/
│   │   ├── NoteCard.tsx
│   │   ├── CategorySidebar.tsx
│   │   ├── CategoryDropdown.tsx
│   │   ├── NoteEditor.tsx
│   │   ├── EmptyState.tsx
│   │   └── AuthForm.tsx
│   ├── lib/
│   │   ├── api.ts            # API client with JWT handling
│   │   ├── auth.tsx          # AuthContext provider
│   │   └── types.ts          # TypeScript interfaces
│   └── styles/
│       └── globals.css
```

**Tech choices:**
- **Next.js 14+ (App Router)** with TypeScript
- **Tailwind CSS** for styling
- **Context API** for auth state (lightweight, no Redux needed)
- Client-side data fetching with `fetch` (notes are user-specific, no SSR benefit)

**Key components:**
- `AuthForm`: Shared form for login/signup with illustration, heading, fields, and toggle link.
- `CategorySidebar`: Shows "All Categories" with colored dots and note counts. Clicking filters notes.
- `NoteCard`: Displays date, category, title, preview. Background color from category.
- `NoteEditor`: Full-page editor with category dropdown, title, body, timestamp, and colored background.
- `CategoryDropdown`: Dropdown selector showing categories with colored dots.
- `EmptyState`: Illustration + message when no notes exist.

**Category color mapping (Tailwind):**
| Category        | Card BG       | Dot Color     |
|-----------------|---------------|---------------|
| Random Thoughts | bg-[#F5D6C3]  | bg-[#E07C4F]  |
| School          | bg-[#E8DDB5]  | bg-[#C4B44E]  |
| Personal        | bg-[#C8D5B9]  | bg-[#7A9B5E]  |
| Drama           | bg-[#F0DCC8]  | bg-[#D4A574]  |

### Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant BE as Django API
    participant DB as Database

    U->>FE: Sign up / Log in
    FE->>BE: POST /api/auth/register or /login
    BE->>DB: Create/verify user
    BE-->>FE: JWT tokens
    FE->>FE: Store tokens, redirect to dashboard

    U->>FE: View dashboard
    FE->>BE: GET /api/categories/ + GET /api/notes/
    BE->>DB: Query categories, notes (filtered by user)
    BE-->>FE: JSON responses
    FE->>FE: Render sidebar + note grid

    U->>FE: Click "+ New Note"
    FE->>BE: POST /api/notes/ (default category)
    BE->>DB: Insert note
    BE-->>FE: New note object
    FE->>FE: Redirect to /notes/:id editor

    U->>FE: Edit note (title, body, category)
    FE->>BE: PUT /api/notes/:id/ (debounced)
    BE->>DB: Update note
    BE-->>FE: Updated note

    U->>FE: Close editor (X)
    FE->>FE: Navigate back to dashboard
```

### Key Decisions

1. **JWT over sessions**: Decoupled frontend/backend; tokens stored in localStorage with refresh rotation.
2. **SQLite for dev**: Zero config; easy to switch to PostgreSQL via env var.
3. **Pre-seeded categories**: Categories are not user-created; they're global and seeded via migration.
4. **Auto-save with debounce**: The editor saves automatically 1s after the user stops typing. No explicit "Save" button (matches the design).
5. **Client-side filtering**: Category filtering on the dashboard happens client-side (small dataset).

---

## Tasks

*To be filled in Phase 3.*

---

## Implementation Notes

*To be filled during Phase 4.*

---

## Review

*To be filled in Phase 5.*
