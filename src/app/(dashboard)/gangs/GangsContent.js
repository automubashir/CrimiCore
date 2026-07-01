'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import GangFilterBar from '@/components/gangs/GangFilterBar/GangFilterBar'
import GangTable, { GangTableSkeleton } from '@/components/gangs/GangTable/GangTable'
import GangOverview from '@/components/gangs/GangOverview/GangOverview'
import GangActivityTrend from '@/components/gangs/GangActivityTrend/GangActivityTrend'
import TopActivities from '@/components/gangs/TopActivities/TopActivities'
import NotFound from '@/components/ui/NotFound/NotFound'
import { Bone, SidebarCardSkeleton, DonutBodySkeleton, ListBodySkeleton, ChartBodySkeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './gangs.module.css'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function mapGang(g) {
  const crimesRaw = g.top_crime_types ?? []
  return {
    id:                encodeURIComponent((g.affiliation ?? '').toLowerCase()),
    name:              toTitleCase(g.affiliation ?? ''),
    alias:             null,
    image:             null,
    activeRegions:     g.top_location ? toTitleCase(g.top_location) : '—',
    members:           g.unique_criminal_count ?? g.doc_count ?? 0,
    threat:            g.threat_level ? g.threat_level.toLowerCase() : null,
    primaryActivities: crimesRaw.slice(0, 3),
    extraCount:        Math.max(0, crimesRaw.length - 3),
  }
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort()
}

const PAGE_SIZE = 50

export default function GangsContent() {
  // ── Gangs list ─────────────────────────────────────────────────────
  // /api/affiliations only accepts `location` and returns the full sorted
  // list in one call, so threat/crime-type filtering + pagination are
  // handled client-side.
  const [apiFilters,   setApiFilters]   = useState({})
  const [allGangs,     setAllGangs]     = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingList,  setLoadingList]  = useState(true)
  const [search,       setSearch]       = useState('')

  // ── Independent stats / sidebar slices (undefined = still loading) ──
  const [overview,       setOverview]       = useState(undefined)
  const [crimeTypesData, setCrimeTypesData] = useState(undefined)
  const [timelineData,   setTimelineData]   = useState(undefined)

  const fetchIdRef = useRef(0)

  // Re-fetch only when the location filter changes (the one server-side param).
  useEffect(() => {
    const id = ++fetchIdRef.current
    setLoadingList(true)
    setAllGangs([])

    apiFetch('/api/affiliations' + buildQuery({ location: apiFilters.location ?? 'all' }))
      .then(data => {
        if (fetchIdRef.current !== id) return
        setAllGangs((data?.data ?? []).map(mapGang))
      })
      .catch(() => { if (fetchIdRef.current === id) setAllGangs([]) })
      .finally(() => { if (fetchIdRef.current === id) setLoadingList(false) })
  }, [apiFilters.location])

  // Reset client-side pagination when the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [apiFilters.threat_level, apiFilters.crime_type, apiFilters.location, search])

  // Stats + sidebar widgets (load once, independently)
  useEffect(() => {
    apiFetch('/api/analytics/overview')
      .then(setOverview).catch(() => setOverview(null))
    apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 10 }))
      .then(r => setCrimeTypesData(r?.data ?? [])).catch(() => setCrimeTypesData([]))
    apiFetch('/api/analytics/timeline' + buildQuery({ interval: 'month' }))
      .then(r => setTimelineData(r?.data ?? [])).catch(() => setTimelineData([]))
  }, [])

  function handleSeeMore() {
    setVisibleCount(c => c + PAGE_SIZE)
  }

  // ── Derived stats / sidebar data ──────────────────────────────────
  const threatCounts = allGangs.reduce((acc, g) => {
    if      (g.threat === 'high')   acc.high++
    else if (g.threat === 'medium') acc.medium++
    else if (g.threat === 'low')    acc.low++
    return acc
  }, { high: 0, medium: 0, low: 0 })

  const total  = overview?.total_affiliations ?? allGangs.length
  const stats  = { total, ...threatCounts }
  const loaded = allGangs.length || 1
  const pieStats = {
    total,
    high:   { count: threatCounts.high,   pct: Math.round((threatCounts.high   / loaded) * 100) },
    medium: { count: threatCounts.medium, pct: Math.round((threatCounts.medium / loaded) * 100) },
    low:    { count: threatCounts.low,    pct: Math.round((threatCounts.low    / loaded) * 100) },
  }

  const crimeTypes = (crimeTypesData ?? []).map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.doc_count ?? 0 }))

  const trendData = (timelineData ?? []).slice(-8).map(point => {
    const bt  = point.by_threat_level ?? []
    const get = lvl => bt.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
    return {
      date:   new Date(point.date).toLocaleString('en-US', { month: 'short' }),
      high:   get('high'),
      medium: get('medium'),
      low:    get('low'),
    }
  })

  // Options derived from currently loaded data
  const crimeTypeOptions = useMemo(() =>
    ['All Crime Types', ...unique(allGangs.flatMap(g => g.primaryActivities ?? []))],
    [allGangs])

  // Client-side filters (threat / crime type / search) — /api/affiliations
  // only filters by location server-side.
  const filtered = useMemo(() => {
    let list = allGangs
    if (apiFilters.threat_level) {
      list = list.filter(g => g.threat === apiFilters.threat_level)
    }
    if (apiFilters.crime_type) {
      const ct = apiFilters.crime_type.toLowerCase()
      list = list.filter(g => (g.primaryActivities ?? []).some(a => a.toLowerCase().includes(ct)))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.activeRegions.toLowerCase().includes(q) ||
        (g.primaryActivities ?? []).some(a => a.toLowerCase().includes(q))
      )
    }
    return list
  }, [allGangs, apiFilters.threat_level, apiFilters.crime_type, search])

  const visibleGangs = filtered.slice(0, visibleCount)
  const hasMore      = filtered.length > visibleCount

  // Stats need both the (filtered) gang list and the global total.
  const statsLoading = loadingList || overview === undefined

  return (
    <main className={styles.page}>
      <div className={styles.layout}>

        {/* ── Left: main content ── */}
        <div className={styles.main}>
          <div className={styles.mainCard}>

            <div className={styles.mainCardHeader}>
              <div className={styles.headingGroup}>
                <h1 className={styles.mainCardTitle}>Gangs Directory</h1>
                <p className={styles.mainCardSubtitle}>
                  Detailed information on criminal gangs, networks and their operations.
                </p>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.totalBadge}>
                  {overview === undefined
                    ? <Bone width={48} height={20} />
                    : <span className={styles.totalNum}>{stats.total.toLocaleString()}</span>}
                  <span className={styles.totalLabel}>Total Gangs</span>
                </div>
                <div className={styles.updatedLine}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.updatedText}>Updated just now</span>
                </div>
                {/* <button className={styles.addBtn} type="button">
                  Add New Gang
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button> */}
              </div>
            </div>

            <div className={styles.filterSection}>
              <GangFilterBar
                onSearch={setSearch}
                onFilterChange={setApiFilters}
                crimeTypeOptions={crimeTypeOptions}
              />
            </div>

            <div className={styles.statsRow}>
              {statsLoading ? (
                Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard iconColor="brand"   value={stats.total}  label="Total Gangs" />
                  <StatCard iconColor="error"   value={stats.high}   label="High Threat" />
                  <StatCard iconColor="alert"   value={stats.medium} label="Medium Threat" />
                  <StatCard iconColor="success" value={stats.low}    label="Low Threat" />
                </>
              )}
            </div>

            {loadingList ? (
              <GangTableSkeleton />
            ) : allGangs.length === 0 ? (
              <NotFound title="No gangs found" message="No gang data is available right now." />
            ) : (
              <GangTable
                gangs={visibleGangs}
                hasMore={hasMore}
                loading={false}
                onSeeMore={handleSeeMore}
              />
            )}

          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          {statsLoading
            ? <SidebarCardSkeleton title="Activity Overview"><DonutBodySkeleton /></SidebarCardSkeleton>
            : <GangOverview pieStats={pieStats} />}

          {timelineData === undefined
            ? <SidebarCardSkeleton title="Gang Activity Trend"><ChartBodySkeleton height={200} /></SidebarCardSkeleton>
            : <GangActivityTrend trendData={trendData} />}

          {crimeTypesData === undefined
            ? <SidebarCardSkeleton title="Top Activities Overall"><ListBodySkeleton rows={5} /></SidebarCardSkeleton>
            : <TopActivities crimeTypes={crimeTypes} />}
        </aside>
      </div>
    </main>
  )
}

function StatCard({ iconColor, value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`statIcon_${iconColor}`]}`}>
        <GroupIcon />
      </div>
      <div className={styles.statText}>
        <span className={styles.statValue}>{(value ?? 0).toLocaleString()}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className={styles.statCard}>
      <Bone width={44} height={44} style={{ borderRadius: 'var(--radius-md)' }} />
      <div className={styles.statText} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bone width={56} height={20} />
        <Bone width={80} height={12} />
      </div>
    </div>
  )
}

function GroupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
