'use client'

import { useState, useEffect } from 'react'
import { apiFetch, buildQuery } from '@/lib/api'
import { geocodeAll } from '@/lib/geocode'
import StatsGrid from '@/components/dashboard/StatsGrid/StatsGrid'
import RecentNewsSection from '@/components/dashboard/RecentNewsSection/RecentNewsSection'
import GlobalMap from '@/components/dashboard/GlobalMap/GlobalMap'
import TopGangs from '@/components/dashboard/TopGangs/TopGangs'
import ActivitiesByType from '@/components/dashboard/ActivitiesByType/ActivitiesByType'
import RecentlyAddedCriminals from '@/components/dashboard/RecentlyAddedCriminals/RecentlyAddedCriminals'
import { StatsGridSkeleton } from '@/components/ui/Skeleton/Skeleton'
import { NewsSkeleton, MapSkeleton, GangsSkeleton, CrimeTypesSkeleton, CriminalsSkeleton } from './loading'
import styles from './dashboard.module.css'

// Each slice starts as `undefined` (loading) and becomes its value (possibly
// empty) once its own request settles — sections reveal as they arrive.
export default function HomePage() {
  const [overview,     setOverview]     = useState(undefined)
  const [news,         setNews]         = useState(undefined)
  const [affiliations, setAffiliations] = useState(undefined)
  const [crimeTypes,   setCrimeTypes]   = useState(undefined)
  const [topCriminals, setTopCriminals] = useState(undefined)
  const [mapLocations, setMapLocations] = useState(undefined)

  useEffect(() => {
    apiFetch('/api/analytics/overview')
      .then(setOverview).catch(() => setOverview(null))

    apiFetch('/api/news/filter' + buildQuery({ page: 1 }))
      .then(r => setNews(r?.all_news ?? [])).catch(() => setNews([]))

    apiFetch('/api/analytics/by-affiliation' + buildQuery({ size: 20, breakdown: true }))
      .then(r => setAffiliations(r?.data ?? [])).catch(() => setAffiliations([]))

    apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 6 }))
      .then(r => setCrimeTypes(r?.data ?? [])).catch(() => setCrimeTypes([]))

    apiFetch('/api/analytics/top-criminals' + buildQuery({ size: 20 }))
      .then(r => setTopCriminals(r?.data ?? [])).catch(() => setTopCriminals([]))

    apiFetch('/api/analytics/by-location' + buildQuery({ size: 5 }))
      .then(async r => {
        const locations     = r?.data ?? []
        const missingCoords = locations.filter(h => !h.lat || !h.lng).map(h => h.location ?? '')
        const coordMap      = await geocodeAll(missingCoords)
        const enriched      = locations.map(h => {
          if (h.lat && h.lng) return h
          const c = coordMap[(h.location ?? '').trim().toLowerCase()]
          return c ? { ...h, lat: c.lat, lng: c.lng } : h
        })
        setMapLocations(enriched)
      })
      .catch(() => setMapLocations([]))
  }, [])

  return (
    <main className={styles.dashboardWrapper}>
      {overview === undefined ? <StatsGridSkeleton /> : <StatsGrid stats={overview} />}

      <div className={styles.dashboardGrid}>
        <div className={styles.col1}>
          {news === undefined ? <NewsSkeleton /> : <RecentNewsSection news={news} />}
        </div>
        <div className={styles.col2}>
          {(overview === undefined || mapLocations === undefined)
            ? <MapSkeleton />
            : <GlobalMap hotspots={mapLocations} overview={overview} />}
        </div>
        <div className={styles.col4}>
          {affiliations === undefined ? <GangsSkeleton /> : <TopGangs data={affiliations} />}
        </div>
        <div className={styles.col5}>
          {crimeTypes === undefined ? <CrimeTypesSkeleton /> : <ActivitiesByType data={crimeTypes} />}
        </div>
        <div className={styles.col6}>
          {topCriminals === undefined ? <CriminalsSkeleton /> : <RecentlyAddedCriminals data={topCriminals} />}
        </div>
      </div>
    </main>
  )
}
