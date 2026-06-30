@AGENTS.md

## API Binding Project

### Rules (set by user — never violate)
1. Never change design, CSS, labels, or layout — if a field is missing from the API, leave it blank
2. Use `src/components/ui/Skeleton/Skeleton.js` exports for all loading states
3. Use `src/components/ui/NotFound/NotFound.js` for empty/error states
4. Use `src/components/ui/SafeImage/SafeImage.js` for every `<img>` that loads from API (handles 404 and null src)
5. Use `Promise.allSettled` for parallel API fetches — never let one failure crash the whole page
6. After each page section, stop and wait for user confirmation before the next page

### Stack (Vite + React SPA — NOT Next.js)
- **Build**: Vite 6, `npm run dev` / `npm run build` / `npm run preview`
- **Router**: React Router v7 (`react-router-dom`) — `<BrowserRouter>` in `src/App.jsx`
- **Entry**: `index.html` → `src/main.jsx` → `src/App.jsx`
- **Output**: `dist/index.html` (single shell). Deploy behind FastAPI using `fastapi_spa.py`
- **No Next.js** — no `next/`, no server components, no API routes, no `loading.js`
- **Env vars**: `import.meta.env.VITE_*` — set in `.env` (local dev) and `.env.local` (prod override)

### Core Patterns

**Auth** (`src/lib/session.js`):
- `getSession()` / `setSession(token)` / `clearSession()` — stores token in `localStorage` under `cp_session`
- `ProtectedLayout` in `App.jsx` guards dashboard routes

**API fetching** (`src/lib/api.js`):
- `apiFetch(path, opts?)` — reads `cp_session` from localStorage, sends Bearer token
- `buildQuery({ key: value })` — builds query string, skips null/undefined values
- Throws `ApiError` on non-2xx. Always wrap with `Promise.allSettled`.
- Base URL: `import.meta.env.VITE_API_BASE_URL`

**Page structure** (all client-side):
- Each page `page.js` is a `'use client'`-annotated component (annotation is legacy label, not functional)
- Initial data loaded in `useEffect` on mount; shows skeleton while loading
- `loading.js` files are imported as `<Loading />` while the `useEffect` awaits

**Navigation**:
- `import { Link } from 'react-router-dom'` — use `to=` prop (not `href=`)
- `import { useParams } from 'react-router-dom'` for `[id]` params
- `import { useLocation } from 'react-router-dom'` for current path

**Images**:
- `<SafeImage src={url} .../>` for API images (broken-image SVG on error)
- `<Image src={url} .../>` from `@/components/ui/Image/Image` as a drop-in for `next/image`

**Lazy loading / infinite scroll**:
- `src/hooks/useScrollEnd.js` — `useScrollEnd(onVisible, enabled)` returns a sentinel ref via `IntersectionObserver`
- `src/components/ui/ScrollLoader/ScrollLoader.js` — place as last child of the scroll container; shows bouncing-dots spinner while `loading=true`
- Activities, Criminals, Gangs all use this pattern
- Graphs/sidebar data stays fixed (no pagination)

### Progress
- [x] Login (`/login`)
- [x] Home page (`/`) — stats, news, map, top gangs, activities by type, recently added criminals
- [x] Activities list (`/activities`) — news list, all sidebar widgets, filters, infinite scroll pagination
- [x] Activity detail (`/activities/[id]`)
- [x] Criminals list (`/criminals`) — table, sidebar widgets, filters, infinite scroll pagination
- [x] Criminal detail (`/criminals/[id]`)
- [x] Gangs list (`/gangs`) — table, sidebar widgets, filters, client-side infinite scroll
- [x] Gang detail (`/gangs/[id]`)
- [ ] Heatmap (`/heatmap`)

### Known Gaps (API limitations)
- `/api/news/filter` only supports `location` + `page` — all other filters are client-side on loaded results
- No lat/lng in affiliation/criminal data; gang map markers are decorative
- `by-location` response lat/lng needed `breakdown=true` to include top_locations
- Criminal filter in news section has no backing data (news items don't contain criminal names)
- Gang/criminal images not in affiliation API — SafeImage shows broken-image placeholder
- Gangs list has no server-side pagination (all affiliations loaded in one call, client-side scroll only)
