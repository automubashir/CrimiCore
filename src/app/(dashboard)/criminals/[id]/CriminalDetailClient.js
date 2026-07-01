'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import CriminalDetailContent from './CriminalDetailContent'
import NotFound from '@/components/ui/NotFound/NotFound'
import Loading from './loading'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '—' }
}

function buildLocationsMap(locs = [], coordMap = {}) {
  const third    = Math.max(1, Math.ceil(locs.length / 3))
  const most     = locs.slice(0, third)
  const moderate = locs.slice(third, third * 2)
  const limited  = locs.slice(third * 2)
  const maxCount = locs[0]?.count ?? 1

  const toList = (arr, presenceType) =>
    arr.map((l, i) => ({ rank: i + 1, city: toTitleCase(l.value ?? ''), presenceType, locationType: 'Region' }))

  function toMarker(loc, type) {
    const c = coordMap[(loc.value ?? '').trim().toLowerCase()]
    if (!c) return null
    return {
      coords: [c.lng, c.lat],
      type,
      r:      2.5 + ((loc.count ?? 0) / maxCount) * 4,
      label:  toTitleCase(loc.value ?? ''),
      count:  (loc.count ?? 0).toLocaleString(),
    }
  }

  const markers = [
    ...most.map(l     => toMarker(l, 'most')),
    ...moderate.map(l => toMarker(l, 'moderate')),
    ...limited.map(l  => toMarker(l, 'limited')),
  ].filter(Boolean)

  return {
    markers,
    mostPresenceCount:     most.length,
    moderatePresenceCount: moderate.length,
    limitedPresenceCount:  limited.length,
    cities: [
      ...toList(most,     'most'),
      ...toList(moderate, 'moderate'),
      ...toList(limited,  'limited'),
    ],
  }
}

function mapToNewsItem(item) {
  const n = item.news ?? item
  return {
    title:          n.title ?? '',
    published_date: n.published_date ?? '',
    news_link:      n.news_link ?? n.link ?? '',
    thumbnail:      n.thumbnail ?? null,
    crimeType:      n.crimeType ?? n.type ?? '',
    country:        n.country ?? '—',
  }
}

// Shape the monthly timeline buckets for the Activity Trends line chart.
function buildTrend(timelineData = []) {
  return timelineData.slice(-12).map(point => {
    const bt  = point.by_threat_level ?? []
    const get = lvl => bt.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
    return {
      date:   new Date(point.date).toLocaleString('en-US', { month: 'short' }),
      high:   get('high'),
      medium: get('medium'),
      low:    get('low'),
    }
  })
}

// A co-member = another criminal in the same affiliation.
function buildMember(c) {
  const crimes = (c.crimeType ?? '').split(',').map(s => s.trim()).filter(Boolean)
  return {
    id:          encodeURIComponent((c.criminalName ?? '').toLowerCase()),
    name:        toTitleCase(c.criminalName ?? ''),
    image:       c.imageUrl ?? null,
    role:        'Member',
    status:      '—',
    threat:      c.threat_level?.toLowerCase() ?? null,
    joinedSince: '—',
    crimes:      crimes.slice(0, 3),
    extraCrimes: Math.max(0, crimes.length - 3),
  }
}

export default function CriminalDetailClient() {
  const params = useParams()
  const criminalName = decodeURIComponent(params?.id ?? '_')
  const [pageData,     setPageData]     = useState(null)
  const [notFound,     setNotFound]     = useState(false)
  const [locations,    setLocations]    = useState(null) // null = still geocoding
  const [mapLocations, setMapLocations] = useState([])   // Locations-tab heatmap (coords added after geocode)
  const [mapsLoading,  setMapsLoading]  = useState(true)  // geocoding markers for the Locations tab
  const [locationNews, setLocationNews] = useState([])   // news for the criminal's top location
  const [locationLabel,setLocationLabel]= useState('Global')
  const [trendData,    setTrendData]    = useState(null) // affiliation-scoped trend (overrides global once loaded)
  const [members,      setMembers]      = useState(null) // null = still loading
  const [actNews,      setActNews]      = useState([])
  const [actPage,      setActPage]      = useState(1)
  const [actHasMore,   setActHasMore]   = useState(false)
  const [actLoading,   setActLoading]   = useState(false)

  useEffect(() => {
    async function load() {
      setMapsLoading(true)
      setTrendData(null)
      const [coRes, filterRes, timelineRes] = await Promise.allSettled([
        apiFetch('/api/analytics/co-occurrence' + buildQuery({ criminal_name: criminalName })),
        apiFetch('/api/criminals/filter'         + buildQuery({ criminal_name: criminalName, page: 1 })),
        apiFetch('/api/analytics/timeline'       + buildQuery({ interval: 'month' })),
      ])

      const coOccurrence = coRes.status      === 'fulfilled' ? coRes.value                          : null
      const filterData   = filterRes.status  === 'fulfilled' ? filterRes.value                      : null
      const timelineData = timelineRes.status === 'fulfilled' ? (timelineRes.value?.data ?? [])      : []

      if (!filterData?.total && !coOccurrence?.crime_types?.length) {
        setNotFound(true)
        return
      }

      const rawCriminal = filterData?.all_criminal?.[0] ?? null
      const allNews     = filterData?.all_news ?? []

      const byThreat    = coOccurrence?.by_threat_level ?? []
      const threat      = byThreat.length
        ? byThreat.reduce((a, b) => (b.count > a.count ? b : a)).threat_level?.toLowerCase() ?? null
        : (rawCriminal?.threat_level?.toLowerCase() ?? null)

      const highCount   = byThreat.find(x => x.threat_level?.toLowerCase() === 'high')?.count ?? 0
      const totalDocs   = byThreat.reduce((s, x) => s + (x.count ?? 0), 0) || 1
      const threatScore = Math.round((highCount / totalDocs) * 100)

      const maxCrimeCount = coOccurrence?.crime_types?.[0]?.count ?? 1
      const crimeScores   = (coOccurrence?.crime_types ?? []).slice(0, 5).map(c => ({
        name:  c.value,
        score: Math.round((c.count / maxCrimeCount) * 100),
      }))

      const gangs = (coOccurrence?.affiliations ?? []).slice(0, 4).map(a => ({
        id:     encodeURIComponent((a.value ?? '').toLowerCase()),
        name:   toTitleCase(a.value ?? ''),
        image:  null,
        threat: null,
      }))

      setActNews(allNews.map(mapToNewsItem))
      setActHasMore(allNews.length > 0)

      // Media = news articles about this criminal that carry a thumbnail.
      const media = allNews
        .map((item, i) => {
          const n = item.news ?? item
          return {
            id:    n.news_link ?? n.link ?? i,
            image: n.thumbnail ?? null,
            title: n.title ?? '—',
            date:  n.published_date ? formatDate(n.published_date) : '—',
          }
        })
        .filter(m => m.image)

      const recentNews = allNews.slice(0, 6).map((item, i) => {
        const n = item.news ?? item
        return {
          id:          n.news_link ?? i,
          image:       n.thumbnail ?? null,
          title:       n.title ?? '',
          description: (n.description ?? '').slice(0, 150),
          category:    (n.crimeType ?? n.type ?? '').split(',')[0].trim() || null,
          date:        n.published_date ? formatDate(n.published_date) : '—',
          location:    n.country ?? '—',
        }
      })

      // Global timeline renders immediately; a criminal-scoped one (by primary
      // affiliation) replaces it below once we know the affiliation.
      const trendData = buildTrend(timelineData)

      const activeSince = coOccurrence?.active_since ? formatDate(coOccurrence.active_since) : '—'
      const lastSeen    = coOccurrence?.last_seen     ? formatDate(coOccurrence.last_seen)    : '—'
      const country     = rawCriminal?.country ?? toTitleCase(coOccurrence?.locations?.[0]?.value ?? '')

      const criminal = {
        name:               toTitleCase(criminalName),
        image:              rawCriminal?.imageUrl ?? null,
        gangLabel:          toTitleCase(coOccurrence?.affiliations?.[0]?.value ?? rawCriminal?.affiliation ?? '—'),
        type:               coOccurrence?.crime_types?.[0]?.value ?? rawCriminal?.crimeType?.split(',')?.[0]?.trim() ?? '—',
        lastUpdated:        rawCriminal?.publishedDate ? formatDate(rawCriminal.publishedDate) : '—',
        status:             '—',
        riskScore:          threatScore,
        threat,
        threatScore,
        aliases:            [],
        nationalityFlag:    '',
        origin:             country || '—',
        activeRegionsCount: (coOccurrence?.locations ?? []).length,
        gangsAssociated:    (coOccurrence?.affiliations ?? []).length,
        fullName:           toTitleCase(criminalName),
        gender:             '—',
        nationality:        country || '—',
        lastActivity:       lastSeen,
        activeSince,
        interpol:           '—',
        summary:            '—',
        crimesInvolved:     (coOccurrence?.crime_types ?? []).map(c => c.value),
        gangs,
        keyConnections:     [],
        keyConnectionCount: 0,
        trendData,
        recentNews,
        recentNewsCount:    allNews.length,
        media,
        associates:         [],
        associateCount:     0,
        crimeScores,
      }

      setPageData({ criminal })

      // Geocode the locations in the background so the map doesn't block the
      // rest of the profile from rendering. The same coordinates feed both the
      // overview Known-Locations map and the Locations-tab heatmap.
      const rawLocations = coOccurrence?.locations ?? []
      const heatLocs     = rawLocations
        .map(l => ({ location: l.value ?? '', doc_count: l.count ?? 0 }))
        .filter(l => l.location)
      setMapLocations(heatLocs) // markers appear once coordinates resolve below

      // The criminal's most-frequent location drives the Locations-tab news + label.
      const selectedLocation = heatLocs[0]?.location ?? ''
      if (selectedLocation) {
        setLocationLabel(toTitleCase(selectedLocation))
        apiFetch('/api/news/filter' + buildQuery({ location: selectedLocation, page: 1 }))
          .then(d => setLocationNews(d?.all_news ?? []))
          .catch(() => setLocationNews([]))
      }

      geocodeAll(rawLocations.map(l => l.value ?? ''))
        .then(coordMap => {
          setLocations(buildLocationsMap(rawLocations, coordMap))
          setMapLocations(heatLocs.map(l => {
            const c = coordMap[l.location.trim().toLowerCase()]
            return c ? { ...l, lat: c.lat, lng: c.lng } : l
          }))
        })
        .catch(() => setLocations(buildLocationsMap(rawLocations, {})))
        .finally(() => setMapsLoading(false))

      // Members = other criminals sharing this criminal's primary affiliation.
      const primaryAff = coOccurrence?.affiliations?.[0]?.value ?? rawCriminal?.affiliation ?? ''
      if (primaryAff) {
        apiFetch('/api/criminals/filter' + buildQuery({ affiliation: primaryAff, page: 1 }))
          .then(d => setMembers(
            (d?.all_criminal ?? [])
              .filter(c => (c.criminalName ?? '').toLowerCase() !== criminalName.toLowerCase())
              .map(buildMember)
          ))
          .catch(() => setMembers([]))

        // Scope the Activity Trends chart to this criminal's affiliation — the
        // timeline endpoint has no per-criminal filter, so affiliation is the
        // closest available context.
        apiFetch('/api/analytics/timeline' + buildQuery({ interval: 'month', affiliation: primaryAff }))
          .then(d => setTrendData(buildTrend(d?.data ?? [])))
          .catch(() => {})
      } else {
        setMembers([])
      }
    }

    load()
  }, [criminalName])

  const loadMoreActNews = useCallback(async () => {
    if (actLoading || !actHasMore) return
    setActLoading(true)
    try {
      const data = await apiFetch('/api/criminals/filter' + buildQuery({ criminal_name: criminalName, page: actPage + 1 }))
      const items = (data.all_news ?? []).map(mapToNewsItem)
      setActNews(prev => [...prev, ...items])
      setActPage(p => p + 1)
      setActHasMore(items.length > 0)
    } catch {
      setActHasMore(false)
    } finally {
      setActLoading(false)
    }
  }, [actLoading, actHasMore, actPage, criminalName])

  if (notFound) return <NotFound title="Criminal not found" message="No data was found for this criminal." />
  if (!pageData) return <Loading />

  return (
    <CriminalDetailContent
      criminal={{ ...pageData.criminal, locations: locations ?? undefined, trendData: trendData ?? pageData.criminal.trendData }}
      locationsLoading={locations === null}
      members={members ?? []}
      membersLoading={members === null}
      activitiesNews={actNews}
      activitiesHasMore={actHasMore}
      activitiesLoading={actLoading}
      onActivitiesLoadMore={loadMoreActNews}
      locationData={mapLocations}
      locationNews={locationNews}
      locationLabel={locationLabel}
      mapsLoading={mapsLoading}
    />
  )
}
