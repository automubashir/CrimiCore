'use client'
import styles from './CrimeHeatMap.module.css'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import MapMarkers, { MapTooltip, useMapTooltip } from '@/components/ui/MapMarkers/MapMarkers'
import { useMapZoom, MapZoomControls } from '@/components/ui/MapMarkers/MapZoom'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function toTitleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function CrimeHeatMap({ locations = [], loading = false }) {
  const { hovered, setHovered, pos, onMouseMove } = useMapTooltip()
  const zoomCtl = useMapZoom()
  const maxCount = locations.length > 0 ? Math.max(...locations.map(l => l.doc_count ?? 0), 1) : 1

  const markers = locations
    .filter(l => l.lat != null && l.lng != null)
    .map((l, idx) => ({
      coords: [parseFloat(l.lng), parseFloat(l.lat)],
      r:      2.5 + ((l.doc_count ?? 0) / maxCount) * 4.5,
      color:  idx === 0 ? '#F2464A' : '#F3921B',
      label:  toTitleCase(l.location ?? ''),
      count:  `${(l.doc_count ?? 0).toLocaleString()} Activities`,
    }))

  const activeAreas = locations.slice(0, 5).map((l, idx) => ({
    rank:       idx + 1,
    city:       toTitleCase(l.location ?? ''),
    activities: l.doc_count ?? 0,
    color:      idx === 0 ? '#F2464A' : '#F3921B',
  }))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Crime Heat Map</h3>
      </div>
      <div className={styles.mapWrap} onMouseMove={onMouseMove}>
        {loading && <div className={styles.mapLoadingOverlay}><span className={styles.mapLoadingText}>Loading…</span></div>}
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 145, center: [10, 5] }}
          width={800}
          height={400}
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

            <MapMarkers markers={markers} zoom={zoomCtl.zoom} onHoverChange={setHovered} />
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

        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>Active Operating Area</p>
          <p className={styles.overlaySub}>
            Most active places where the mentioned criminals are operating
          </p>
          <div className={styles.areaList}>
            {activeAreas.map(({ rank, city, activities, color }) => (
              <div key={rank} className={styles.areaRow}>
                <span className={styles.areaRank}>{rank}.</span>
                <span className={styles.areaCity}>{city}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(activities / maxCount) * 100}%`, background: color }}
                  />
                </div>
                <span className={styles.areaCount}>
                  <strong>{activities.toLocaleString()}</strong> Activities
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
