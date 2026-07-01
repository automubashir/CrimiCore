'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import HeatmapContent from './HeatmapContent'
import Loading from './loading'

export default function HeatmapPage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [byLocationRes, overviewRes, crimeTypesRes] = await Promise.allSettled([
        apiFetch('/api/analytics/by-location' + buildQuery({ breakdown: true, size: 50 })),
        apiFetch('/api/analytics/overview'),
        apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 50 })),
      ])

      const byLocationData = byLocationRes.status  === 'fulfilled' ? (byLocationRes.value?.data  ?? []) : []
      const overviewData   = overviewRes.status    === 'fulfilled' ? overviewRes.value                  : null
      const crimeTypesRaw  = crimeTypesRes.status  === 'fulfilled' ? (crimeTypesRes.value?.data  ?? []) : []

      const crimeTypeOptions = [
        'All Crime Types',
        ...crimeTypesRaw.map(c => c.crime_type).filter(Boolean).sort(),
      ]

      setPageData({ byLocationData, overviewData, crimeTypeOptions })
    }

    load()
  }, [])

  if (!pageData) return <Loading />

  return <HeatmapContent {...pageData} />
}
