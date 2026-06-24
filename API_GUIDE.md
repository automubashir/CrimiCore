# Crime Panel API — Frontend Binding Guide

Base URL: `http://localhost:8000`
All endpoints except `POST /auth/login` require a JWT Bearer token.

```
Authorization: Bearer <access_token>
```

Tokens expire after 24 hours (86400 seconds). Re-login to get a new one.

---

## 1. Authentication

### POST /auth/login

Request body:

```json
{ "username": "admin", "password": "admin123" }
```

Response `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

Response `401` (wrong credentials):

```json
{ "detail": "Invalid username or password" }
```

```js
async function login(username, password) {
  const res = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  const { access_token, expires_in } = await res.json();
  localStorage.setItem('token', access_token);
  return access_token;
}
```

### GET /auth/me

Returns the logged-in user's profile. Useful for showing "Welcome, {name}" in the header.

Response `200`:

```json
{
  "username": "admin",
  "role": "admin",
  "full_name": "Administrator",
  "email": "admin@example.com"
}
```

### Reusable fetch wrapper

Bind this once and use it for every call below.

```js
const BASE_URL = 'http://localhost:8000';

async function api(path, params = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (res.status === 401) {
    // token expired — redirect to login
    window.location.href = '/login';
    return;
  }
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

---

## 2. Universal Filters (Analytics + Criminal Search)

These parameters work the same way across `/api/criminals/filter` and every `/api/analytics/*` route. Every one is optional — combine as many as you need.

| Param | Type | Match type | Example |
|---|---|---|---|
| `from_date` | string (ISO date) | range `gte` | `2022-01-01` |
| `to_date` | string (ISO date) | range `lte` | `2024-12-31` |
| `location` | string | partial / alias | `pakistan`, `usa`, `uae`, `uk` |
| `country` | string | partial / alias | `hong kong` |
| `crime_type` | string | partial (contains) | `murder` matches `"murder, fraud"` |
| `affiliation` | string | partial (contains) | `cartel` |
| `threat_level` | `high` \| `medium` \| `low` | exact (case-insensitive) | `high` |
| `breakdown` | boolean | — | `true` adds sub-breakdowns to each bucket |

**Location aliases** — these shortcodes expand automatically:

| Alias | Expands to |
|---|---|
| `usa` | usa, united states |
| `uae` | uae, united arab emirates, abu dhabi, dubai, sharjah, ajman, umm al quwain, ras al khaimah, fujairah |
| `uk` | uk, united kingdom, england, scotland, wales, northern ireland, britain, great britain |

**Invalid `threat_level`** returns `400`:
```json
{ "detail": "threat_level must be one of ['high', 'low', 'medium']" }
```

---

## 3. News Endpoints

### GET /api/news/filter

Articles linked to at least one criminal, newest first.

| Param | Type | Required | Notes |
|---|---|---|---|
| `location` | string | no | Filters on article `country`, supports aliases |
| `page` | integer | no | Default `1`, 100 results per page |

```js
const data = await api('/api/news/filter', { location: 'nigeria', page: 1 });
```

Response `200`:

```json
{
  "all_news": [
    {
      "news": {
        "country": "Nigeria",
        "source": "www.india.com",
        "type": "news",
        "thumbnail": "https://static.india.com/wp-content/uploads/2016/08/proxy-211.jpg",
        "title": "ISIS announces new Boko Haram leader",
        "link": "https://www.india.com/news/world/isis-announces-new-boko-haram-leader-1381736/",
        "published_date": "2016-08-04T02:12:24.000Z",
        "published_by": null,
        "description": "Nigeria's Boko Haram Islamic extremists have a new leader...",
        "affiliation": "islamic state",
        "crimeType": "Kidnapping, Homicide",
        "news_link": "https://www.india.com/news/world/isis-announces-new-boko-haram-leader-1381736/"
      },
      "criminal_count": 3
    }
  ]
}
```

**Bind to UI:** `all_news[].news.title`, `.thumbnail`, `.published_date`, `.description` for a news card list. `criminal_count` can render a badge ("Linked to 3 criminals").

---

### GET /api/news

Single article + other articles in the same `group_id` cluster.

| Param | Type | Required |
|---|---|---|
| `news_link` | string (URL) | **yes** |

```js
const data = await api('/api/news', {
  news_link: 'https://www.india.com/news/world/isis-announces-new-boko-haram-leader-1381736/'
});
```

Response `200`:

```json
{
  "news": {
    "country": "Nigeria",
    "title": "ISIS announces new Boko Haram leader",
    "description": "Full article text...",
    "published_date": "2016-08-04T02:12:24.000Z",
    "source": "www.india.com",
    "thumbnail": "https://...",
    "group_id": 4,
    "affiliation": "islamic state",
    "crimeType": "Kidnapping, Homicide"
  },
  "similar_news": [
    { "title": "Boko Haram leadership shift confirmed", "published_date": "2016-08-05T..." }
  ]
}
```

`404` if the article doesn't exist:
```json
{ "detail": "News not found" }
```

**Bind to UI:** article detail page. `similar_news` populates a "Related articles" sidebar.

---

## 4. Criminal Endpoints

### GET /api/criminals/filter

Multi-field criminal search. This is the main endpoint for a filterable criminal directory/table.

| Param | Type | Required | Match type |
|---|---|---|---|
| `criminal_name` | string | no | partial |
| `crime_type` | string | no | partial |
| `affiliation` | string | no | partial |
| `location` | string | no | partial / alias |
| `country` | string | no | partial / alias |
| `source` | string | no | exact |
| `threat_level` | high\|medium\|low | no | exact |
| `page` | integer | no | default 1 |

```js
const data = await api('/api/criminals/filter', {
  location: 'pakistan',
  crime_type: 'murder',
  threat_level: 'high',
  page: 1
});
```

Response `200`:

```json
{
  "total": 47,
  "all_criminal": [
    {
      "criminalName": "leung kwok-chung",
      "affiliation": "sun yee on",
      "crimeType": "Homicide",
      "location": "hong kong, kowloon",
      "country": "Hong Kong",
      "threat_level": "High",
      "imageUrl": "https://crimepanel.live/interpol_images/Lee-Tai-lung-1-696x552.jpg",
      "image_source": "not_found",
      "title": "triad murder: defense alleges turncoat lying",
      "publishedDate": "2011-01-18T00:00:00.000Z",
      "incidentDate": "2009-08-01T00:00:00.000Z",
      "source": null,
      "links": [
        "https://www.chinadaily.com.cn/hkedition/2011-01/18/content_11870105.htm",
        "https://www.chinadaily.com.cn/hkedition/2011-01/13/content_11841639.htm"
      ]
    }
  ],
  "all_news": [
    {
      "news": { "title": "Triad murder trial begins...", "published_date": "2011-01-18...", "country": "Hong Kong" },
      "criminal_count": 1
    }
  ]
}
```

**Important:** `criminal_name`, `crime_type`, and `affiliation` are **comma-separated strings in the data** (e.g. `"Kidnapping, Homicide"`). Searching `crime_type=murder` matches any record containing "murder" anywhere in that field — it does not require an exact full match. When rendering `crimeType` in a table cell, consider splitting on comma and showing as multiple tags/chips.

```js
function crimeTypeTags(crimeType) {
  return crimeType ? crimeType.split(',').map(s => s.trim()) : [];
}
```

**Empty results return `200`, not `404`:**
```json
{ "total": 0, "all_criminal": [], "all_news": [] }
```

**Bind to UI:** a paginated table/grid with `criminalName`, `imageUrl` (avatar), `threat_level` (colored badge: red/orange/green), `crimeType` (tag list), `location`, and `links` (external "Source" buttons).

---

### GET /api/criminals/{field}

Shorthand single-field filter.

Valid `{field}` values: `criminal_name`, `crime_type`, `affiliation`, `location`, `country`, `source`, `threat_level`.

| Param | Type | Required |
|---|---|---|
| `value` | string | **yes** |
| `page` | integer | no |

```js
// All high-threat criminals
const data = await api('/api/criminals/threat_level', { value: 'high' });

// All criminals affiliated with a specific organization
const data2 = await api('/api/criminals/affiliation', { value: 'sun yee on' });
```

Response shape is identical to `/api/criminals/filter` above.

`400` for an invalid field name:
```json
{ "detail": "Invalid field 'bad_field'. Valid: ['criminal_name', 'crime_type', 'affiliation', 'location', 'country', 'source', 'threat_level']" }
```

**Bind to UI:** use this for single-click filter chips, e.g. clicking an affiliation tag elsewhere in the UI to jump to all criminals with that affiliation.

---

### GET /api/affiliations

All organizations/affiliations with criminal counts — good for a sidebar filter list or an "Organizations" overview page.

| Param | Type | Required | Default |
|---|---|---|---|
| `location` | string | no | `"all"` |

```js
const data = await api('/api/affiliations', { location: 'all' });
```

Response `200` (sorted by `unique_criminal_count` descending):

```json
{
  "selected_location": "all",
  "total_affiliations": 128,
  "data": [
    {
      "affiliation": "sun yee on",
      "unique_criminal_count": 43,
      "doc_count": 67,
      "top_location": "hong kong, kowloon"
    }
  ]
}
```

`unique_criminal_count` is the number of distinct criminals — use this for display. `doc_count` is the raw record count (can include duplicates) — useful for debugging only.

---

## 5. Analytics Endpoints

All routes below accept the [Universal Filters](#2-universal-filters-analytics--criminal-search). Examples show the most common combinations.

### GET /api/analytics/overview

Dashboard summary — call this once when the dashboard loads.

```js
const stats = await api('/api/analytics/overview');
// Filtered example:
const filtered = await api('/api/analytics/overview', {
  threat_level: 'high', location: 'pakistan', from_date: '2022-01-01'
});
```

Response `200`:

```json
{
  "total_criminals": 1842, // known criminals, active watch list
  "total_crime_types": 34,
  "total_affiliations": 128, // total gangs
  "total_locations": 67,
  "total_articles": 9420, // total activities
  "total_article_sources": 312,
  "articles_with_criminals": 4100,
  "by_threat_level": [
    { "threat_level": "high", "count": 450 }, // high threat alert
    { "threat_level": "medium", "count": 820 },
    { "threat_level": "low", "count": 572 }
  ],
  "date_range": {
    "earliest": "2008-01-15T00:00:00.000Z",
    "latest": "2024-11-30T00:00:00.000Z"
  }
}
```

**Bind to UI:** 6–8 stat cards across the top of the dashboard, plus a small pie/donut chart from `by_threat_level`.

---

### GET /api/analytics/by-threat-level

Always returns exactly High → Medium → Low, in that order.

| Param | Type | Default |
|---|---|---|
| `breakdown` | boolean | `false` |

```js
const data = await api('/api/analytics/by-threat-level', { breakdown: true });
```

Response `200` with `breakdown=true`:

```json
{
  "total": 3,
  "data": [
    {
      "threat_level": "high",
      "criminal_count": 450,
      "doc_count": 620,
      "top_crime_types":  [{ "crime_type": "Homicide", "count": 180 }],
      "top_locations":    [{ "location": "pakistan", "count": 120 }],
      "top_affiliations": [{ "affiliation": "taliban", "count": 95 }]
    },
    { "threat_level": "medium", "criminal_count": 820, "doc_count": 1100, "top_crime_types": [] },
    { "threat_level": "low",    "criminal_count": 572, "doc_count": 690,  "top_crime_types": [] }
  ]
}
```

**Bind to UI:** a 3-bar horizontal chart (red/orange/green) or 3 stat tiles. With `breakdown=true`, clicking a tile can expand to show the top crime types/locations/affiliations for that level.

---

### GET /api/analytics/by-crime-type

| Param | Type | Default |
|---|---|---|
| `breakdown` | boolean | `false` |
| `size` | integer | `50` |

```js
const data = await api('/api/analytics/by-crime-type', { breakdown: true, size: 10 });
```

Response `200`:

```json
{
  "total": 10,
  "data": [
    {
      "crime_type": "Homicide",
      "criminal_count": 342,
      "doc_count": 480,
      "top_locations":    [{ "location": "pakistan", "count": 90 }],
      "top_affiliations": [{ "affiliation": "taliban", "count": 55 }],
      "by_threat_level":  [{ "threat_level": "high", "count": 180 }]
    }
  ]
}
```

**Bind to UI:** bar chart of `crime_type` vs `criminal_count`. Good candidate for a "Top Crime Types" widget.

---

### GET /api/analytics/by-location

| Param | Type | Default |
|---|---|---|
| `breakdown` | boolean | `false` |
| `size` | integer | `100` |

```js
const data = await api('/api/analytics/by-location', { breakdown: true });
```

Response `200`:

```json
{
  "total": 67,
  "data": [
    {
      "location": "hong kong, kowloon",
      "lat": "32.32",
      "lng" "73.32",
      "criminal_count": 120,
      "affiliation_count": 8,
      "doc_count": 165,
      "top_crime_types": [{ "crime_type": "Homicide", "count": 60 }],
      "by_threat_level": [{ "threat_level": "high", "count": 45 }]
    }
  ]
}
```

**Bind to UI:** geographic heatmap/choropleth (if you have lat/lng or country codes), or a ranked table of locations.

---

### GET /api/analytics/by-affiliation

| Param | Type | Default |
|---|---|---|
| `breakdown` | boolean | `false` |
| `size` | integer | `100` |

```js
const data = await api('/api/analytics/by-affiliation', { breakdown: true, threat_level: 'high' });
```

Response `200`:

```json
{
  "total": 128,
  "data": [
    {
      "affiliation": "sun yee on",
      "criminal_count": 43,
      "location_spread": 5,
      "doc_count": 67,
      "top_crime_types": [{ "crime_type": "Homicide", "count": 28 }],
      "top_locations":   [{ "location": "hong kong", "count": 32 }],
      "by_threat_level": [{ "threat_level": "high", "count": 20 }]
    }
  ]
}
```

`location_spread` = number of distinct locations this affiliation operates in — useful for a "geographic reach" indicator.

---

### GET /api/analytics/timeline

Criminal activity bucketed over time.

| Param | Type | Default | Notes |
|---|---|---|---|
| `interval` | `year`\|`quarter`\|`month`\|`week`\|`day` | `month` | Invalid value → `400` |

```js
const data = await api('/api/analytics/timeline', {
  interval: 'month', from_date: '2022-01-01', threat_level: 'high'
});
```

Response `200`:

```json
{
  "interval": "month",
  "filters": { "location": null, "country": null, "crime_type": null, "affiliation": null, "threat_level": "high" },
  "data": [
    {
      "date": "2022-01-01T00:00:00.000Z",
      "criminal_count": 18,
      "doc_count": 24,
      "top_crime_types": [{ "crime_type": "Homicide", "count": 10 }],
      "by_threat_level": [{ "threat_level": "high", "count": 24 }],
      "top_locations":   [{ "location": "pakistan", "count": 8 }]
    }
  ]
}
```

**Bind to UI:** line/area chart with `date` on the x-axis and `criminal_count` on the y-axis. This is the standard "trend over time" chart.

```js
const chartData = data.data.map(d => ({ x: new Date(d.date), y: d.criminal_count }));
```

---

### GET /api/analytics/news-timeline

Article publication volume over time.

| Param | Type | Default |
|---|---|---|
| `interval` | year\|quarter\|month\|week\|day | `month` |
| `country` | string | — |
| `source` | string | — (exact match) |

```js
const data = await api('/api/analytics/news-timeline', { interval: 'month', country: 'nigeria' });
```

Response `200`:

```json
{
  "interval": "month",
  "data": [
    {
      "date": "2016-08-01T00:00:00.000Z",
      "article_count": 34,
      "top_sources":   [{ "source": "www.india.com", "count": 12 }],
      "top_countries": [{ "country": "Nigeria", "count": 22 }]
    }
  ]
}
```

**Bind to UI:** overlay this on the criminal timeline chart as a second series — useful for spotting media coverage spikes vs actual criminal activity spikes.

---

### GET /api/analytics/by-source

Ranks news sources by article volume and criminal coverage.

| Param | Type | Default |
|---|---|---|
| `threat_level` | high\|medium\|low | — |
| `size` | integer | `50` |

```js
const data = await api('/api/analytics/by-source', { size: 20 });
```

Response `200` (sorted by `article_count` descending):

```json
{
  "total": 20,
  "data": [
    { "source": "www.dawn.com", "article_count": 1240, "criminal_count": 89, "criminal_docs": 143 }
  ]
}
```

**Bind to UI:** "Top Sources" leaderboard table.

---

### GET /api/analytics/co-occurrence

Everything associated with one specific criminal — affiliations, crime types, locations, sources, threat level, and active date range. Ideal for a criminal's detail/profile page or relationship graph.

| Param | Type | Required | Default |
|---|---|---|---|
| `criminal_name` | string | **yes** | — |
| `size` | integer | no | `20` |

```js
const data = await api('/api/analytics/co-occurrence', { criminal_name: 'leung kwok-chung' });
```

Response `200`:

```json
{
  "criminal_name": "leung kwok-chung",
  "affiliations":    [{ "value": "sun yee on", "count": 5 }],
  "crime_types":      [{ "value": "Homicide", "count": 3 }],
  "locations":        [{ "value": "hong kong", "count": 5 }],
  "sources":          [{ "value": "chinadaily", "count": 2 }],
  "by_threat_level":  [{ "threat_level": "high", "count": 5 }],
  "active_since": "2009-08-01T00:00:00.000Z",
  "last_seen":    "2011-01-18T00:00:00.000Z"
}
```

422 if `criminal_name` is missing (FastAPI auto-validation).

**Bind to UI:** criminal profile page — render `affiliations`/`crime_types`/`locations` as tag clouds, and `active_since`/`last_seen` as a "first seen / last seen" date range. This data also feeds well into a force-directed relationship graph (criminal node connected to affiliation/location/crime-type nodes).

---

### GET /api/analytics/top-criminals

Criminals ranked by news coverage volume (link count).

| Param | Type | Default |
|---|---|---|
| `size` | integer | `20` |

Plus all universal filters.

```js
const data = await api('/api/analytics/top-criminals', {
  threat_level: 'high', country: 'hong kong', size: 10
});
```

Response `200` (sorted by `news_link_count` descending):

```json
{
  "total": 10,
  "data": [
    {
      "criminal_name": "leung kwok-chung",
      "news_link_count": 12,
      "crime_type": "Homicide",
      "affiliation": "sun yee on",
      "location": "hong kong, kowloon",
      "country": "Hong Kong",
      "threat_level": "High",
      "incident_date": "2009-08-01T00:00:00.000Z",
      "image_url": "https://crimepanel.live/interpol_images/Lee-Tai-lung-1-696x552.jpg"
    }
  ]
}
```

**Bind to UI:** "Most Covered Criminals" leaderboard with avatar (`image_url`), name, and a news-count badge.

---

### GET /api/analytics/heatmap

Location × crime-type matrix, pre-shaped for direct heatmap rendering.

| Param | Type | Default |
|---|---|---|
| `location_size` | integer | `20` |
| `crime_type_size` | integer | `20` |

Plus `crime_type`, `affiliation`, `threat_level`, `from_date`, `to_date` filters.

```js
const data = await api('/api/analytics/heatmap', {
  location_size: 10, crime_type_size: 8, threat_level: 'high'
});
```

Response `200`:

```json
{
  "crime_types": ["Fraud", "Homicide", "Kidnapping", "Smuggling"],
  "matrix": [
    { "location": "hong kong, kowloon", "values": [12, 45, 8, 20] },
    { "location": "karachi, pakistan",  "values": [5, 30, 18, 11] }
  ]
}
```

`crime_types` is the column header array. Each `matrix` row's `values` array is positionally aligned to `crime_types` — `values[0]` corresponds to `crime_types[0]`, and so on.

```js
const { crime_types, matrix } = await api('/api/analytics/heatmap');

matrix.forEach(row => {
  crime_types.forEach((ct, i) => {
    const value = row.values[i];
    // render cell at (row.location, ct) = value
  });
});
```

**Bind to UI:** a grid/heatmap component (e.g. nivo `ResponsiveHeatMap`, or a custom CSS grid) — rows = locations, columns = crime types, cell color intensity = value.

---

## 6. Error Reference

| Status | Meaning | When it happens |
|---|---|---|
| `200` | Success | — |
| `400` | Bad request | Invalid `threat_level`, invalid `interval`, invalid `{field}` in `/api/criminals/{field}` |
| `401` | Unauthorized | Missing, malformed, or expired token |
| `404` | Not found | `/api/news` with unknown `news_link` |
| `422` | Validation error | Missing required query param (e.g. `criminal_name`, `news_link`) |
| `500` | Server error | Unexpected exception — check server logs |
| `503` | Elasticsearch down | ES connection failure |

All errors follow the same shape:

```json
{ "detail": "Human-readable message" }
```

```js
try {
  const data = await api('/api/criminals/filter', { threat_level: 'extreme' });
} catch (err) {
  console.error(err.message); // "threat_level must be one of ['high', 'low', 'medium']"
}
```

---

## 7. Field Reference — Criminal Object

| Field | Type | Notes |
|---|---|---|
| `criminalName` | string | Display name |
| `affiliation` | string | May be comma-separated |
| `crimeType` | string | May be comma-separated — split on `,` for tags |
| `location` | string | Often `"city, country"` format |
| `country` | string | |
| `threat_level` | string | `"High"` \| `"Medium"` \| `"Low"` (case varies in raw data — normalize client-side) |
| `imageUrl` | string \| null | Mugshot/photo URL |
| `image_source` | string | e.g. `"not_found"` if no real photo available |
| `title` | string | Headline of the primary article about this person |
| `publishedDate` | ISO date string | When the record/article was published |
| `incidentDate` | ISO date string | When the crime actually occurred |
| `source` | string \| null | |
| `links` | string[] | Array of source article URLs |

## 8. Field Reference — News/Article Object

| Field | Type | Notes |
|---|---|---|
| `news_link` | string | Unique identifier / URL |
| `country` | string | |
| `source` | string | Publisher domain |
| `type` | string | |
| `thumbnail` | string \| null | |
| `title` | string | |
| `link` | string | |
| `published_date` | ISO date string | |
| `published_by` | string \| null | |
| `description` | string | Full article text |
| `affiliation` | string | |
| `crimeType` | string | |
| `group_id` | integer | Articles with the same `group_id` are about the same event |
