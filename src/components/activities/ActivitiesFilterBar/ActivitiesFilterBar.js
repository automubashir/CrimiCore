'use client'

import { useState, useRef, useEffect } from 'react'
import { dateRangeToParams, DATE_RANGE_OPTIONS } from '@/lib/dateRange'
import COUNTRIES from '@/lib/countries'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './ActivitiesFilterBar.module.css'

function FilterItem({ label, value, options, onChange, scrollable = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.filterItem} ref={ref}>
      <button
        className={styles.filterTrigger}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
      >
        <span className={styles.filterLabel}>{label}</span>
        <div className={styles.filterValueRow}>
          <span className={styles.filterValue}>{value}</span>
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className={`${styles.dropdown} ${scrollable ? styles.dropdownScrollable : ''}`} role="listbox">
          {options.map(opt => (
            <button
              key={opt}
              className={`${styles.dropdownOption} ${value === opt ? styles.dropdownOptionActive : ''}`}
              role="option"
              aria-selected={value === opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function valuesToApiFilters(values) {
  const params = {}
  if (values.crimeType && values.crimeType !== 'All Crime Types') params.crime_type = values.crimeType
  if (values.gangs     && values.gangs     !== 'Any')             params.affiliation = values.gangs
  if (values.country   && values.country   !== 'Any')             params.location    = values.country.toLowerCase()
  Object.assign(params, dateRangeToParams(values.dateRange))
  return params
}

export default function ActivitiesFilterBar({
  onSearch,
  onFilterChange,
  crimeTypeOptions = ['All Crime Types'],
  gangOptions      = ['Any'],
  externalCrimeType,
}) {
  const FILTERS = [
    { key: 'dateRange', label: 'DATE RANGE',     default: 'All',             options: ['All', ...DATE_RANGE_OPTIONS], scrollable: false },
    { key: 'crimeType', label: 'CRIME TYPE',     default: 'All Crime Types', options: crimeTypeOptions,              scrollable: true  },
    { key: 'gangs',     label: 'GANGS',          default: 'Any',             options: gangOptions,                   scrollable: true  },
    { key: 'country',   label: 'COUNTRY/REGION', default: 'Any',             options: ['Any', ...COUNTRIES],         scrollable: true  },
  ]

  const [values, setValues] = useState(() =>
    Object.fromEntries(FILTERS.map(f => [f.key, f.default]))
  )

  function handleChange(key, value) {
    const next = { ...values, [key]: value }
    setValues(next)
    onFilterChange?.(valuesToApiFilters(next))
  }

  // Allow a Crime Tag elsewhere on the page to drive the crime-type filter.
  useEffect(() => {
    if (externalCrimeType && externalCrimeType !== values.crimeType) {
      const next = { ...values, crimeType: externalCrimeType }
      setValues(next)
      onFilterChange?.(valuesToApiFilters(next))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCrimeType])

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchAbbu}>
        <SearchInput placeholder="Search Activities" onSearch={onSearch} />
      </div>
      <div className={styles.filterBar}>
        {FILTERS.map(f => (
          <FilterItem
            key={f.key}
            label={f.label}
            value={values[f.key]}
            options={f.options}
            onChange={v => handleChange(f.key, v)}
            scrollable={f.scrollable}
          />
        ))}
      </div>
    </div>
  )
}
