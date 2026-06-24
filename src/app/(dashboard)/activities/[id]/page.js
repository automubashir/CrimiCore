'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch, buildQuery } from '@/lib/api'
import ActivityDetailContent from './ActivityDetailContent'
import NotFound from '@/components/ui/NotFound/NotFound'
import Loading from './loading'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function shortSummary(text, maxLen = 200) {
  if (!text) return ''
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const last = cut.lastIndexOf(' ')
  return (last > 0 ? cut.slice(0, last) : cut) + '…'
}

export function generateStaticParams() { return [] }

export default function ActivityDetailPage() {
  const { id } = useParams()
  const newsLink = decodeURIComponent(id)
  const [pageData, setPageData] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const [newsResult, locationsResult] = await Promise.allSettled([
        apiFetch('/api/news' + buildQuery({ news_link: newsLink })),
        apiFetch('/api/analytics/by-location' + buildQuery({ size: 5 })),
      ])

      if (newsResult.status === 'rejected' || !newsResult.value?.news) {
        setNotFound(true)
        return
      }

      const { news, similar_news = [] } = newsResult.value
      const locationData = locationsResult.status === 'fulfilled'
        ? (locationsResult.value?.data ?? [])
        : []

      let locationNews = []
      if (news.country) {
        try {
          const locNewsData = await apiFetch('/api/news/filter' + buildQuery({ location: news.country, page: 1 }))
          locationNews = (locNewsData?.all_news ?? []).filter(
            item => (item.news?.news_link ?? item.news?.link) !== newsLink
          )
        } catch { /* leave empty */ }
      }

      const firstCrime    = news.crimeType?.split(',')[0]?.trim() ?? 'General'
      const category      = firstCrime.toLowerCase().replace(/\s+/g, '-')
      const crimeTypeTags = news.crimeType?.split(',').map(s => s.trim()).filter(Boolean) ?? []

      const activity = {
        title:             news.title ?? 'Untitled',
        category,
        categoryLabel:     firstCrime,
        location:          news.country ?? '—',
        date:              formatDate(news.published_date),
        source:            news.source ?? '—',
        reportingAgency:   news.source ?? '—',
        datePublished:     formatDate(news.published_date),
        author:            news.published_by ?? null,
        newsLink:          news.link ?? newsLink,
        locationCity:      '—',
        locationCountry:   news.country ?? '—',
        summary:           shortSummary(news.description),
        fullText:          news.description ? [news.description] : [],
        gallery:           news.thumbnail ? [news.thumbnail] : [],
        threatLevel:       null,
        tags:              crimeTypeTags,
        criminals:         null,
        criminalsInvolved: [],
      }

      const relatedNews = similar_news.slice(0, 3).map((n, i) => ({
        id:          i,
        title:       n.title ?? '—',
        date:        formatDate(n.published_date),
        image:       null,
        location:    '—',
        threatLevel: 'low',
      }))

      setPageData({ activity, relatedNews, similarNews: similar_news, locationData, locationNews })
    }

    load()
  }, [newsLink])

  if (notFound) return <NotFound title="Activity not found" message="This activity could not be loaded." />
  if (!pageData) return <Loading />

  return (
    <ActivityDetailContent
      activity={pageData.activity}
      relatedNews={pageData.relatedNews}
      similarNews={pageData.similarNews}
      locationData={pageData.locationData}
      locationNews={pageData.locationNews}
    />
  )
}
