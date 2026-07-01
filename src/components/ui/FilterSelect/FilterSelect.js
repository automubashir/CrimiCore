'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './FilterSelect.module.css'

const SEARCH_THRESHOLD = 8

export default function FilterSelect({ label, placeholder = 'Any', options = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
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

  const showSearch = options.length > SEARCH_THRESHOLD
  const q = query.trim().toLowerCase()
  const filtered = q ? options.filter(o => String(o).toLowerCase().includes(q)) : options

  function select(val) {
    setSelected(val)
    setOpen(false)
    onChange?.(val)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
      >
        <span className={styles.label}>{label}</span>
        <div className={styles.valueRow}>
          <span className={styles.value}>{selected ?? placeholder}</span>
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {showSearch && (
            <input
              className={styles.dropdownSearch}
              placeholder="Search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          )}
          {!q && (
            <button
              className={`${styles.option} ${selected === null ? styles.optionActive : ''}`}
              role="option"
              aria-selected={selected === null}
              type="button"
              onClick={() => select(null)}
            >
              {placeholder}
            </button>
          )}
          {filtered.map(opt => (
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
          {q && filtered.length === 0 && <div className={styles.dropdownEmpty}>No matches</div>}
        </div>
      )}
    </div>
  )
}
