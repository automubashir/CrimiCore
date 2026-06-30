'use client'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import { dateRangeToParams, DATE_RANGE_OPTIONS } from '@/lib/dateRange'
import COUNTRIES from '@/lib/countries'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterDropdown from '@/components/ui/FilterDropdown/FilterDropdown'
import NewsCard from '@/components/dashboard/NewsCard/NewsCard'
import NotFound from '@/components/ui/NotFound/NotFound'
import ScrollLoader from '@/components/ui/ScrollLoader/ScrollLoader'
import { NewsCardSkeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './RecentNewsSection.module.css'

const COUNTRY_OPTIONS = ['All', ...COUNTRIES]

function unique(arr) {
  return ['All', ...new Set(arr.filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b))
}

export default function RecentNewsSection({ news = [] }) {
  // ── API filter state ──────────────────────────────────────────────
  const [apiFilters, setApiFilters] = useState({})

  // ── News list state ───────────────────────────────────────────────
  const [allNews,         setAllNews]         = useState(news)
  const [apiPage,         setApiPage]         = useState(1)
  const [hasMorePages,    setHasMorePages]    = useState(news.length > 0)
  const [loadingFiltered, setLoadingFiltered] = useState(false)
  const [loadingMore,     setLoadingMore]     = useState(false)

  // ── Frontend-only filter ──────────────────────────────────────────
  const [search, setSearch] = useState('')

  // Prevent re-fetch on initial mount (pre-loaded data is already correct)
  const isFirstRender = useRef(true)
  // Race-condition guard: only apply results from the latest fetch
  const fetchIdRef = useRef(0)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }

    const id = ++fetchIdRef.current
    setLoadingFiltered(true)
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
      .finally(() => { if (fetchIdRef.current === id) setLoadingFiltered(false) })
  }, [apiFilters])

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiFetch('/api/news/filter' + buildQuery({ ...apiFilters, page: apiPage + 1 }))
      const items = data.all_news ?? []
      if (items.length > 0) {
        setAllNews(prev => [...prev, ...items])
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

  // ── Filter change handlers ────────────────────────────────────────
  function setFilter(key, value) {
    setApiFilters(prev => {
      const next = { ...prev }
      if (!value) delete next[key]
      else next[key] = value
      return next
    })
  }

  function handleCountry(val) {
    setFilter('location', val === 'All' ? null : val.toLowerCase())
  }

  function handleCrimeType(val) {
    setFilter('crime_type', val === 'All' ? null : val)
  }

  function handleGang(val) {
    setFilter('affiliation', val === 'All' ? null : val)
  }

  function handleDateRange(val) {
    setApiFilters(prev => {
      const next = { ...prev }
      delete next.from_date
      delete next.to_date
      return { ...next, ...dateRangeToParams(val) }
    })
  }

  // ── Derive options from loaded data ───────────────────────────────
  const crimeTypeOptions = useMemo(() =>
    unique(allNews.flatMap(n => n.news?.crimeType?.split(',').map(s => s.trim()) ?? [])),
    [allNews])

  const gangOptions = useMemo(() =>
    unique(allNews.flatMap(n => n.news?.affiliation?.split(',').map(s => s.trim()) ?? [])),
    [allNews])

  // ── Client-side search only ───────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return allNews
    const q = search.toLowerCase()
    return allNews.filter(item => {
      const n = item.news
      return n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)
    })
  }, [allNews, search])

  const isFiltered = filtered.length < allNews.length

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recent News</h2>
        <a href='/activities' className="linkButton">View all</a>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          <div className={styles.search}>
            <SearchInput placeholder="Search news..." onSearch={setSearch} />
          </div>
          <div className={styles.drops}>
            <FilterDropdown
              label="Country"
              options={COUNTRY_OPTIONS}
              onChange={handleCountry}
              scrollable
            />
            <FilterDropdown
              label="Crime Type"
              options={crimeTypeOptions}
              onChange={handleCrimeType}
              scrollable
            />
            <FilterDropdown
              label="Gang"
              options={gangOptions}
              onChange={handleGang}
              scrollable
            />
            <FilterDropdown
              label="Date Range"
              options={['All', ...DATE_RANGE_OPTIONS]}
              onChange={handleDateRange}
            />
          </div>
          <div className={styles.newsList}>
            {loadingFiltered ? (
              Array.from({ length: 5 }, (_, i) => <NewsCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <NotFound title="No news found" message="No articles match the current filters." />
            ) : (
              filtered.map((item, idx) => <NewsCard key={idx} item={item} />)
            )}
            {!loadingFiltered && (
              <ScrollLoader
                onLoad={handleLoadMore}
                loading={loadingMore}
                hasMore={hasMorePages && !isFiltered}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
