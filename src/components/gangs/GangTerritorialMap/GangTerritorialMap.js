'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import MapMarkers, { MapTooltip, useMapTooltip } from '@/components/ui/MapMarkers/MapMarkers'
import { useMapZoom, MapZoomControls } from '@/components/ui/MapMarkers/MapZoom'
import styles from './GangTerritorialMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const PRESENCE_TABS = [
  { key: 'mostPresence',     label: 'Most Presence' },
  { key: 'moderatePresence', label: 'Moderate Presence' },
  { key: 'limitedPresence',  label: 'Limited Presence' },
]

const MARKER_COLORS = {
  most:     '#F2464A',
  moderate: '#F3921B',
  limited:  '#1BB1F0',
}

export default function GangTerritorialMap({ territories, loading = false }) {
  const [activeTab, setActiveTab] = useState('mostPresence')
  const { hovered, setHovered, pos, onMouseMove } = useMapTooltip()
  const zoomCtl = useMapZoom()

  if (!territories) return null

  const mapMarkers = (territories.markers ?? []).map(m => ({
    coords: m.coords,
    r:      m.r,
    color:  MARKER_COLORS[m.type] ?? MARKER_COLORS.most,
    label:  m.label,
    count:  m.count,
  }))

  const cities = territories[activeTab] ?? []
  const maxCount = cities.length > 0 ? cities[0].count : 1
  const resultCount =
    activeTab === 'mostPresence'     ? territories.mostPresenceCount :
    activeTab === 'moderatePresence' ? territories.moderatePresenceCount :
    territories.limitedPresenceCount

  return (
    <div className={styles.wrap}>

      {/* 1. Map */}
      <div className={styles.mapWrap} style={{ position: 'relative' }} onMouseMove={onMouseMove}>
        {loading && <div className={styles.mapLoadingOverlay}><span className={styles.mapLoadingText}>Loading…</span></div>}
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 145, center: [10, 5] }}
          width={800}
          height={360}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoomCtl.zoom}
            center={zoomCtl.center}
            minZoom={zoomCtl.minZoom}
            maxZoom={zoomCtl.maxZoom}
            onMoveEnd={zoomCtl.onMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0A1F33"
                    stroke="#0D2A40"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover:   { outline: 'none', fill: '#102D47' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            <MapMarkers markers={mapMarkers} zoom={zoomCtl.zoom} onHoverChange={setHovered} />
          </ZoomableGroup>
        </ComposableMap>
        <MapZoomControls
          zoom={zoomCtl.zoom}
          onZoomIn={zoomCtl.zoomIn}
          onZoomOut={zoomCtl.zoomOut}
          onReset={zoomCtl.reset}
          minZoom={zoomCtl.minZoom}
          maxZoom={zoomCtl.maxZoom}
        />
        <MapTooltip marker={hovered} x={pos.x} y={pos.y} />
      </div>

      {/* 2. Legend — below map */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotMost}`} />
          Most Presence
          <strong className={styles.legendCount}>({territories.mostPresenceCount})</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotModerate}`} />
          Moderate Presence
          <strong className={styles.legendCount}>({territories.moderatePresenceCount})</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotLimited}`} />
          Limited Presence
          <strong className={styles.legendCount}>({territories.limitedPresenceCount})</strong>
        </span>
      </div>

    <div className={styles.tabsWrap}>
      {/* 3. Presence tabs */}
      <div className={styles.tabs}>
        {PRESENCE_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Results count */}
      <span className={styles.resultsCount}>{resultCount} Results Found</span>

      {/* 5. City ranking */}
      <div className={styles.cityList}>
        {cities.map(city => (
          <div key={city.rank} className={styles.cityRow}>
            <span className={styles.cityRank}>{city.rank}</span>
            <div className={styles.cityInfo}>
              <span className={styles.cityName}>{city.city}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${(city.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className={styles.cityCount}>{city.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>

    </div>
  )
}
