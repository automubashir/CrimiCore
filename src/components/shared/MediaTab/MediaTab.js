'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import DateRangePicker from '@/components/ui/DateRangePicker/DateRangePicker'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import styles from './MediaTab.module.css'

function toLargeUrl(url) {
  return url.replace(/\/\d+\/\d+$/, '/1200/800')
}

/* ── Lightbox modal ── */

function MediaModal({ items, index, onClose, onPrev, onNext }) {
  const item = items[index]

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  if (!item) return null

  const src = toLargeUrl(item.image)

  return createPortal(
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <span className={styles.modalCounter}>{index + 1} / {items.length}</span>

      <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      <button
        type="button"
        className={`${styles.modalNav} ${styles.modalNavPrev}`}
        onClick={e => { e.stopPropagation(); onPrev() }}
        aria-label="Previous image"
        disabled={index === 0}
      >
        <ChevronLeftIcon />
      </button>

      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <SafeImage key={src} src={src} alt={item.title} className={styles.modalImage} />
        <div className={styles.modalCaption}>
          <span className={styles.modalTitle}>{item.title}</span>
          <span className={styles.modalDate}>{item.date}</span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.modalNav} ${styles.modalNavNext}`}
        onClick={e => { e.stopPropagation(); onNext() }}
        aria-label="Next image"
        disabled={index === items.length - 1}
      >
        <ChevronRightIcon />
      </button>
    </div>,
    document.body,
  )
}

/* ── Grid card ── */

function MediaCard({ image, title, date, onOpen }) {
  return (
    <div
      className={styles.card}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      <SafeImage src={image} alt={title} className={styles.cardImage} />
      <button
        type="button"
        className={styles.expandBtn}
        aria-label={`Expand: ${title}`}
        onClick={e => { e.stopPropagation(); onOpen() }}
      >
        <ExpandIcon />
      </button>
      <div className={styles.cardOverlay}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardDate}>{date}</span>
      </div>
    </div>
  )
}

/* ── Main shared component ── */

/**
 * @param {{ items: Array<{id: string, image: string, title: string, date: string}> }} props
 */
export default function MediaTab({ items = [], showFilters = true }) {
  const [search,      setSearch]      = useState('')
  const [activeIndex, setActiveIndex] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(m => m.title.toLowerCase().includes(q))
  }, [items, search])

  const openModal  = useCallback((i) => setActiveIndex(i), [])
  const closeModal = useCallback(()  => setActiveIndex(null), [])
  const prevImage  = useCallback(()  => setActiveIndex(i => Math.max(0, i - 1)), [])
  const nextImage  = useCallback(()  => setActiveIndex(i => Math.min(filtered.length - 1, i + 1)), [filtered.length])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.heading}>Media Files</h3>
        <div className={styles.headerControls}>
          <div className={styles.searchWrap}>
            <SearchInput placeholder="Search Title" onSearch={setSearch} />
          </div>
          {showFilters && (
            <DateRangePicker
              defaultFrom="2026-01-01"
              defaultTo="2026-02-01"
            />
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No media files match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item, i) => (
            <MediaCard key={item.id} {...item} onOpen={() => openModal(i)} />
          ))}
        </div>
      )}

      {activeIndex !== null && (
        <MediaModal
          items={filtered}
          index={activeIndex}
          onClose={closeModal}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  )
}

/* ── Icons ── */

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
