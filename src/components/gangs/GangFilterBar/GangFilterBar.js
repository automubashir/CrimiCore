'use client'

import { useState, useRef, useEffect } from 'react'
import { dateRangeToParams, DATE_RANGE_OPTIONS } from '@/lib/dateRange'
import COUNTRIES from '@/lib/countries'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './GangFilterBar.module.css'

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
  if (values.threatLevel && values.threatLevel !== 'Any')             params.threat_level = values.threatLevel.toLowerCase()
  if (values.crimeType   && values.crimeType   !== 'All Crime Types') params.crime_type   = values.crimeType
  if (values.country     && values.country     !== 'All Countries')   params.location     = values.country.toLowerCase()
  Object.assign(params, dateRangeToParams(values.dateRange))
  return params
}

export default function GangFilterBar({ onSearch, onFilterChange, crimeTypeOptions = ['All Crime Types'] }) {
  const FILTERS = [
    { key: 'dateRange',   label: 'DATE RANGE',     default: 'All',             options: ['All', ...DATE_RANGE_OPTIONS],  scrollable: false },
    { key: 'crimeType',   label: 'CRIME TYPE',     default: 'All Crime Types', options: crimeTypeOptions,               scrollable: true  },
    { key: 'threatLevel', label: 'THREAT LEVEL',   default: 'Any',             options: ['Any', 'High', 'Medium', 'Low'],scrollable: false },
    { key: 'country',     label: 'COUNTRY/REGION', default: 'All Countries',   options: ['All Countries', ...COUNTRIES], scrollable: true  },
  ]

  const [values, setValues] = useState(() =>
    Object.fromEntries(FILTERS.map(f => [f.key, f.default]))
  )

  function handleChange(key, value) {
    const next = { ...values, [key]: value }
    setValues(next)
    onFilterChange?.(valuesToApiFilters(next))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchWrap}>
        <SearchInput placeholder="Search gangs" onSearch={onSearch} />
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
