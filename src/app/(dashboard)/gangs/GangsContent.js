'use client'

import { useState, useMemo } from 'react'
import GangFilterBar from '@/components/gangs/GangFilterBar/GangFilterBar'
import GangTable from '@/components/gangs/GangTable/GangTable'
import GangOverview from '@/components/gangs/GangOverview/GangOverview'
import GangActivityTrend from '@/components/gangs/GangActivityTrend/GangActivityTrend'
import TopActivities from '@/components/gangs/TopActivities/TopActivities'
import NotFound from '@/components/ui/NotFound/NotFound'
import styles from './gangs.module.css'

const PAGE_SIZE = 8

export default function GangsContent({
  affiliations     = [],
  stats            = { total: 0, high: 0, medium: 0, low: 0 },
  pieStats,
  crimeTypes       = [],
  trendData        = [],
  countryOptions   = [],
  crimeTypeOptions = [],
}) {
  const [search,       setSearch]       = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filters,      setFilters]      = useState({
    country:     'All Countries',
    crimeType:   'All Crime Types',
    threatLevel: 'Any',
    criminal:    'All Criminals',
    region:      'Any',
  })

  const filtered = useMemo(() => {
    setVisibleCount(PAGE_SIZE)
    let result = affiliations

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.activeRegions.toLowerCase().includes(q) ||
        (g.alias && g.alias.toLowerCase().includes(q)) ||
        (g.primaryActivities ?? []).some(a => a.toLowerCase().includes(q))
      )
    }

    if (filters.threatLevel !== 'Any')
      result = result.filter(g => g.threat === filters.threatLevel.toLowerCase())

    if (filters.country !== 'All Countries')
      result = result.filter(g => g.activeRegions.toLowerCase().includes(filters.country.toLowerCase()))

    if (filters.crimeType !== 'All Crime Types')
      result = result.filter(g =>
        (g.primaryActivities ?? []).some(a => a.toLowerCase().includes(filters.crimeType.toLowerCase()))
      )

    return result
  }, [affiliations, search, filters])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <main className={styles.page}>
      <div className={styles.layout}>

        {/* ── Left: main content ── */}
        <div className={styles.main}>
          <div className={styles.mainCard}>

            {/* Header */}
            <div className={styles.mainCardHeader}>
              <div className={styles.headingGroup}>
                <h1 className={styles.mainCardTitle}>Gangs Directory</h1>
                <p className={styles.mainCardSubtitle}>
                  Detailed information on criminal gangs, networks and their operations.
                </p>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.totalBadge}>
                  <span className={styles.totalNum}>{stats.total.toLocaleString()}</span>
                  <span className={styles.totalLabel}>Total Gangs</span>
                </div>
                <div className={styles.updatedLine}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.updatedText}>Updated just now</span>
                </div>
                <button className={styles.addBtn} type="button">
                  Add New Gang
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className={styles.filterSection}>
              <GangFilterBar
                onSearch={setSearch}
                onFilterChange={setFilters}
                countryOptions={countryOptions}
                crimeTypeOptions={crimeTypeOptions}
              />
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <StatCard iconColor="brand"   value={stats.total}  label="Total Gangs" />
              <StatCard iconColor="error"   value={stats.high}   label="High Threat" />
              <StatCard iconColor="alert"   value={stats.medium} label="Medium Threat" />
              <StatCard iconColor="success" value={stats.low}    label="Low Threat" />
            </div>

            {/* Table */}
            {affiliations.length === 0 ? (
              <NotFound title="No gangs found" message="No gang data is available right now." />
            ) : (
              <GangTable
                gangs={visible}
                hasMore={hasMore}
                onSeeMore={() => setVisibleCount(c => c + PAGE_SIZE)}
              />
            )}

          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          <GangOverview pieStats={pieStats} />
          <GangActivityTrend trendData={trendData} />
          <TopActivities crimeTypes={crimeTypes} />
        </aside>
      </div>
    </main>
  )
}

/* ── Internal stat card ── */
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
