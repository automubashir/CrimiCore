'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import CriminalFilterBar from '@/components/criminals/CriminalFilterBar/CriminalFilterBar'
import CriminalTable, { CriminalTableSkeleton } from '@/components/criminals/CriminalTable/CriminalTable'
import ThreatDistribution from '@/components/criminals/ThreatDistribution/ThreatDistribution'
import CriminalTopActivities from '@/components/criminals/CriminalTopActivities/CriminalTopActivities'
import CriminalWatchlist from '@/components/criminals/CriminalWatchlist/CriminalWatchlist'
import RecentAdditions from '@/components/criminals/RecentAdditions/RecentAdditions'
import NotFound from '@/components/ui/NotFound/NotFound'
import { Bone, SidebarCardSkeleton, DonutBodySkeleton, ListBodySkeleton, PersonListSkeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './criminals.module.css'

function toTitleCase(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function mapCriminal(c) {
  const crimes = (c.crimeType ?? '').split(',').map(s => s.trim()).filter(Boolean)
  return {
    id:            encodeURIComponent((c.criminalName ?? '').toLowerCase()),
    name:          toTitleCase(c.criminalName ?? ''),
    alias:         '—',
    gang:          toTitleCase(c.affiliation ?? '—'),
    image:         c.imageUrl ?? null,
    threat:        c.threat_level?.toLowerCase() ?? null,
    activeRegions: toTitleCase(c.country ?? c.location ?? '—'),
    regionCount:   '—',
    crimes:        crimes.slice(0, 2),
    extraCount:    Math.max(0, crimes.length - 2),
  }
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

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort()
}

export default function CriminalsContent() {
  // ── Criminals list (its own fetch; reruns on filter change) ────────
  const [apiFilters,   setApiFilters]   = useState({})
  const [allCriminals, setAllCriminals] = useState([])
  const [currentPage,  setCurrentPage]  = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [loadingList,  setLoadingList]  = useState(true)
  const [search,       setSearch]       = useState('')

  // ── Independent stats / sidebar slices (undefined = still loading) ──
  const [overview,        setOverview]        = useState(undefined)
  const [crimeTypesData,  setCrimeTypesData]  = useState(undefined)
  const [sidebarCriminals, setSidebarCriminals] = useState(undefined)

  const fetchIdRef = useRef(0)

  // Initial + filter-driven list fetch (page 1)
  useEffect(() => {
    const id = ++fetchIdRef.current
    setLoadingList(true)
    setAllCriminals([])
    setCurrentPage(1)
    setHasMorePages(false)

    apiFetch('/api/criminals/filter' + buildQuery({ ...apiFilters, page: 1 }))
      .then(data => {
        if (fetchIdRef.current !== id) return
        const items = (data.all_criminal ?? []).map(mapCriminal)
        setAllCriminals(items)
        setHasMorePages(items.length > 0)
      })
      .catch(() => { if (fetchIdRef.current === id) { setAllCriminals([]); setHasMorePages(false) } })
      .finally(() => { if (fetchIdRef.current === id) setLoadingList(false) })
  }, [apiFilters])

  // Stats + sidebar widgets (load once, independently)
  useEffect(() => {
    apiFetch('/api/analytics/overview')
      .then(setOverview).catch(() => setOverview(null))
    apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 10 }))
      .then(r => setCrimeTypesData(r?.data ?? [])).catch(() => setCrimeTypesData([]))
    apiFetch('/api/analytics/top-criminals' + buildQuery({ size: 10 }))
      .then(r => setSidebarCriminals(r?.data ?? [])).catch(() => setSidebarCriminals([]))
  }, [])

  async function handleSeeMore() {
    if (loadingMore || !hasMorePages) return
    const nextPage = currentPage + 1
    setLoadingMore(true)
    try {
      const data = await apiFetch('/api/criminals/filter' + buildQuery({ ...apiFilters, page: nextPage }))
      const newItems = (data.all_criminal ?? []).map(mapCriminal)
      setAllCriminals(prev => [...prev, ...newItems])
      setCurrentPage(nextPage)
      setHasMorePages(newItems.length > 0)
    } catch {
      setHasMorePages(false)
    } finally {
      setLoadingMore(false)
    }
  }

  // ── Derived stats / sidebar data ──────────────────────────────────
  // overview.by_threat_level entries expose `count` (not criminal_count).
  const threatCount = lvl =>
    overview?.by_threat_level?.find(x => x.threat_level?.toLowerCase() === lvl)?.count ?? 0
  const high   = threatCount('high')
  const medium = threatCount('medium')
  const low    = threatCount('low')
  const total  = overview?.total_criminals ?? 0
  const stats  = { total, high, medium, low }
  const loaded = total || 1
  const pieStats = {
    total,
    high:   { count: high,   pct: Math.round((high   / loaded) * 100) },
    medium: { count: medium, pct: Math.round((medium / loaded) * 100) },
    low:    { count: low,    pct: Math.round((low    / loaded) * 100) },
  }

  const crimeTypes      = (crimeTypesData ?? []).map((c, i) => ({ rank: i + 1, name: c.crime_type, count: c.doc_count ?? 0 }))
  const topCriminals    = (sidebarCriminals ?? []).slice(0, 5).map(mapTopCriminal)
  const recentCriminals = (sidebarCriminals ?? []).slice(5, 10).map(mapTopCriminal)

  // Options derived from currently loaded list
  const crimeTypeOptions = useMemo(() =>
    ['All Crime Types', ...unique(allCriminals.flatMap(c => c.crimes ?? []))],
    [allCriminals])

  const gangOptions = useMemo(() =>
    unique(allCriminals.map(c => c.gang).filter(g => g !== '—')),
    [allCriminals])

  // Client-side search only
  const filtered = useMemo(() => {
    if (!search.trim()) return allCriminals
    const q = search.trim().toLowerCase()
    return allCriminals.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.alias.toLowerCase().includes(q) ||
      c.gang.toLowerCase().includes(q) ||
      c.activeRegions.toLowerCase().includes(q) ||
      (c.crimes ?? []).some(cr => cr.toLowerCase().includes(q))
    )
  }, [allCriminals, search])

  return (
    <main className={styles.page}>
      <div className={styles.layout}>

        {/* ── Left: main content ── */}
        <div className={styles.main}>
          <div className={styles.mainCard}>

            {/* Header */}
            <div className={styles.mainCardHeader}>
              <div className={styles.headingGroup}>
                <h1 className={styles.mainCardTitle}>Criminals Directory</h1>
                <p className={styles.mainCardSubtitle}>
                  Detailed information about all the criminals in our system
                </p>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.totalBadge}>
                  {overview === undefined
                    ? <Bone width={48} height={20} />
                    : <span className={styles.totalNum}>{stats.total.toLocaleString()}</span>}
                  <span className={styles.totalLabel}>Total Criminals</span>
                </div>
                <div className={styles.updatedLine}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.updatedText}>Updated just now</span>
                </div>
                <button className={styles.addBtn} type="button">
                  Add New Criminal
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className={styles.filterSection}>
              <CriminalFilterBar
                onSearch={setSearch}
                onFilterChange={setApiFilters}
                gangOptions={gangOptions}
                crimeTypeOptions={crimeTypeOptions}
              />
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              {overview === undefined ? (
                Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard iconColor="brand"   value={stats.total}  label="Total Criminals" />
                  <StatCard iconColor="error"   value={stats.high}   label="High Threat" />
                  <StatCard iconColor="alert"   value={stats.medium} label="Medium Threat" />
                  <StatCard iconColor="success" value={stats.low}    label="Low Threat" />
                </>
              )}
            </div>

            {/* Table */}
            {loadingList ? (
              <CriminalTableSkeleton />
            ) : allCriminals.length === 0 ? (
              <NotFound title="No criminals found" message="No criminal data is available right now." />
            ) : (
              <CriminalTable
                criminals={filtered}
                hasMore={hasMorePages}
                loading={loadingMore}
                onSeeMore={handleSeeMore}
              />
            )}

          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          {overview === undefined
            ? <SidebarCardSkeleton title="Threat Distribution"><DonutBodySkeleton /></SidebarCardSkeleton>
            : <ThreatDistribution pieStats={pieStats} />}

          {crimeTypesData === undefined
            ? <SidebarCardSkeleton title="Top Activities"><ListBodySkeleton rows={5} /></SidebarCardSkeleton>
            : <CriminalTopActivities crimeTypes={crimeTypes} />}

          {sidebarCriminals === undefined
            ? <SidebarCardSkeleton title="Watchlist"><PersonListSkeleton rows={5} /></SidebarCardSkeleton>
            : <CriminalWatchlist topCriminals={topCriminals} />}

          {sidebarCriminals === undefined
            ? <SidebarCardSkeleton title="Recent Additions"><PersonListSkeleton rows={5} /></SidebarCardSkeleton>
            : <RecentAdditions recentCriminals={recentCriminals} />}
        </aside>

      </div>
    </main>
  )
}

function StatCard({ iconColor, value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`statIcon_${iconColor}`]}`}>
        <PersonIcon />
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

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
