'use client'
import { useState, useMemo } from 'react'
import { ACTIVITIES } from '@/lib/data/activities'
import RelatedNewsCard from '@/components/activities/RelatedNewsCard/RelatedNewsCard'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import styles from './RelatedNewsTab.module.css'

const THREAT_OPTIONS = ['High', 'Medium', 'Low']

export default function RelatedNewsTab({ activity, height = "26rem" }) {
  const [search, setSearch]     = useState('')
  const [country, setCountry]   = useState(null)
  const [crimeType, setCrimeType] = useState(null)
  const [threat, setThreat]     = useState(null)
  const [criminal, setCriminal] = useState(null) 
  const base = useMemo(
    () => activity?.id ? ACTIVITIES.filter(a => a.id !== activity.id) : ACTIVITIES,
    [activity?.id]
  )

  const countries = useMemo(
    () => [...new Set(base.map(a => a.locationCountry).filter(Boolean))].sort(),
    [base]
  )

  const crimeTypes = useMemo(
    () => [...new Set(base.map(a => a.categoryLabel))].sort(),
    [base]
  )

  const criminals = useMemo(() => {
    const names = new Set()
    base.forEach(a => a.criminalsInvolved?.forEach(c => {
      if (c.name && c.name !== 'Unknown Suspect') names.add(c.name)
    }))
    return [...names].sort()
  }, [base])

  const filtered = useMemo(() => base.filter(a => {
    if (search) {
      const q = search.toLowerCase()
      if (!a.title.toLowerCase().includes(q) && !a.description?.toLowerCase().includes(q)) return false
    }
    if (country   && a.locationCountry !== country) return false
    if (crimeType && a.categoryLabel   !== crimeType) return false
    if (threat    && a.threatLevel     !== threat.toLowerCase()) return false
    if (criminal) {
      const match = a.criminalsInvolved?.some(c => c.name === criminal)
      if (!match) return false
    }
    return true
  }), [base, search, country, crimeType, threat, criminal])

  return (
    <div className={styles.container}>
      {/* Header: title + search */}
      <div className={styles.header}>
        <h3 className={styles.title}>Related News</h3>
        <div className={styles.searchWrap}>
          <SearchInput placeholder="Search News" onSearch={setSearch} />
        </div>
      </div>

      {/* Filter row */}
      <div className={styles.filters}>
        <FilterSelect
          label="Country/Region"
          placeholder="Any"
          options={countries}
          onChange={setCountry}
        />
        <FilterSelect
          label="Crime Type"
          placeholder="Any"
          options={crimeTypes}
          onChange={setCrimeType}
        />
        <FilterSelect
          label="Threat Levels"
          placeholder="Any"
          options={THREAT_OPTIONS}
          onChange={setThreat}
        />
        <FilterSelect
          label="Criminal"
          placeholder="Mentioned Criminals"
          options={criminals}
          onChange={setCriminal}
        />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>No results match the selected filters.</p>
      ) : (
        <div className={styles.grid} style={{ maxHeight: height }}>
          {filtered.map(a => (
            <RelatedNewsCard
              key={a.id}
              id={a.id}
              image={a.image}
              reporter={a.reporter}
              category={a.category}
              categoryLabel={a.categoryLabel}
              title={a.title}
              description={a.description}
              location={a.location}
              date={a.date}
            />
          ))}
        </div>
      )}
    </div>
  )
}
