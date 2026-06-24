'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import GangsContent from './GangsContent'
import Loading from './loading'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function dominantThreat(byThreatLevel = []) {
  if (!byThreatLevel?.length) return null
  return byThreatLevel.reduce((a, b) => (b.count > a.count ? b : a)).threat_level?.toLowerCase() ?? null
}

function mapGang(g) {
  const crimesRaw = g.top_crime_types ?? []
  const locsRaw   = g.top_locations   ?? []
  return {
    id:                encodeURIComponent((g.affiliation ?? '').toLowerCase()),
    name:              toTitleCase(g.affiliation ?? ''),
    alias:             null,
    image:             null,
    activeRegions:     locsRaw.slice(0, 3).map(l => toTitleCase(l.location)).join(', ') || '—',
    regionCount:       locsRaw.length ? `${locsRaw.length}+ Regions` : '—',
    members:           g.criminal_count ?? 0,
    threat:            dominantThreat(g.by_threat_level),
    primaryActivities: crimesRaw.slice(0, 3).map(c => c.crime_type),
    extraCount:        Math.max(0, crimesRaw.length - 3),
  }
}

export default function GangsPage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [affiliationsRes, overviewRes, crimeTypesRes, timelineRes] = await Promise.allSettled([
        apiFetch('/api/analytics/by-affiliation' + buildQuery({ size: 50, breakdown: true })),
        apiFetch('/api/analytics/overview'),
        apiFetch('/api/analytics/by-crime-type'  + buildQuery({ size: 10 })),
        apiFetch('/api/analytics/timeline'       + buildQuery({ interval: 'month' })),
      ])

      const affiliationsRaw = affiliationsRes.status === 'fulfilled' ? (affiliationsRes.value?.data ?? []) : []
      const overview        = overviewRes.status     === 'fulfilled' ? overviewRes.value                  : null
      const crimeTypesRaw   = crimeTypesRes.status   === 'fulfilled' ? (crimeTypesRes.value?.data  ?? []) : []
      const timelineRaw     = timelineRes.status     === 'fulfilled' ? (timelineRes.value?.data    ?? []) : []

      const affiliations  = affiliationsRaw.map(mapGang)

      const threatCounts = affiliationsRaw.reduce((acc, g) => {
        const t = dominantThreat(g.by_threat_level)
        if      (t === 'high')   acc.high++
        else if (t === 'medium') acc.medium++
        else if (t === 'low')    acc.low++
        return acc
      }, { high: 0, medium: 0, low: 0 })

      const total  = overview?.total_affiliations ?? affiliations.length
      const stats  = { total, ...threatCounts }
      const loaded = affiliationsRaw.length || 1

      const pieStats = {
        total,
        high:   { count: threatCounts.high,   pct: Math.round((threatCounts.high   / loaded) * 100) },
        medium: { count: threatCounts.medium, pct: Math.round((threatCounts.medium / loaded) * 100) },
        low:    { count: threatCounts.low,    pct: Math.round((threatCounts.low    / loaded) * 100) },
      }

      const crimeTypes = crimeTypesRaw.map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.doc_count ?? 0 }))

      const trendData = timelineRaw.slice(-8).map(point => {
        const bt  = point.by_threat_level ?? []
        const get = lvl => bt.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
        return {
          date:   new Date(point.date).toLocaleString('en-US', { month: 'short' }),
          high:   get('high'),
          medium: get('medium'),
          low:    get('low'),
        }
      })

      const uniqueLocations  = [...new Set(
        affiliationsRaw.flatMap(g => (g.top_locations  ?? []).map(l => toTitleCase(l.location)))
      )].filter(Boolean).sort()

      const uniqueCrimeTypes = [...new Set(
        affiliationsRaw.flatMap(g => (g.top_crime_types ?? []).map(c => c.crime_type))
      )].filter(Boolean).sort()

      setPageData({ affiliations, stats, pieStats, crimeTypes, trendData, countryOptions: uniqueLocations, crimeTypeOptions: uniqueCrimeTypes })
    }

    load()
  }, [])

  if (!pageData) return <Loading />

  return <GangsContent {...pageData} />
}
