'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './FilterDropdown.module.css'

export default function FilterDropdown({ label, options = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{selected ?? label}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="11"
          height="11"
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
          {options.map((opt) => (
            <button
              key={opt}
              className={`${styles.option} ${selected === opt ? styles.optionActive : ''}`}
              role="option"
              aria-selected={selected === opt}
              onClick={() => { setSelected(opt); setOpen(false); onChange?.(opt) }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
