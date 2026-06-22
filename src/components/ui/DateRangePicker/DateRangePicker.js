'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './DateRangePicker.module.css'

/* ── Helpers ── */

function fmt(dateStr) {
  if (!dateStr) return ''
  const d   = new Date(dateStr + 'T00:00:00')
  const day = String(d.getDate()).padStart(2, '0')
  const mon = d.toLocaleString('en-US', { month: 'short' })
  const yr  = String(d.getFullYear()).slice(2)
  return `${day} ${mon}, ${yr}`
}

function fmtRange(from, to) {
  if (!from && !to) return null
  if (from && !to)  return fmt(from)
  const fD = new Date(from + 'T00:00:00')
  const tD = new Date(to   + 'T00:00:00')
  const fDay = String(fD.getDate()).padStart(2, '0')
  const fMon = fD.toLocaleString('en-US', { month: 'short' })
  const tDay = String(tD.getDate()).padStart(2, '0')
  const tMon = tD.toLocaleString('en-US', { month: 'short' })
  const yr   = String(tD.getFullYear()).slice(2)
  if (fD.getFullYear() === tD.getFullYear()) {
    return `${fDay} ${fMon} - ${tDay} ${tMon}, ${yr}`
  }
  return `${fmt(from)} - ${fmt(to)}`
}

/* ── Component ── */

export default function DateRangePicker({
  defaultFrom = '',
  defaultTo   = '',
  onChange,
}) {
  const [committed, setCommitted] = useState({ from: defaultFrom, to: defaultTo })
  const [draft,     setDraft]     = useState({ from: defaultFrom, to: defaultTo })
  const [open,      setOpen]      = useState(false)
  const wrapRef                   = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleOpen() {
    setDraft(committed)
    setOpen(o => !o)
  }

  function handleApply() {
    setCommitted(draft)
    onChange?.(draft)
    setOpen(false)
  }

  function handleClear() {
    const empty = { from: '', to: '' }
    setDraft(empty)
    setCommitted(empty)
    onChange?.(empty)
    setOpen(false)
  }

  const label = fmtRange(committed.from, committed.to)

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {/* Trigger — same visual style as SearchInput */}
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerActive : ''}`}
        onClick={handleOpen}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Select date range"
      >
        <CalendarIcon />
        <span className={label ? styles.triggerValue : styles.triggerPlaceholder}>
          {label ?? '01 Jan - 01 Feb, 26'}
        </span>
        <ChevronDownIcon />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Date range picker">
          <div className={styles.panelBody}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>From</span>
              <input
                type="date"
                className={styles.dateInput}
                value={draft.from}
                max={draft.to || undefined}
                onChange={e => setDraft(d => ({ ...d, from: e.target.value }))}
              />
            </div>

            <span className={styles.sep} aria-hidden="true">—</span>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>To</span>
              <input
                type="date"
                className={styles.dateInput}
                value={draft.to}
                min={draft.from || undefined}
                onChange={e => setDraft(d => ({ ...d, to: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.panelActions}>
            <button type="button" className={styles.clearBtn} onClick={handleClear}>
              Clear
            </button>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!draft.from && !draft.to}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
