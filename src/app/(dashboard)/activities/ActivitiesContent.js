'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import ActivityCard, { ActivityCardSkeleton } from '@/components/activities/ActivityCard/ActivityCard'
import ActivitiesFilterBar from '@/components/activities/ActivitiesFilterBar/ActivitiesFilterBar'
import ActivityOverview from '@/components/activities/ActivityOverview/ActivityOverview'
import QuickFilters from '@/components/activities/QuickFilters/QuickFilters'
import CrimeTags from '@/components/activities/CrimeTags/CrimeTags'
import DataSources from '@/components/activities/DataSources/DataSources'
import NotFound from '@/components/ui/NotFound/NotFound'
import { SidebarCardSkeleton, DonutBodySkeleton, SimpleRowsSkeleton, TagsBodySkeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './activities.module.css'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function ActivitiesContent() {
  // ── API filter state (set by ActivitiesFilterBar) ─────────────────
  const [apiFilters,   setApiFilters]   = useState({})

  // ── News list state ───────────────────────────────────────────────
  const [allNews,      setAllNews]      = useState([])
  const [apiPage,      setApiPage]      = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [loadingList,  setLoadingList]  = useState(true)

  // ── Independent sidebar slices (undefined = still loading) ─────────
  const [overview,       setOverview]       = useState(undefined)
  const [crimeTypesData, setCrimeTypesData] = useState(undefined)
  const [sourcesData,    setSourcesData]    = useState(undefined)

  // ── Frontend search only ──────────────────────────────────────────
  const [search, setSearch] = useState('')

  // A clicked Crime Tag drives the crime-type filter + scrolls to the list.
  const [pickedCrime, setPickedCrime] = useState(null)
  const listRef = useRef(null)

  const fetchIdRef = useRef(0)

  function handleCrimeTagSelect(tag) {
    setPickedCrime(tag)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Initial + filter-driven list fetch (page 1)
  useEffect(() => {
    const id = ++fetchIdRef.current
    setLoadingList(true)
    setAllNews([])
    setApiPage(1)
    setHasMorePages(false)

    apiFetch('/api/news/filter' + buildQuery({ ...apiFilters, page: 1 }))
      .then(data => {
        if (fetchIdRef.current !== id) return
        const items = data.all_news ?? []
        setAllNews(items)
        setHasMorePages(items.length > 0)
      })
      .catch(() => { if (fetchIdRef.current === id) { setAllNews([]); setHasMorePages(false) } })
      .finally(() => { if (fetchIdRef.current === id) setLoadingList(false) })
  }, [apiFilters])

  // Sidebar widgets (load once, independently)
  useEffect(() => {
    apiFetch('/api/analytics/overview')
      .then(setOverview).catch(() => setOverview(null))
    apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 12 }))
      .then(r => setCrimeTypesData(r?.data ?? [])).catch(() => setCrimeTypesData([]))
    apiFetch('/api/analytics/by-source' + buildQuery({ size: 8 }))
      .then(r => setSourcesData(r?.data ?? [])).catch(() => setSourcesData([]))
  }, [])

  const crimeTypes = crimeTypesData ?? []
  const sources    = sourcesData ?? []

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiFetch('/api/news/filter' + buildQuery({ ...apiFilters, page: apiPage + 1 }))
      if (data.all_news?.length > 0) {
        setAllNews(prev => [...prev, ...data.all_news])
        setApiPage(p => p + 1)
      } else {
        setHasMorePages(false)
      }
    } catch {
      setHasMorePages(false)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMorePages, loadingMore, apiFilters, apiPage])

  // Options derived from currently loaded data
  const crimeTypeOptions = useMemo(() =>
    ['All Crime Types', ...unique(allNews.flatMap(item =>
      item.news?.crimeType?.split(',').map(s => s.trim()) ?? []))],
    [allNews])

  const gangOptions = useMemo(() =>
    ['Any', ...unique(allNews.flatMap(item =>
      item.news?.affiliation?.split(',').map(s => s.trim()) ?? []))],
    [allNews])

  // Client-side search on top of API results
  const filtered = useMemo(() => {
    if (!search.trim()) return allNews
    const q = search.toLowerCase()
    return allNews.filter(item => {
      const n = item.news
      return n.title?.toLowerCase().includes(q) ||
             n.description?.toLowerCase().includes(q) ||
             n.country?.toLowerCase().includes(q)
    })
  }, [allNews, search])

  const isFiltered  = filtered.length < allNews.length
  const totalLabel  = overview?.total_articles?.toLocaleString() ?? allNews.length.toLocaleString()
  const today       = useMemo(() => todayCount(allNews), [allNews])

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        {/* ── Left: main content ── */}
        <div className={styles.main} ref={listRef}>
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
                onFilterChange={setApiFilters}
                crimeTypeOptions={crimeTypeOptions}
                gangOptions={gangOptions}
                externalCrimeType={pickedCrime}
              />
            </div>

            {allNews.length > 0 && (
              <div className={styles.resultsBar}>
                <span className={styles.resultsText}>
                  {isFiltered
                    ? `${filtered.length} results`
                    : `${allNews.length.toLocaleString()} of ${totalLabel} activities loaded`
                  }
                </span>
              </div>
            )}

            <div className={styles.activityList}>
              {loadingList ? (
                Array.from({ length: 5 }, (_, i) => <ActivityCardSkeleton key={i} />)
              ) : allNews.length === 0 ? (
                <NotFound title="No activities found" message="No crime activity data is available right now." />
              ) : filtered.length > 0 ? (
                filtered.map(item => <ActivityCard key={item.news?.news_link ?? item.news?.link} {...mapNews(item)} />)
              ) : (
                <div className={styles.empty}>No activities match your search.</div>
              )}
            </div>

            {!loadingList && hasMorePages && !isFiltered && (
              <div className={styles.seeMoreBar}>
                <button className={styles.seeMoreBtn} type="button" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'See More'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          {crimeTypesData === undefined
            ? <SidebarCardSkeleton title="Activity Overview"><DonutBodySkeleton rows={6} /></SidebarCardSkeleton>
            : <ActivityOverview crimeTypes={crimeTypes} />}

          {overview === undefined
            ? <SidebarCardSkeleton title="Quick Filters"><SimpleRowsSkeleton rows={3} /></SidebarCardSkeleton>
            : <QuickFilters overview={overview} todayCount={today} />}

          {crimeTypesData === undefined
            ? <SidebarCardSkeleton title="Crime Tags"><TagsBodySkeleton count={10} /></SidebarCardSkeleton>
            : <CrimeTags crimeTypes={crimeTypes} onSelect={handleCrimeTagSelect} />}

          {sourcesData === undefined
            ? <SidebarCardSkeleton title="Data Sources:"><SimpleRowsSkeleton rows={6} /></SidebarCardSkeleton>
            : <DataSources sources={sources} />}
        </aside>
      </div>
    </main>
  )
}
