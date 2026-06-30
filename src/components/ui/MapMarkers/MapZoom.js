'use client'

import { useState } from 'react'
import styles from './MapZoom.module.css'

const MIN_ZOOM = 1
const MAX_ZOOM = 8

/** Pan/zoom state for an embedded react-simple-maps ZoomableGroup. */
export function useMapZoom() {
  const [zoom, setZoom]     = useState(1)
  const [center, setCenter] = useState([0, 0])

  function onMoveEnd({ coordinates, zoom: z }) { setCenter(coordinates); setZoom(z) }
  function zoomIn()  { setZoom(z => Math.min(+(z + 0.5).toFixed(2), MAX_ZOOM)) }
  function zoomOut() { setZoom(z => Math.max(+(z - 0.5).toFixed(2), MIN_ZOOM)) }
  function reset()   { setZoom(1); setCenter([0, 0]) }

  return { zoom, center, onMoveEnd, zoomIn, zoomOut, reset, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM }
}

/** Compact +/reset/- controls for an embedded map (top-right corner). */
export function MapZoomControls({ zoom, onZoomIn, onZoomOut, onReset, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM }) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.btn}
        type="button"
        onClick={e => { e.stopPropagation(); onZoomIn() }}
        disabled={zoom >= maxZoom}
        aria-label="Zoom in"
      >+</button>
      <button
        className={styles.btn}
        type="button"
        onClick={e => { e.stopPropagation(); onReset() }}
        aria-label="Reset view"
        title="Reset view"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
          <path d="M1 8a7 7 0 1 0 7-7" strokeLinecap="round" />
          <path d="M1 3.5V8h4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className={styles.btn}
        type="button"
        onClick={e => { e.stopPropagation(); onZoomOut() }}
        disabled={zoom <= minZoom}
        aria-label="Zoom out"
      >−</button>
    </div>
  )
}
