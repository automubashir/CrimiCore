'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import MapMarkers, { MapTooltip, useMapTooltip } from '@/components/ui/MapMarkers/MapMarkers'
import { useMapZoom, MapZoomControls } from '@/components/ui/MapMarkers/MapZoom'
import { Bone } from '@/components/ui/Skeleton/Skeleton'
import styles from './CriminalLocationsMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const MARKER_COLORS = {
  most:     '#F2464A',
  moderate: '#F3921B',
  limited:  '#70EA8D',
}

const PRESENCE_DOT = {
  most:     styles.dotMost,
  moderate: styles.dotModerate,
  limited:  styles.dotLimited,
}

export default function CriminalLocationsMap({ locations, loading = false }) {
  const { hovered, setHovered, pos, onMouseMove } = useMapTooltip()
  const zoomCtl = useMapZoom()

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.mapWrap}><Bone width="100%" height={320} /></div>
        <div className={styles.legend}>
          <Bone width={120} height={14} />
          <Bone width={140} height={14} />
          <Bone width={120} height={14} />
        </div>
      </div>
    )
  }

  if (!locations) return null

  const mapMarkers = (locations.markers ?? []).map(m => ({
    coords: m.coords,
    r:      m.r,
    color:  MARKER_COLORS[m.type] ?? MARKER_COLORS.most,
    label:  m.label,
    count:  m.count,
  }))

  return (
    <div className={styles.wrap}>
      {/* Map */}
      <div className={styles.mapWrap} style={{ position: 'relative' }} onMouseMove={onMouseMove}>
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

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotMost}`} />
          Most Presence
          <strong className={styles.legendCount}>({locations.mostPresenceCount})</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotModerate}`} />
          Moderate Presence
          <strong className={styles.legendCount}>({locations.moderatePresenceCount})</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotLimited}`} />
          Limited Presence
          <strong className={styles.legendCount}>({locations.limitedPresenceCount})</strong>
        </span>
      </div>

      {/* City list */}
      <div className={styles.cityList}>
        {(locations.cities ?? []).map(city => (
          <div key={city.rank} className={styles.cityRow}>
            <span className={`${styles.cityDot} ${PRESENCE_DOT[city.presenceType] ?? styles.dotMost}`} />
            <div className={styles.cityInfo}>
              <span className={styles.cityName}>{city.city}</span>
              <span className={styles.cityType}>{city.locationType}</span>
            </div>
            <button className={styles.cityArrow} type="button" aria-label={`View ${city.city}`}>
              <ArrowRightIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
