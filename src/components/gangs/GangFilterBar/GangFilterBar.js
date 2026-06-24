'use client'

import { useState, useRef, useEffect } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './GangFilterBar.module.css'

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

export default function GangFilterBar({ onSearch, onFilterChange, countryOptions = [], crimeTypeOptions = [] }) {
  const [values, setValues] = useState({
    country:     'All Countries',
    crimeType:   'All Crime Types',
    threatLevel: 'Any',
    criminal:    'All Criminals',
    region:      'Any',
  })

  function handleChange(key, value) {
    const next = { ...values, [key]: value }
    setValues(next)
    onFilterChange?.(next)
  }

  const filters = [
    {
      key:     'country',
      label:   'COUNTRY/REGION',
      options: ['All Countries', ...countryOptions],
    },
    {
      key:     'crimeType',
      label:   'CRIME TYPE',
      options: ['All Crime Types', ...crimeTypeOptions],
    },
    {
      key:     'threatLevel',
      label:   'THREAT LEVELS',
      options: ['Any', 'High', 'Medium', 'Low'],
    },
    {
      key:     'criminal',
      label:   'CRIMINAL',
      options: ['All Criminals', 'Known Criminals', 'Unknown Criminals'],
    },
    {
      key:     'region',
      label:   'COUNTRY/REGION',
      options: ['Any', 'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'],
    },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchWrap}>
        <SearchInput placeholder="Search gangs" onSearch={onSearch} />
      </div>
      <div className={styles.filterBar}>
        {filters.map(f => (
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
