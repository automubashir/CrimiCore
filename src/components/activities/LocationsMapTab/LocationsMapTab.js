'use client'
import { useState, useMemo } from 'react'
import { ACTIVITIES } from '@/lib/data/activities'
import CrimeHeatMap from '@/components/activities/CrimeHeatMap/CrimeHeatMap'
import LocationActivityCard from '@/components/activities/LocationActivityCard/LocationActivityCard'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterDropdown from '@/components/ui/FilterDropdown/FilterDropdown'
import styles from './LocationsMapTab.module.css'

const COUNTRY_ABBR = {
  'United States': 'US',
  'United Kingdom': 'UK',
  'South Africa': 'SA',
  'South Korea': 'KR',
  'New Zealand': 'NZ',
  'United Arab Emirates': 'UAE',
}

function abbrevCountry(country) {
  return COUNTRY_ABBR[country] ?? country
}

export default function LocationsMapTab({ activity }) {
  const [search, setSearch] = useState('')
  const [crimeType, setCrimeType] = useState(null)
  const [gang, setGang] = useState(null)

  const locationLabel = activity
    ? `${activity.locationCity}, ${abbrevCountry(activity.locationCountry)}`
    : 'Global'

  const locationActivities = useMemo(() =>
    activity
      ? ACTIVITIES.filter(a => a.id !== activity.id && a.locationCity === activity.locationCity)
      : ACTIVITIES,
    [activity?.id, activity?.locationCity]
  )

  const crimeTypes = useMemo(
    () => [...new Set(locationActivities.map(a => a.categoryLabel))],
    [locationActivities]
  )
  const gangs = useMemo(
    () => [...new Set(locationActivities.map(a => a.gang).filter(Boolean))],
    [locationActivities]
  )

  const filtered = useMemo(() =>
    locationActivities.filter(a => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
      if (crimeType && a.categoryLabel !== crimeType) return false
      if (gang && a.gang !== gang) return false
      return true
    }),
    [locationActivities, search, crimeType, gang]
  )

  return (
    <div className={styles.container}>
      {/* ── Left: map ── */}
      <div className={styles.mapPanel}>
        <CrimeHeatMap />
      </div>

      {/* ── Right: location activity list ── */}
      <div className={styles.listPanel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.locationTitle}>{locationLabel}</h3>
          <p className={styles.locationSub}>Other incidents that happened in the selected area.</p>
        </div>

        <div className={styles.searchRow}>
          <SearchInput placeholder="Search Activities" onSearch={setSearch} />
        </div>

        <div className={styles.filtersRow}>
          <FilterDropdown label="Crime Type" options={crimeTypes} onChange={setCrimeType} />
          <FilterDropdown label="Gang" options={gangs} onChange={setGang} />
          <FilterDropdown label="Criminal" options={[]} />
          <FilterDropdown label="Date Range" options={[]} />
        </div>

        <div className={styles.activityList}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No activities found for this location.</p>
          ) : (
            filtered.map(a => (
              <LocationActivityCard
                key={a.id}
                id={a.id}
                image={a.image}
                title={a.title}
                date={a.date}
                threatLevel={a.threatLevel}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
