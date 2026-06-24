'use client'

import { useState, useRef, useEffect } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './ActivitiesFilterBar.module.css'

const DATE_OPTIONS = ['Jan 01 - 2024', 'Feb 01 - 2024', 'Mar 01 - 2024', 'Apr 01 - 2024', 'May 01 - 2025']
const CRIMINAL_OPTIONS = ['All Criminals', 'Known Criminals', 'Unknown Criminals']

function FilterItem({ label, value, options, onChange }) {
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
        <div className={styles.dropdown} role="listbox">
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

export default function ActivitiesFilterBar({
  onSearch,
  onFilterChange,
  crimeTypeOptions = ['All Crime Types'],
  gangOptions      = ['Any'],
  countryOptions   = ['Any'],
}) {
  const FILTERS = [
    { key: 'dateRange', label: 'DATE RANGE',     default: 'Feb 01 - 2024',   options: DATE_OPTIONS },
    { key: 'crimeType', label: 'CRIME TYPE',     default: 'All Crime Types', options: crimeTypeOptions },
    { key: 'gangs',     label: 'GANGS',          default: 'Any',             options: gangOptions },
    { key: 'criminal',  label: 'CRIMINAL',       default: 'All Criminals',   options: CRIMINAL_OPTIONS },
    { key: 'country',   label: 'COUNTRY/REGION', default: 'Any',             options: countryOptions },
  ]

  const [values, setValues] = useState(() =>
    Object.fromEntries(FILTERS.map(f => [f.key, f.default]))
  )

  function handleChange(key, value) {
    const next = { ...values, [key]: value }
    setValues(next)
    onFilterChange?.(next)
  }

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
          />
        ))}
      </div>
    </div>
  )
}
