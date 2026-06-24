'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import CriminalDetailContent from './CriminalDetailContent'
import NotFound from '@/components/ui/NotFound/NotFound'
import Loading from './loading'

export function generateStaticParams() { return [] }

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
    return { coords: [c.lng, c.lat], type, r: 2.5 + ((loc.count ?? 0) / maxCount) * 4 }
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

export default function CriminalDetailPage() {
  const { id } = useParams()
  const criminalName = decodeURIComponent(id)
  const [pageData, setPageData] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const [coRes, filterRes, timelineRes] = await Promise.allSettled([
        apiFetch('/api/analytics/co-occurrence' + buildQuery({ criminal_name: criminalName })),
        apiFetch('/api/criminals/filter'         + buildQuery({ criminal_name: criminalName, page: 1 })),
        apiFetch('/api/analytics/timeline'       + buildQuery({ interval: 'month' })),
      ])

      const coOccurrence = coRes.status     === 'fulfilled' ? coRes.value                             : null
      const filterData   = filterRes.status === 'fulfilled' ? filterRes.value                         : null
      const timelineData = timelineRes.status === 'fulfilled' ? (timelineRes.value?.data ?? [])        : []

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

      const gangs = (coOccurrence?.affiliations ?? []).slice(0, 4).map((a, i) => ({
        id:     i,
        name:   toTitleCase(a.value ?? ''),
        image:  null,
        threat: null,
      }))

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

      const rawLocations = coOccurrence?.locations ?? []
      const coordMap     = await geocodeAll(rawLocations.map(l => l.value ?? ''))
      const locations    = buildLocationsMap(rawLocations, coordMap)

      const trendData = timelineData.slice(-12).map(point => {
        const bt  = point.by_threat_level ?? []
        const get = lvl => bt.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
        return {
          date:   new Date(point.date).toLocaleString('en-US', { month: 'short' }),
          high:   get('high'),
          medium: get('medium'),
          low:    get('low'),
        }
      })

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
        locations,
        media:              [],
        associates:         [],
        associateCount:     0,
        crimeScores,
      }

      setPageData({ criminal })
    }

    load()
  }, [criminalName])

  if (notFound) return <NotFound title="Criminal not found" message="No data was found for this criminal." />
  if (!pageData) return <Loading />

  return <CriminalDetailContent criminal={pageData.criminal} />
}
