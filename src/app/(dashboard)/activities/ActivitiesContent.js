'use client'

import { useState, useMemo } from 'react'
import ActivityCard from '@/components/activities/ActivityCard/ActivityCard'
import ActivitiesFilterBar from '@/components/activities/ActivitiesFilterBar/ActivitiesFilterBar'
import ActivityOverview from '@/components/activities/ActivityOverview/ActivityOverview'
import QuickFilters from '@/components/activities/QuickFilters/QuickFilters'
import CrimeTags from '@/components/activities/CrimeTags/CrimeTags'
import DataSources from '@/components/activities/DataSources/DataSources'
import { ACTIVITIES } from '@/lib/data/activities'
import styles from './activities.module.css'

const TOTAL = 2480

const PAGE_SIZE = 5

export default function ActivitiesContent() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    setVisibleCount(PAGE_SIZE)
    if (!search.trim()) return ACTIVITIES
    const q = search.trim().toLowerCase()
    return ACTIVITIES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.categoryLabel.toLowerCase().includes(q) ||
      a.gang.toLowerCase().includes(q)
    )
  }, [search])

  const isFiltered = filtered.length < ACTIVITIES.length
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

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
              />
            </div>

            <div className={styles.resultsBar}>
              <span className={styles.resultsText}>
                {isFiltered
                  ? `Showing 1–${filtered.length} of ${filtered.length} results`
                  : `Showing 1–${visibleCount} of ${TOTAL.toLocaleString()} activities`
                }
              </span>
            </div>

            <div className={styles.activityList}>
              {visible.length > 0 ? (
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
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                >
                  See More
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className={styles.sidebar}>
          <ActivityOverview />
          <QuickFilters />
          <CrimeTags />
          <DataSources />
        </aside>
      </div>
    </main>
  )
}
