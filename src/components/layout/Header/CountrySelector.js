'use client'

import { useState, useRef, useEffect } from 'react'
import COUNTRIES from '@/lib/countries'
import styles from './CountrySelector.module.css'

// Static UI only. Reuses the app's canonical country list as a stand-in so the
// selector renders every country we could scope to. The senior developer will
// later bind this to the real "countries we have data for" source and wire the
// selection up to actually filter the dashboard.
const OPTIONS = ['All Countries', ...COUNTRIES]

export default function CountrySelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('All Countries')
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  // Reset the search whenever the dropdown closes.
  useEffect(() => { if (!open) setQuery('') }, [open])

  const q = query.trim().toLowerCase()
  const filtered = q ? OPTIONS.filter((o) => o.toLowerCase().includes(q)) : OPTIONS

  function select(value) {
    setSelected(value)
    setOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select country"
        type="button"
      >
        {/* Globe icon */}
        <svg
          className={styles.globe}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        <span className={styles.value}>{selected}</span>

        {/* Chevron */}
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <input
            className={styles.search}
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className={styles.options}>
            {filtered.map((opt) => (
              <button
                key={opt}
                className={`${styles.option} ${selected === opt ? styles.optionActive : ''}`}
                role="option"
                aria-selected={selected === opt}
                type="button"
                onClick={() => select(opt)}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && <div className={styles.empty}>No matches</div>}
          </div>
        </div>
      )}
    </div>
  )
}
