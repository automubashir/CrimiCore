'use client'

import { useState, useMemo, useCallback } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import ActivityCard from '@/components/activities/ActivityCard/ActivityCard'
import ActivitiesFilterBar from '@/components/activities/ActivitiesFilterBar/ActivitiesFilterBar'
import ActivityOverview from '@/components/activities/ActivityOverview/ActivityOverview'
import QuickFilters from '@/components/activities/QuickFilters/QuickFilters'
import CrimeTags from '@/components/activities/CrimeTags/CrimeTags'
import DataSources from '@/components/activities/DataSources/DataSources'
import NotFound from '@/components/ui/NotFound/NotFound'
import styles from './activities.module.css'

const PAGE_SIZE = 5

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parseDateFrom(range) {
  // "Feb 01 - 2024" → Date object for Feb 1 2024
  const m = range?.match(/^(\w+)\s+(\d+)\s+-\s+(\d{4})$/)
  if (!m) return null
  return new Date(`${m[1]} ${m[2]}, ${m[3]}`)
}

function mapNews(item) {
  const n = item.news
  const firstCrime = n.crimeType?.split(',')[0]?.trim() ?? 'General'
  const category   = firstCrime.toLowerCase().replace(/\s+/g, '-')
  const newsLink   = n.news_link ?? n.link ?? ''
  return {
    id:            encodeURIComponent(newsLink),
    image:         n.thumbnail,
    reporter:      null,
    category,
    categoryLabel: firstCrime,
    title:         n.title ?? '—',
    description:   n.description ?? '',
    location:      n.country ?? '—',
    date:          formatDate(n.published_date),
    source:        n.source ?? '—',
    criminals:     item.criminal_count ?? null,
  }
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort()
}

function todayCount(news) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return news.filter(item => new Date(item.news?.published_date) >= start).length
}

export default function ActivitiesContent({ initialNews = [], overview = null, crimeTypes = [], sources = [] }) {
  const [allNews,      setAllNews]      = useState(initialNews)
  const [apiPage,      setApiPage]      = useState(1)
  const [hasMorePages, setHasMorePages] = useState(initialNews.length >= 100)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [search,       setSearch]       = useState('')
  const [filters,      setFilters]      = useState({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Derive dynamic filter options from loaded news
  const crimeTypeOptions = useMemo(() =>
    ['All Crime Types', ...unique(allNews.flatMap(item =>
      item.news?.crimeType?.split(',').map(s => s.trim()) ?? []))],
    [allNews])

  const gangOptions = useMemo(() =>
    ['Any', ...unique(allNews.flatMap(item =>
      item.news?.affiliation?.split(',').map(s => s.trim()) ?? []))],
    [allNews])

  const countryOptions = useMemo(() =>
    ['Any', ...unique(allNews.map(item => item.news?.country))],
    [allNews])

  const filtered = useMemo(() => {
    setVisibleCount(PAGE_SIZE)
    return allNews.filter(item => {
      const n = item.news
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!n.title?.toLowerCase().includes(q) &&
            !n.description?.toLowerCase().includes(q) &&
            !n.country?.toLowerCase().includes(q)) return false
      }
      if (filters.crimeType && filters.crimeType !== 'All Crime Types') {
        if (!n.crimeType?.includes(filters.crimeType)) return false
      }
      if (filters.gangs && filters.gangs !== 'Any') {
        if (!n.affiliation?.toLowerCase().includes(filters.gangs.toLowerCase())) return false
      }
      if (filters.country && filters.country !== 'Any') {
        if (n.country?.toLowerCase() !== filters.country.toLowerCase()) return false
      }
      if (filters.dateRange) {
        const from = parseDateFrom(filters.dateRange)
        if (from && new Date(n.published_date) < from) return false
      }
      return true
    })
  }, [allNews, search, filters])

  const visible  = filtered.slice(0, visibleCount).map(mapNews)
  const hasMore  = visibleCount < filtered.length || hasMorePages

  const handleSeeMore = useCallback(async () => {
    if (visibleCount < filtered.length) {
      setVisibleCount(c => c + PAGE_SIZE)
      return
    }
    if (!hasMorePages || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiFetch('/api/news/filter' + buildQuery({ page: apiPage + 1 }))
      if (data.all_news?.length > 0) {
        setAllNews(prev => [...prev, ...data.all_news])
        setApiPage(p => p + 1)
        setVisibleCount(c => c + PAGE_SIZE)
      } else {
        setHasMorePages(false)
      }
    } catch {
      setHasMorePages(false)
    } finally {
      setLoadingMore(false)
    }
  }, [visibleCount, filtered.length, hasMorePages, loadingMore, apiPage])

  const isFiltered  = filtered.length < allNews.length
  const totalLabel  = overview?.total_articles?.toLocaleString() ?? allNews.length.toLocaleString()
  const today       = useMemo(() => todayCount(allNews), [allNews])

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        {/* ── Left: main content ── */}
        <div className={styles.main}>
          <div className={styles.mainCard}>
            <div className={styles.mainCardHeader}>
              <div className={styles.headingGroup}>
                <h1 className={styles.mainCardTitle}>Crime News &amp; Activities</h1>
                <p className={styles.mainCardSubtitle}>
                  Realtime updates from verified sources worldwide
                </p>
              </div>
              <button className={styles.viewAllBtn} type="button">View All</button>
            </div>

            <div className={styles.filterSection}>
              <ActivitiesFilterBar
                onSearch={setSearch}
                onFilterChange={setFilters}
                crimeTypeOptions={crimeTypeOptions}
                gangOptions={gangOptions}
                countryOptions={countryOptions}
              />
            </div>

            {allNews.length > 0 && (
              <div className={styles.resultsBar}>
                <span className={styles.resultsText}>
                  {isFiltered
                    ? `Showing 1–${Math.min(visibleCount, filtered.length)} of ${filtered.length} results`
                    : `Showing 1–${Math.min(visibleCount, filtered.length)} of ${totalLabel} activities`
                  }
                </span>
              </div>
            )}

            <div className={styles.activityList}>
              {allNews.length === 0 ? (
                <NotFound title="No activities found" message="No crime activity data is available right now." />
              ) : visible.length > 0 ? (
                visible.map(activity => (
                  <ActivityCard key={activity.id} {...activity} />
                ))
              ) : (
                <div className={styles.empty}>No activities match your search.</div>
              )}
            </div>

            {hasMore && (
              <div className={styles.seeMoreBar}>
                <button
                  className={styles.seeMoreBtn}
                  type="button"
                  disabled={loadingMore}
                  onClick={handleSeeMore}
                >
                  {loadingMore ? 'Loading…' : 'See More'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          <ActivityOverview crimeTypes={crimeTypes} />
          <QuickFilters overview={overview} todayCount={today} />
          <CrimeTags crimeTypes={crimeTypes} />
          <DataSources sources={sources} />
        </aside>
      </div>
    </main>
  )
}
