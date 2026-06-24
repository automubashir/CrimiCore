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
import DashboardLoading from './loading'
import styles from './dashboard.module.css'

export default function HomePage() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    async function load() {
      const [overviewRes, newsRes, affiliationsRes, crimeTypesRes, topCriminalsRes, locationsRes] =
        await Promise.allSettled([
          apiFetch('/api/analytics/overview'),
          apiFetch('/api/news/filter' + buildQuery({ page: 1 })),
          apiFetch('/api/analytics/by-affiliation' + buildQuery({ size: 5, breakdown: true })),
          apiFetch('/api/analytics/by-crime-type' + buildQuery({ size: 6 })),
          apiFetch('/api/analytics/top-criminals' + buildQuery({ size: 5 })),
          apiFetch('/api/analytics/by-location' + buildQuery({ size: 5 })),
        ])

      const overview     = overviewRes.status     === 'fulfilled' ? overviewRes.value                    : null
      const news         = newsRes.status         === 'fulfilled' ? (newsRes.value?.all_news    ?? [])   : []
      const affiliations = affiliationsRes.status === 'fulfilled' ? (affiliationsRes.value?.data ?? [])  : []
      const crimeTypes   = crimeTypesRes.status   === 'fulfilled' ? (crimeTypesRes.value?.data  ?? [])   : []
      const topCriminals = topCriminalsRes.status === 'fulfilled' ? (topCriminalsRes.value?.data ?? [])  : []
      const locations    = locationsRes.status    === 'fulfilled' ? (locationsRes.value?.data    ?? [])   : []

      const missingCoords = locations.filter(h => !h.lat || !h.lng).map(h => h.location ?? '')
      const coordMap      = await geocodeAll(missingCoords)
      const enrichedLocations = locations.map(h => {
        if (h.lat && h.lng) return h
        const c = coordMap[(h.location ?? '').trim().toLowerCase()]
        return c ? { ...h, lat: c.lat, lng: c.lng } : h
      })

      setPageData({ overview, news, affiliations, crimeTypes, topCriminals, enrichedLocations })
    }

    load()
  }, [])

  if (!pageData) return <DashboardLoading />

  const { overview, news, affiliations, crimeTypes, topCriminals, enrichedLocations } = pageData

  return (
    <main className={styles.dashboardWrapper}>
      <StatsGrid stats={overview} />
      <div className={styles.dashboardGrid}>
        <div className={styles.col1}>
          <RecentNewsSection news={news} />
        </div>
        <div className={styles.col2}><GlobalMap hotspots={enrichedLocations} overview={overview} /></div>
        <div className={styles.col4}><TopGangs data={affiliations} /></div>
        <div className={styles.col5}><ActivitiesByType data={crimeTypes} /></div>
        <div className={styles.col6}><RecentlyAddedCriminals data={topCriminals} /></div>
      </div>
    </main>
  )
}
