'use client'

import { useState, useRef, useEffect } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './CriminalFilterBar.module.css'

const FILTERS = [
  {
    key: 'duration',
    label: 'DURATION',
    default: 'All Time',
    options: ['All Time', 'Last 30 Days', 'Last 90 Days', 'Last Year'],
  },
  {
    key: 'gang',
    label: 'GANGS AFFILIATED',
    default: 'Any',
    options: ['Any', 'Las Zetas', 'Sinaloa Cartel', 'MS-13', 'Cali Cartel', 'Yakuza', 'Camorra', 'Ndrangheta', 'Triads'],
  },
  {
    key: 'country',
    label: 'COUNTRY',
    default: 'All Countries',
    options: ['All Countries', 'USA', 'Mexico', 'Colombia', 'Japan', 'Italy', 'Brazil', 'China'],
  },
  {
    key: 'crimeType',
    label: 'CRIME TYPE',
    default: 'All Crime Types',
    options: ['All Crime Types', 'Drug Trafficking', 'Extortion', 'Murder', 'Terrorism', 'Robbery', 'Money Laundering', 'Human Trafficking'],
  },
  {
    key: 'threatLevel',
    label: 'THREAT LEVELS',
    default: 'Any',
    options: ['Any', 'High', 'Medium', 'Low'],
  },
]

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

export default function CriminalFilterBar({ onSearch, onFilterChange }) {
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
      <div className={styles.searchWrap}>
        <SearchInput placeholder="Search criminals" onSearch={onSearch} />
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
