'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './FilterSelect.module.css'

export default function FilterSelect({ label, placeholder = 'Any', options = [], onChange }) {
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
          <button
            className={`${styles.option} ${selected === null ? styles.optionActive : ''}`}
            role="option"
            aria-selected={selected === null}
            type="button"
            onClick={() => select(null)}
          >
            {placeholder}
          </button>
          {options.map(opt => (
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
        </div>
      )}
    </div>
  )
}
