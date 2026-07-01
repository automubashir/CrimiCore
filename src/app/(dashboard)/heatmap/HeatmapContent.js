'use client'

import { useState, useEffect, useRef } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import HeatmapView from '@/components/heatmap/HeatmapView/HeatmapView'

const PERIOD_DAYS = { 'Last 30 Days': 30, 'Last 90 Days': 90, 'Last 6 Months': 180, 'Last Year': 365 }

function timePeriodToParams(period) {
  const days = PERIOD_DAYS[period]
  if (!days) return {}
  const to   = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from_date: fmt(from), to_date: fmt(to) }
}

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Everything derivable from the API response WITHOUT geocoding — computed
// synchronously so the page (stats, hotspots, donut) renders immediately.
function buildStaticData(byLocationData, overviewData) {
  const maxAct = byLocationData.reduce((m, h) => Math.max(m, h.doc_count ?? 0), 0) || 1

  const locations = byLocationData.map(h => {
    const bt    = h.by_threat_level ?? []
    const dom   = bt.length ? bt.reduce((a, b) => (b.count > a.count ? b : a)) : null
    const risk  = toTitleCase(dom?.threat_level ?? 'medium')
    const color = risk === 'High' ? '#F2464A' : risk === 'Low' ? '#F0C028' : '#F3921B'

    return {
      location:   h.location ?? '',
      r:          2.5 + ((h.doc_count ?? 0) / maxAct) * 5.5,
      color,
      city:       toTitleCase(h.location ?? ''),
      country:    toTitleCase(h.country ?? ''),
      activities: h.doc_count ?? 0,
      crimeTypes: (h.top_crime_types ?? []).slice(0, 3).map(c => c.crime_type),
      risk,
      trend:      '—',
    }
  })

  const hotspots      = locations.slice().sort((a, b) => b.activities - a.activities).slice(0, 8)
  const topSpot       = hotspots[0]
  const highRiskCount = locations.filter(m => m.risk === 'High').length
  const totalActivities = overviewData?.total_articles ?? locations.reduce((s, m) => s + m.activities, 0)

  const stats = [
    { label: 'Active Hotspots',  value: locations.length.toString(),      sub: 'Across regions'                         },
    { label: 'Total Activities', value: totalActivities.toLocaleString(), sub: 'All time'                               },
    { label: 'Highest Density',  value: topSpot?.city ?? '—',             sub: `${topSpot?.activities ?? 0} activities` },
    { label: 'High Risk Zones',  value: highRiskCount.toString(),         sub: 'Critical alert level'                   },
  ]

  const byThreat    = overviewData?.by_threat_level ?? []
  const threatCount = lvl => byThreat.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
  const highCount   = threatCount('high')
  const medCount    = threatCount('medium')
  const lowCount    = threatCount('low')
  const threatTotal = highCount + medCount + lowCount || 1
  const donutData   = [
    { value: Math.round((highCount / threatTotal) * 100), color: '#F2464A' },
    { value: Math.round((medCount  / threatTotal) * 100), color: '#F3921B' },
    { value: Math.round((lowCount  / threatTotal) * 100), color: '#F0C028' },
  ]

  return { locations, maxAct, hotspots, stats, donutData, totalActivities }
}

// Async — resolves the map-dot coordinates via the geocode service.
// Only the dot positions depend on this; the rest of the page never waits on it.
async function geocodeMarkers(locations) {
  const coordMap = await geocodeAll(locations.map(l => l.location))
  return locations
    .map(l => {
      const c = coordMap[(l.location ?? '').trim().toLowerCase()]
      if (!c || isNaN(c.lat) || isNaN(c.lng)) return null
      return { ...l, coords: [c.lng, c.lat] }
    })
    .filter(Boolean)
}

export default function HeatmapContent({ byLocationData = [], overviewData = null, crimeTypeOptions = ['All Crime Types'] }) {
  const [crimeType,  setCrimeType]  = useState(crimeTypeOptions[0] ?? 'All Crime Types')
  const [timePeriod, setTimePeriod] = useState('All Time')

  // Static data is ready synchronously — no skeleton wait on geocoding.
  const [mapData, setMapData] = useState(() => buildStaticData(byLocationData, overviewData))
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true) // geocoding the initial markers

  const isFirstRender = useRef(true)
  const fetchIdRef    = useRef(0)

  // Geocode the initial markers in the background; map shows its own loader.
  useEffect(() => {
    let cancelled = false
    geocodeMarkers(mapData.locations).then(m => {
      if (cancelled) return
      setMarkers(m)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch + re-geocode when filters change.
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }

    const id = ++fetchIdRef.current
    setLoading(true)

    const apiFilters = {}
    if (crimeType !== 'All Crime Types') apiFilters.crime_type = crimeType
    Object.assign(apiFilters, timePeriodToParams(timePeriod))

    apiFetch('/api/analytics/by-location' + buildQuery({ breakdown: true, size: 50, ...apiFilters }))
      .then(async data => {
        if (fetchIdRef.current !== id) return
        const base = buildStaticData(data?.data ?? [], overviewData)
        setMapData(base) // stats / hotspots / donut update as soon as the API responds
        const m = await geocodeMarkers(base.locations)
        if (fetchIdRef.current !== id) return
        setMarkers(m)
      })
      .catch(() => {})
      .finally(() => { if (fetchIdRef.current === id) setLoading(false) })
  }, [crimeType, timePeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HeatmapView
      markers={markers}
      hotspots={mapData.hotspots}
      maxAct={mapData.maxAct}
      stats={mapData.stats}
      donutData={mapData.donutData}
      totalCount={mapData.totalActivities}
      crimeTypes={crimeTypeOptions}
      crimeType={crimeType}
      timePeriod={timePeriod}
      onCrimeTypeChange={setCrimeType}
      onTimePeriodChange={setTimePeriod}
      loading={loading}
    />
  )
}
