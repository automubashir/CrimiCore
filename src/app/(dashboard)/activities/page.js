'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import ActivitiesContent from './ActivitiesContent'
import Loading from './loading'

export default function ActivitiesPage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [newsRes, overviewRes, crimeTypesRes, sourcesRes] = await Promise.allSettled([
        apiFetch('/api/news/filter' + buildQuery({ page: 1 })),
        apiFetch('/api/analytics/overview'),
        apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 12 })),
        apiFetch('/api/analytics/by-source' + buildQuery({ size: 8 })),
      ])

      setPageData({
        initialNews: newsRes.status       === 'fulfilled' ? (newsRes.value?.all_news   ?? []) : [],
        overview:    overviewRes.status   === 'fulfilled' ? overviewRes.value                 : null,
        crimeTypes:  crimeTypesRes.status === 'fulfilled' ? (crimeTypesRes.value?.data ?? []) : [],
        sources:     sourcesRes.status    === 'fulfilled' ? (sourcesRes.value?.data    ?? []) : [],
      })
    }

    load()
  }, [])

  if (!pageData) return <Loading />

  return (
    <ActivitiesContent
      initialNews={pageData.initialNews}
      overview={pageData.overview}
      crimeTypes={pageData.crimeTypes}
      sources={pageData.sources}
    />
  )
}
