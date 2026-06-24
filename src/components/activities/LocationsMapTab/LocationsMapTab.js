'use client'
import { useState, useMemo } from 'react'
import CrimeHeatMap from '@/components/activities/CrimeHeatMap/CrimeHeatMap'
import LocationActivityCard from '@/components/activities/LocationActivityCard/LocationActivityCard'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterDropdown from '@/components/ui/FilterDropdown/FilterDropdown'
import styles from './LocationsMapTab.module.css'

const COUNTRY_ABBR = {
  'United States': 'US', 'United Kingdom': 'UK', 'South Africa': 'SA',
  'South Korea': 'KR', 'New Zealand': 'NZ', 'United Arab Emirates': 'UAE',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function abbrevCountry(c) { return COUNTRY_ABBR[c] ?? c }

function unique(arr) { return [...new Set(arr.filter(Boolean))].sort() }

export default function LocationsMapTab({ activity, locations = [], locationNews = [] }) {
  const [search,    setSearch]    = useState('')
  const [crimeType, setCrimeType] = useState(null)
  const [gang,      setGang]      = useState(null)

  const locationLabel = activity
    ? `${activity.locationCity}, ${abbrevCountry(activity.locationCountry)}`
    : 'Global'

  const items = useMemo(() =>
    locationNews.map(item => ({
      id:          encodeURIComponent(item.news?.news_link ?? item.news?.link ?? ''),
      image:       item.news?.thumbnail ?? null,
      title:       item.news?.title ?? '—',
      date:        formatDate(item.news?.published_date),
      threatLevel: 'low',
      _crimeType:  item.news?.crimeType ?? '',
      _gang:       item.news?.affiliation ?? '',
    })),
    [locationNews]
  )

  const crimeTypes = useMemo(() =>
    unique(locationNews.flatMap(item => item.news?.crimeType?.split(',').map(s => s.trim()) ?? [])),
    [locationNews]
  )

  const gangs = useMemo(() =>
    unique(locationNews.map(item => item.news?.affiliation).filter(Boolean)),
    [locationNews]
  )

  const filtered = useMemo(() => items.filter(a => {
    if (search    && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    if (crimeType && !a._crimeType.includes(crimeType)) return false
    if (gang      && !a._gang.toLowerCase().includes(gang.toLowerCase())) return false
    return true
  }), [items, search, crimeType, gang])

  return (
    <div className={styles.container}>
      <div className={styles.mapPanel}>
        <CrimeHeatMap locations={locations} />
      </div>

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
          <FilterDropdown label="Gang"       options={gangs}      onChange={setGang} />
          <FilterDropdown label="Criminal"   options={[]} />
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
