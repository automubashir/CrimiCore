import { apiFetch } from './api'

// Handle flat {lat,lng}, {latitude,longitude}, nested {data:{lat,lng}}, or array [{lat,lng}]
function extractCoords(raw) {
  if (!raw) return null
  const d = Array.isArray(raw) ? raw[0] : (raw?.data ?? raw)
  if (!d) return null
  const lat = parseFloat(d.lat ?? d.latitude)
  const lng = parseFloat(d.lng ?? d.longitude ?? d.lon)
  return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null
}

/**
 * Server-side geocode cache.
 *
 * Both Maps live at module scope — they survive across requests inside the
 * same Node.js process, so the same address is never fetched more than once
 * per server lifetime, regardless of how many pages or users request it.
 *
 * coordCache  – final results  (location key → {lat, lng} | null)
 * inFlight    – pending fetches (location key → Promise)
 *              Deduplicate concurrent requests for the same key so we fire
 *              exactly one HTTP call even if two pages load simultaneously.
 */
const coordCache = new Map()
const inFlight   = new Map()

function normalize(location) {
  return location?.trim()?.toLowerCase() ?? ''
}

/**
 * Geocode a single location string.
 * Returns {lat, lng} on success, null if the API returned no result or failed.
 */
export async function geocodeOne(rawLocation) {
  const key = normalize(rawLocation)
  if (!key) return null

  if (coordCache.has(key)) return coordCache.get(key)
  if (inFlight.has(key))   return inFlight.get(key)

  const promise = apiFetch(`/api/geocode?location=${encodeURIComponent(key)}`)
    .then(data => {
      const result = extractCoords(data)
      coordCache.set(key, result)
      inFlight.delete(key)
      return result
    })
    .catch(() => {
      coordCache.set(key, null)
      inFlight.delete(key)
      return null
    })

  inFlight.set(key, promise)
  return promise
}

/**
 * Geocode an array of location strings in parallel.
 * Returns a map of { normalizedKey: {lat, lng} | null }.
 * Deduplicates both within the call and against previous calls.
 */
export async function geocodeAll(locations) {
  const unique = [...new Set(
    (locations ?? []).map(normalize).filter(Boolean)
  )]
  if (!unique.length) return {}

  await Promise.allSettled(unique.map(geocodeOne))

  return Object.fromEntries(unique.map(k => [k, coordCache.get(k) ?? null]))
}
