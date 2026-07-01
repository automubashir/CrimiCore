'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import GangDetailContent from './GangDetailContent'
import NotFound from '@/components/ui/NotFound/NotFound'
import Loading from './loading'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function dominantThreat(byThreatLevel = []) {
  if (!byThreatLevel?.length) return null
  return byThreatLevel.reduce((a, b) => (b.count > a.count ? b : a)).threat_level?.toLowerCase() ?? null
}

function buildTerritories(topLocations = [], coordMap = {}) {
  const third    = Math.max(1, Math.ceil(topLocations.length / 3))
  const most     = topLocations.slice(0, third)
  const moderate = topLocations.slice(third, third * 2)
  const limited  = topLocations.slice(third * 2)
  const toList   = (locs) => locs.map((l, i) => ({ rank: i + 1, city: toTitleCase(l.location ?? ''), count: l.count ?? 0 }))
  const maxCount = topLocations[0]?.count ?? 1

  function toMarker(loc, type) {
    const c = coordMap[(loc.location ?? '').trim().toLowerCase()]
    if (!c) return null
    return {
      coords: [c.lng, c.lat],
      type,
      r:      2.5 + ((loc.count ?? 0) / maxCount) * 4,
      label:  toTitleCase(loc.location ?? ''),
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
    mostPresence:          toList(most),
    moderatePresence:      toList(moderate),
    limitedPresence:       toList(limited),
    mostPresenceCount:     most.length,
    moderatePresenceCount: moderate.length,
    limitedPresenceCount:  limited.length,
  }
}

// Collapse the heatmap location × crime-type matrix into per-location totals,
// sorted most-active first. Both maps (territorial + territories tab) share this.
function buildHeatLocations(heatmap) {
  const matrix = heatmap?.matrix ?? []
  return matrix
    .map(row => ({
      location:  row.location ?? '',
      doc_count: (row.values ?? []).reduce((s, v) => s + (Number(v) || 0), 0),
    }))
    .filter(l => l.location)
    .sort((a, b) => b.doc_count - a.doc_count)
}

// Attach cached coordinates to the heatmap locations for CrimeHeatMap markers.
function withCoords(locs, coordMap) {
  return locs.map(l => {
    const c = coordMap[(l.location ?? '').trim().toLowerCase()]
    return c ? { ...l, lat: c.lat, lng: c.lng } : l
  })
}

function buildTrendData(timelineData = []) {
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

// A gang member = a criminal affiliated with this gang.
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

export default function GangDetailClient() {
  const params = useParams()
  const affiliationName = decodeURIComponent(params?.id ?? '_')
  const [pageData,          setPageData]          = useState(null)
  const [notFound,          setNotFound]           = useState(false)
  const [territories,       setTerritories]        = useState(null) // markers filled in after geocode
  const [mapLocations,      setMapLocations]        = useState([])   // territories-tab heatmap (coords added after geocode)
  const [mapsLoading,       setMapsLoading]          = useState(true) // geocoding markers for both maps
  const [locationNews,      setLocationNews]        = useState([])   // news for the gang's top territory
  const [locationLabel,     setLocationLabel]       = useState('Global')
  const [members,           setMembers]            = useState(null) // null = still loading
  const [relatedNews,       setRelatedNews]        = useState([])
  const [relatedNewsPage,   setRelatedNewsPage]    = useState(1)
  const [relatedNewsHasMore,setRelatedNewsHasMore] = useState(false)
  const [relatedNewsLoading,setRelatedNewsLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setMapsLoading(true)
      const [detailsRes, gangRes, newsRes, timelineRes, heatmapRes] = await Promise.allSettled([
        apiFetch('/api/gang-details?gang_name=' + encodeURIComponent(affiliationName)),
        apiFetch('/api/analytics/by-affiliation' + buildQuery({ affiliation: affiliationName, breakdown: true })),
        apiFetch('/api/news/filter'               + buildQuery({ affiliation: affiliationName, page: 1 })),
        apiFetch('/api/analytics/timeline'        + buildQuery({ affiliation: affiliationName, interval: 'month' })),
        apiFetch('/api/analytics/heatmap'         + buildQuery({ affiliation: affiliationName })),
      ])

      const details      = detailsRes.status  === 'fulfilled' ? (detailsRes.value        ?? null) : null
      const gangData     = gangRes.status      === 'fulfilled' ? (gangRes.value?.data?.[0] ?? null) : null
      const newsData     = newsRes.status      === 'fulfilled' ? (newsRes.value?.all_news  ?? [])   : []
      const timelineData = timelineRes.status  === 'fulfilled' ? (timelineRes.value?.data  ?? [])   : []
      const heatmap      = heatmapRes.status   === 'fulfilled' ? (heatmapRes.value         ?? null) : null

      // Nothing to show if neither the profile nor the analytics resolved.
      if (!details && !gangData) {
        setNotFound(true)
        return
      }

      // Both maps share one location list (heatmap totals) + one geocode cache.
      const heatLocs     = buildHeatLocations(heatmap)
      const topLocations = heatLocs.map(l => ({ location: l.location, count: l.doc_count }))

      const threat      = dominantThreat(gangData?.by_threat_level)
      const topCrimes   = (gangData?.top_crime_types ?? []).map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.count ?? 0 }))
      const totalDocs   = (gangData?.by_threat_level ?? []).reduce((s, x) => s + (x.count ?? 0), 0) || 1
      const highCount   = (gangData?.by_threat_level ?? []).find(x => x.threat_level?.toLowerCase() === 'high')?.count ?? 0
      const threatScore = Math.round((highCount / totalDocs) * 100)

      const regions      = details?.regions ?? []
      const aliasList    = details?.aliases ?? []
      const primaryName  = details?.name ?? gangData?.affiliation ?? affiliationName
      const otherAliases = aliasList.filter(a => a && a.toLowerCase() !== primaryName.toLowerCase())

      setRelatedNews(newsData.map(mapToNewsItem))
      setRelatedNewsHasMore(newsData.length > 0)

      // Media = news articles that carry a thumbnail.
      const media = newsData
        .map((item, i) => {
          const n = item.news ?? item
          return {
            id:    n.news_link ?? n.link ?? i,
            image: n.thumbnail ?? null,
            title: n.title ?? '—',
            date:  n.published_date ? new Date(n.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          }
        })
        .filter(m => m.image)

      // Last updated = most recent related-article date (news is newest-first).
      const latestNewsDate = newsData
        .map(item => (item.news ?? item).published_date)
        .filter(Boolean)[0]
      const lastUpdated = latestNewsDate
        ? new Date(latestNewsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null

      const recentNews = newsData.slice(0, 3).map((item, i) => {
        const n = item.news ?? item
        return {
          id:          n.news_link ?? n.link ?? i + 1,
          category:    (n.crimeType?.split(',')[0]?.trim() ?? 'general').toLowerCase().replace(/\s+/g, '-'),
          image:       n.thumbnail ?? null,
          title:       n.title ?? '—',
          description: n.description ? n.description.slice(0, 120) + '…' : '',
          date:        n.published_date ? new Date(n.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          location:    n.country ?? '—',
        }
      })

      const gang = {
        name:               toTitleCase(primaryName),
        image:              null,
        fullAlias:          otherAliases.length ? otherAliases.join(', ') : '—',
        type:               '—',
        lastUpdated,
        leader:             '—',
        founded:            details?.founded ?? '—',
        origin:             toTitleCase(regions[0] ?? heatLocs[0]?.location ?? '—'),
        activeRegionsCount: regions.length ? `${regions.length}+ Regions` : (topLocations.length ? `${topLocations.length}+ Regions` : '—'),
        activeMembers:      gangData?.criminal_count ?? 0,
        threat,
        threatScore,
        threatDescription:  '—',
        threatHighlights:   [],
        status:             details?.status ?? null,
        summary:            details?.summary ?? '—',
        overview:           details?.overview ?? '—',
        crimesInvolved:     (details?.criminal_activities ?? (gangData?.top_crime_types ?? []).map(c => c.crime_type)),
        territories:        buildTerritories(topLocations, {}), // presence lists/tabs now; markers after geocode
        trendData:          buildTrendData(timelineData),
        aliases:            aliasList,
        leaders:            [],
        topCrimes,
        recentNews,
        media,
      }

      setPageData({ gang })
      setMapLocations(heatLocs) // markers appear once coordinates resolve below

      // The gang's most-active territory drives the Territories-tab news list + label.
      const selectedLocation = heatLocs[0]?.location ?? regions[0] ?? ''
      if (selectedLocation) {
        setLocationLabel(toTitleCase(selectedLocation))
        apiFetch('/api/news/filter' + buildQuery({ location: selectedLocation, page: 1 }))
          .then(d => setLocationNews(d?.all_news ?? []))
          .catch(() => setLocationNews([]))
      }

      // Geocode once; feed both the territorial map and the territories-tab heatmap
      // from the same cached coordinates. Presence lists already render meanwhile.
      geocodeAll(topLocations.map(l => l.location ?? ''))
        .then(coordMap => {
          setTerritories(buildTerritories(topLocations, coordMap))
          setMapLocations(withCoords(heatLocs, coordMap))
        })
        .catch(() => {})
        .finally(() => setMapsLoading(false))

      // Members = criminals affiliated with this gang.
      apiFetch('/api/criminals/filter' + buildQuery({ affiliation: affiliationName, page: 1 }))
        .then(d => setMembers((d?.all_criminal ?? []).map(buildMember)))
        .catch(() => setMembers([]))
    }

    load()
  }, [affiliationName])

  const loadMoreRelatedNews = useCallback(async () => {
    if (relatedNewsLoading || !relatedNewsHasMore) return
    setRelatedNewsLoading(true)
    try {
      const data = await apiFetch('/api/news/filter' + buildQuery({ affiliation: affiliationName, page: relatedNewsPage + 1 }))
      const items = (data.all_news ?? []).map(mapToNewsItem)
      setRelatedNews(prev => [...prev, ...items])
      setRelatedNewsPage(p => p + 1)
      setRelatedNewsHasMore(items.length > 0)
    } catch {
      setRelatedNewsHasMore(false)
    } finally {
      setRelatedNewsLoading(false)
    }
  }, [relatedNewsLoading, relatedNewsHasMore, relatedNewsPage, affiliationName])

  if (notFound) return <NotFound title="Gang not found" message="No data was found for this gang." />
  if (!pageData) return <Loading />

  return (
    <GangDetailContent
      gang={{ ...pageData.gang, territories: territories ?? pageData.gang.territories }}
      members={members ?? []}
      membersLoading={members === null}
      relatedNews={relatedNews}
      relatedNewsHasMore={relatedNewsHasMore}
      relatedNewsLoading={relatedNewsLoading}
      onRelatedNewsLoadMore={loadMoreRelatedNews}
      locationData={mapLocations}
      locationNews={locationNews}
      locationLabel={locationLabel}
      mapsLoading={mapsLoading}
    />
  )
}
