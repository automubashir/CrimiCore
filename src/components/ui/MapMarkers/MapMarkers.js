'use client'

import { useState } from 'react'
import { Marker } from 'react-simple-maps'
import styles from './MapMarkers.module.css'

/**
 * Shared interactive markers for every react-simple-maps view in the app.
 *
 * - Decorative halos are pointer-event-transparent so overlapping markers
 *   never steal each other's hover/click (the visible dot is the hit area).
 * - Larger markers render first so small dots paint on top and stay reachable.
 * - Reports the hovered marker via `onHoverChange` (for a tooltip/popup) and
 *   clicks via `onSelect`. Pass `selectedId` to keep a marker highlighted.
 *
 * Each marker: { coords:[lng,lat], r, color, ...payload }.
 */
export default function MapMarkers({
  markers = [],
  zoom = 1,
  selectedId = null,
  onHoverChange,
  onSelect,
}) {
  const [hoveredId, setHoveredId] = useState(null)

  const ordered = markers
    .map((m, i) => ({ ...m, _id: m._id ?? i }))
    .sort((a, b) => b.r - a.r)

  const highlightedId = hoveredId ?? selectedId

  function hover(m) {
    setHoveredId(m?._id ?? null)
    onHoverChange?.(m ?? null)
  }

  return ordered.map(m => {
    const active = highlightedId === m._id
    return (
      <Marker
        key={m._id}
        coordinates={m.coords}
        onMouseEnter={() => hover(m)}
        onMouseLeave={() => hover(null)}
        onClick={onSelect ? (e => { e.stopPropagation(); onSelect(m) }) : undefined}
        style={{ cursor: 'default' }}
      >
        {/* Decorative halos — non-interactive so they don't block neighbours */}
        <circle r={m.r * 3.2} fill={m.color} fillOpacity={0.07} pointerEvents="none" />
        <circle r={m.r * 2}   fill={m.color} fillOpacity={0.15} pointerEvents="none" />
        <circle
          r={m.r}
          fill={m.color}
          fillOpacity={active ? 1 : 0.6}
          stroke={active ? '#fff' : 'none'}
          strokeWidth={active ? 1.5 / zoom : 0}
        />
        <circle r={m.r * 0.5} fill={m.color} pointerEvents="none" />
      </Marker>
    )
  })
}

/**
 * Tracks the cursor position inside a map container so a tooltip can follow it.
 * Spread `onMouseMove` onto the (position: relative) map wrapper.
 */
export function useMapTooltip() {
  const [hovered, setHovered] = useState(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function onMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return { hovered, setHovered, pos, onMouseMove }
}

/** Minimal hover tooltip — location name + count. Renders nothing when idle. */
export function MapTooltip({ marker, x, y }) {
  if (!marker) return null
  return (
    <div className={styles.tooltip} style={{ left: x, top: y }}>
      <span className={styles.tipDot} style={{ background: marker.color }} />
      <span className={styles.tipCity}>{marker.label}</span>
      {marker.count != null && marker.count !== '' && (
        <span className={styles.tipCount}>{marker.count}</span>
      )}
    </div>
  )
}
