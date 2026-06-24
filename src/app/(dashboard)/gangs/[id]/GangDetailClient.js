'use client'

import { useState, useEffect } from 'react'
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
    return { coords: [c.lng, c.lat], type, r: 2.5 + ((loc.count ?? 0) / maxCount) * 4 }
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

export default function GangDetailClient() {
  const params = useParams()
  const affiliationName = decodeURIComponent(params?.id ?? '_')
  const [pageData, setPageData] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const [gangRes, newsRes, timelineRes] = await Promise.allSettled([
        apiFetch('/api/analytics/by-affiliation' + buildQuery({ affiliation: affiliationName, breakdown: true })),
        apiFetch('/api/news/filter'               + buildQuery({ affiliation: affiliationName, page: 1 })),
        apiFetch('/api/analytics/timeline'        + buildQuery({ affiliation: affiliationName, interval: 'month' })),
      ])

      const gangData     = gangRes.status     === 'fulfilled' ? (gangRes.value?.data?.[0]  ?? null) : null
      const newsData     = newsRes.status     === 'fulfilled' ? (newsRes.value?.all_news   ?? [])   : []
      const timelineData = timelineRes.status === 'fulfilled' ? (timelineRes.value?.data   ?? [])   : []

      if (!gangData) {
        setNotFound(true)
        return
      }

      const topLocations = gangData.top_locations ?? []
      const coordMap     = await geocodeAll(topLocations.map(l => l.location ?? ''))

      const threat      = dominantThreat(gangData.by_threat_level)
      const topCrimes   = (gangData.top_crime_types ?? []).map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.count ?? 0 }))
      const totalDocs   = (gangData.by_threat_level ?? []).reduce((s, x) => s + (x.count ?? 0), 0) || 1
      const highCount   = (gangData.by_threat_level ?? []).find(x => x.threat_level?.toLowerCase() === 'high')?.count ?? 0
      const threatScore = Math.round((highCount / totalDocs) * 100)

      const recentNews = newsData.slice(0, 3).map((item, i) => {
        const n = item.news ?? item
        return {
          id:          i + 1,
          category:    (n.crimeType?.split(',')[0]?.trim() ?? 'general').toLowerCase().replace(/\s+/g, '-'),
          image:       n.thumbnail ?? null,
          title:       n.title ?? '—',
          description: n.description ? n.description.slice(0, 120) + '…' : '',
          date:        n.published_date ? new Date(n.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          location:    n.country ?? '—',
        }
      })

      const gang = {
        name:               toTitleCase(gangData.affiliation ?? affiliationName),
        image:              null,
        fullAlias:          '—',
        type:               '—',
        lastUpdated:        '—',
        leader:             '—',
        founded:            '—',
        origin:             toTitleCase(gangData.top_locations?.[0]?.location ?? '—'),
        activeRegionsCount: gangData.top_locations?.length ? `${gangData.top_locations.length}+ Regions` : '—',
        activeMembers:      gangData.criminal_count ?? 0,
        threat,
        threatScore,
        threatDescription:  '—',
        threatHighlights:   [],
        overview:           '—',
        crimesInvolved:     (gangData.top_crime_types ?? []).map(c => c.crime_type),
        territories:        buildTerritories(topLocations, coordMap),
        trendData:          buildTrendData(timelineData),
        aliases:            [],
        leaders:            [],
        topCrimes,
        recentNews,
      }

      setPageData({ gang })
    }

    load()
  }, [affiliationName])

  if (notFound) return <NotFound title="Gang not found" message="No data was found for this gang." />
  if (!pageData) return <Loading />

  return <GangDetailContent gang={pageData.gang} />
}
