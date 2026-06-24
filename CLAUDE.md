@AGENTS.md

## API Binding Project

### Rules (set by user — never violate)
1. Never change design, CSS, labels, or layout — if a field is missing from the API, leave it blank
2. Use `src/components/ui/Skeleton/Skeleton.js` exports for all loading states
3. Use `src/components/ui/NotFound/NotFound.js` for empty/error states
4. Use `src/components/ui/SafeImage/SafeImage.js` for every `<img>` that loads from API (handles 404 and null src)
5. Use `Promise.allSettled` for parallel API fetches — never let one failure crash the whole page
6. After each page section, stop and wait for user confirmation before the next page

### Core Patterns

**Server fetching** (`src/lib/api.js`):
- `apiFetch(path, opts?)` — reads `cp_session` httpOnly cookie, sends Bearer token
- `buildQuery({ key: value })` — builds query string, skips null/undefined values
- Throws `ApiError` on non-2xx. Always wrap with `Promise.allSettled`.

**Page structure**:
- `page.js` → `async` server component, fetches all data, passes serializable props down
- Interactive parts → separate `'use client'` component accepting those props
- `loading.js` at route level → shows skeleton while page.js awaits

**Client-side pagination** (when server can't filter):
- Load page 1 server-side; "See More" fetches next pages via `/api/news-proxy` Route Handler
- Route Handlers in `src/app/api/` can use `apiFetch` because they also run server-side

**Images**: Always `<SafeImage src={url} .../>` — shows broken-image SVG on error or null src

**Auth**: Login at `POST /auth/login`. Token stored in `cp_session` httpOnly cookie (7-day TTL). The `.env.local` has `API_BASE_URL=https://crimepanel.live`.

### Progress
- [x] Login (`/login`)
- [x] Home page (`/`) — stats, news, map, top gangs, activities by type, recently added criminals
- [x] Activities list (`/activities`) — news list, all sidebar widgets, filters, pagination
- [x] Activity detail (`/activities/[id]`)
- [x] Criminals list (`/criminals`)
- [x] Criminal detail (`/criminals/[id]`)
- [x] Gangs list (`/gangs`)
- [x] Gang detail (`/gangs/[id]`)
- [ ] Heatmap (`/heatmap`)

### Known Gaps (API limitations)
- `/api/news/filter` only supports `location` + `page` — all other filters are client-side on loaded results
- No lat/lng in affiliation/criminal data; gang map markers are decorative
- `by-location` response lat/lng needed `breakdown=true` to include top_locations
- Criminal filter in news section has no backing data (news items don't contain criminal names)
- Gang/criminal images not in affiliation API — SafeImage shows broken-image placeholder
