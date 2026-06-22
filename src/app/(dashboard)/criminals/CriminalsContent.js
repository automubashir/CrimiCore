'use client'

import { useState, useMemo } from 'react'
import CriminalFilterBar from '@/components/criminals/CriminalFilterBar/CriminalFilterBar'
import CriminalTable from '@/components/criminals/CriminalTable/CriminalTable'
import ThreatDistribution from '@/components/criminals/ThreatDistribution/ThreatDistribution'
import CriminalTopActivities from '@/components/criminals/CriminalTopActivities/CriminalTopActivities'
import CriminalWatchlist from '@/components/criminals/CriminalWatchlist/CriminalWatchlist'
import RecentAdditions from '@/components/criminals/RecentAdditions/RecentAdditions'
import { CRIMINALS, CRIMINAL_STATS } from '@/lib/data/criminals'
import styles from './criminals.module.css'

const PAGE_SIZE = 10

export default function CriminalsContent() {
  const [search, setSearch]         = useState('')
  const [filters, setFilters]       = useState({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    setVisibleCount(PAGE_SIZE)
    const q = search.trim().toLowerCase()
    return CRIMINALS.filter(c => {
      if (q && !(
        c.name.toLowerCase().includes(q) ||
        c.alias.toLowerCase().includes(q) ||
        c.gang.toLowerCase().includes(q) ||
        c.activeRegions.toLowerCase().includes(q) ||
        c.crimes.some(cr => cr.toLowerCase().includes(q))
      )) return false

      if (filters.threatLevel && filters.threatLevel !== 'Any') {
        if (c.threat !== filters.threatLevel.toLowerCase()) return false
      }

      if (filters.gang && filters.gang !== 'Any') {
        if (!c.gang.toLowerCase().includes(filters.gang.toLowerCase())) return false
      }

      if (filters.country && filters.country !== 'All Countries') {
        if (!c.activeRegions.toLowerCase().includes(filters.country.toLowerCase())) return false
      }

      if (filters.crimeType && filters.crimeType !== 'All Crime Types') {
        if (!c.crimes.some(cr => cr.toLowerCase().includes(filters.crimeType.toLowerCase()))) return false
      }

      return true
    })
  }, [search, filters])

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
                <h1 className={styles.mainCardTitle}>Criminals Directory</h1>
                <p className={styles.mainCardSubtitle}>
                  Detailed information about all the criminals in our system
                </p>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.totalBadge}>
                  <span className={styles.totalNum}>{CRIMINAL_STATS.total}</span>
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
              <CriminalFilterBar onSearch={setSearch} onFilterChange={setFilters} />
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <StatCard iconColor="brand"   value={CRIMINAL_STATS.total}  label="Total Criminals" />
              <StatCard iconColor="error"   value={CRIMINAL_STATS.high}   label="High Threat" />
              <StatCard iconColor="alert"   value={CRIMINAL_STATS.medium} label="Medium Threat" />
              <StatCard iconColor="success" value={CRIMINAL_STATS.low}    label="Low Threat" />
            </div>

            {/* Table */}
            <CriminalTable
              criminals={visible}
              hasMore={hasMore}
              onSeeMore={() => setVisibleCount(c => c + PAGE_SIZE)}
            />

          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          <ThreatDistribution />
          <CriminalTopActivities />
          <CriminalWatchlist />
          <RecentAdditions />
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
        <PersonIcon />
      </div>
      <div className={styles.statText}>
        <span className={styles.statValue}>{value.toLocaleString()}</span>
        <span className={styles.statLabel}>{label}</span>
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
