# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (port 5174)
pnpm build      # Production build
pnpm preview    # Preview production build
```

No test or lint scripts are configured.

## Architecture

This is a React + Supabase personal book collection tracker with a Japanese-language UI.

**Tech stack:** React 19, Vite 7, Tailwind CSS 4, Supabase (PostgreSQL + Auth + Storage)

**State management:** All state lives in `App.jsx`. No context or external state library. Data fetching runs in `useEffect` hooks triggered by auth state, tag filter, and page changes.

**Data layer (`src/libs/`):**
- `supabaseClient.js` — Supabase SDK singleton
- `bookUtil.js` — all book queries; calls Supabase RPC functions for paginated/filtered book lists with aggregated creator data
- `auth.js` — legacy auth helpers (partially superseded by inline React logic in App.jsx)

**Database schema (via Supabase):**
Core tables: `books`, `creators`, `book_creators` (many-to-many with roles), `tags`, `book_tags`, `publishers`, `formats`, `user_books`

Complex queries use PostgreSQL RPC functions (`get_books_with_aggregated`, `get_book_info`) defined in `src/sql/`. When modifying data-fetch logic, check these functions first — they perform creator name aggregation by role server-side.

**Deployment:** Multi-stage Docker build (Node.js builder → Nginx). Config in `Dockerfile` and `nginx-book_app.conf`.

**Supabase local dev:** Config in `supabase/config.toml`; migrations in `supabase/migrations/`; seed data in `supabase/seed.sql`.

## Key Patterns

- Tag filtering resets to page 1 and re-fetches books — both state changes happen together in the handler
- Book cover images are stored in Supabase Storage; URLs are constructed client-side
- Auth state is tracked via `supabase.auth.onAuthStateChange` listener in App.jsx
- Pagination: 5 items per page, total count returned by RPC function
