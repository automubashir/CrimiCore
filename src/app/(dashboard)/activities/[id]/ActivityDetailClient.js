'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
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

export default function ActivityDetailClient() {
  const params = useParams()
  const newsLink = decodeURIComponent(params?.id ?? '_')
  const [pageData, setPageData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [locationData, setLocationData] = useState([]) // map coords filled in after geocode

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
      const rawLocations = locationsResult.status === 'fulfilled'
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

      setPageData({ activity, relatedNews, similarNews: similar_news, locationNews })
      setLocationData(rawLocations)

      // Geocode the locations-tab map in the background (it's not the default
      // tab, so it must never block the article from rendering).
      geocodeAll(rawLocations.map(l => l.location ?? ''))
        .then(coordMap => setLocationData(rawLocations.map(l => {
          const c = coordMap[(l.location ?? '').trim().toLowerCase()]
          return c ? { ...l, lat: c.lat, lng: c.lng } : l
        })))
        .catch(() => {})
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
      locationData={locationData}
      locationNews={pageData.locationNews}
    />
  )
}
