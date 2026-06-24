'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import CriminalsContent from './CriminalsContent'
import Loading from './loading'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function mapTopCriminal(c) {
  return {
    id:           encodeURIComponent((c.criminal_name ?? '').toLowerCase()),
    name:         toTitleCase(c.criminal_name ?? ''),
    image:        c.image_url ?? null,
    organization: toTitleCase(c.affiliation ?? '—'),
    threat:       c.threat_level?.toLowerCase() ?? null,
  }
}

export default function CriminalsPage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [criminalsRes, overviewRes, crimeTypesRes, topCriminalsRes, affiliationsRes] = await Promise.allSettled([
        apiFetch('/api/criminals/filter'        + buildQuery({ page: 1 })),
        apiFetch('/api/analytics/overview'),
        apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 10 })),
        apiFetch('/api/analytics/top-criminals' + buildQuery({ size: 10 })),
        apiFetch('/api/affiliations'),
      ])

      const criminalsRaw    = criminalsRes.status     === 'fulfilled' ? (criminalsRes.value?.all_criminal  ?? []) : []
      const overview        = overviewRes.status      === 'fulfilled' ? overviewRes.value                        : null
      const crimeTypesRaw   = crimeTypesRes.status    === 'fulfilled' ? (crimeTypesRes.value?.data         ?? []) : []
      const topCriminalsRaw = topCriminalsRes.status  === 'fulfilled' ? (topCriminalsRes.value?.data       ?? []) : []
      const affiliationsRaw = affiliationsRes.status  === 'fulfilled' ? (affiliationsRes.value?.data       ?? []) : []

      const high   = overview?.by_threat_level?.find(x => x.threat_level?.toLowerCase() === 'high')?.criminal_count   ?? 0
      const medium = overview?.by_threat_level?.find(x => x.threat_level?.toLowerCase() === 'medium')?.criminal_count ?? 0
      const low    = overview?.by_threat_level?.find(x => x.threat_level?.toLowerCase() === 'low')?.criminal_count    ?? 0
      const total  = overview?.total_criminals ?? 0
      const stats  = { total, high, medium, low }

      const loaded = total || 1
      const pieStats = {
        total,
        high:   { count: high,   pct: Math.round((high   / loaded) * 100) },
        medium: { count: medium, pct: Math.round((medium / loaded) * 100) },
        low:    { count: low,    pct: Math.round((low    / loaded) * 100) },
      }

      const crimeTypes    = crimeTypesRaw.map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.doc_count ?? 0 }))
      const topCriminals  = topCriminalsRaw.slice(0, 5).map(mapTopCriminal)
      const recentCriminals = topCriminalsRaw.slice(5, 10).map(mapTopCriminal)

      const gangOptions      = affiliationsRaw.map(a => toTitleCase(a.affiliation ?? '')).filter(Boolean).sort()
      const countryOptions   = [...new Set(criminalsRaw.map(c => toTitleCase(c.country ?? '')).filter(Boolean))].sort()
      const crimeTypeOptions = [...new Set(
        criminalsRaw.flatMap(c => (c.crimeType ?? '').split(',').map(s => s.trim()).filter(Boolean))
      )].sort()

      setPageData({ criminalsRaw, stats, pieStats, crimeTypes, topCriminals, recentCriminals, gangOptions, countryOptions, crimeTypeOptions })
    }

    load()
  }, [])

  if (!pageData) return <Loading />

  return <CriminalsContent {...pageData} />
}
