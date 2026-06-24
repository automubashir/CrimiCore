'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import HeatmapView from '@/components/heatmap/HeatmapView/HeatmapView'
import Loading from './loading'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function HeatmapPage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [byLocationRes, overviewRes] = await Promise.allSettled([
        apiFetch('/api/analytics/by-location' + buildQuery({ breakdown: true, size: 20 })),
        apiFetch('/api/analytics/overview'),
      ])

      const byLocationData = byLocationRes.status === 'fulfilled' ? (byLocationRes.value?.data ?? []) : []
      const overviewData   = overviewRes.status   === 'fulfilled' ? overviewRes.value                 : null

      const coordMap = await geocodeAll(byLocationData.map(h => h.location ?? ''))

      const maxAct = byLocationData.reduce((m, h) => Math.max(m, h.doc_count ?? 0), 0) || 1

      const markers = byLocationData.map(h => {
        const locKey = (h.location ?? '').trim().toLowerCase()
        const c = coordMap[locKey]

        const lat = c?.lat ?? parseFloat(h.lat)
        const lng = c?.lng ?? parseFloat(h.lng)

        if (isNaN(lat) || isNaN(lng)) return null

        const bt  = h.by_threat_level ?? []
        const dom = bt.length ? bt.reduce((a, b) => (b.count > a.count ? b : a)) : null
        const risk  = toTitleCase(dom?.threat_level ?? 'medium')
        const color = risk === 'High' ? '#F2464A' : risk === 'Low' ? '#F0C028' : '#F3921B'

        return {
          coords:     [lng, lat],
          r:          2.5 + ((h.doc_count ?? 0) / maxAct) * 5.5,
          color,
          city:       toTitleCase(h.location ?? ''),
          country:    toTitleCase(h.country ?? ''),
          activities: h.doc_count ?? 0,
          crimeTypes: (h.top_crime_types ?? []).slice(0, 3).map(c => c.crime_type),
          risk,
          trend:      '—',
        }
      }).filter(Boolean)

      const hotspots       = markers.slice().sort((a, b) => b.activities - a.activities).slice(0, 8)
      const topSpot        = hotspots[0]
      const highRiskCount  = markers.filter(m => m.risk === 'High').length
      const totalActivities = overviewData?.total_articles ?? markers.reduce((s, m) => s + m.activities, 0)

      const stats = [
        { label: 'Active Hotspots',  value: markers.length.toString(),        sub: 'Across regions'                             },
        { label: 'Total Activities', value: totalActivities.toLocaleString(), sub: 'All time'                                   },
        { label: 'Highest Density',  value: topSpot?.city ?? '—',             sub: `${topSpot?.activities ?? 0} activities`    },
        { label: 'High Risk Zones',  value: highRiskCount.toString(),         sub: 'Critical alert level'                       },
      ]

      const byThreat    = overviewData?.by_threat_level ?? []
      const highCount   = byThreat.find(x => x.threat_level === 'high')?.count   ?? 0
      const medCount    = byThreat.find(x => x.threat_level === 'medium')?.count ?? 0
      const lowCount    = byThreat.find(x => x.threat_level === 'low')?.count    ?? 0
      const threatTotal = highCount + medCount + lowCount || 1
      const donutData = [
        { value: Math.round((highCount / threatTotal) * 100), color: '#F2464A' },
        { value: Math.round((medCount  / threatTotal) * 100), color: '#F3921B' },
        { value: Math.round((lowCount  / threatTotal) * 100), color: '#F0C028' },
      ]

      setPageData({ markers, hotspots, maxAct, stats, donutData, totalActivities })
    }

    load()
  }, [])

  if (!pageData) return <Loading />

  return (
    <HeatmapView
      markers={pageData.markers}
      hotspots={pageData.hotspots}
      maxAct={pageData.maxAct}
      stats={pageData.stats}
      donutData={pageData.donutData}
      totalCount={pageData.totalActivities}
      crimeTypes={['All Crime Types']}
    />
  )
}
