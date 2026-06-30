'use client'
import styles from './GlobalMap.module.css'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { PieChart, Pie, Cell } from 'recharts'
import MapMarkers, { MapTooltip, useMapTooltip } from '@/components/ui/MapMarkers/MapMarkers'
import { useMapZoom, MapZoomControls } from '@/components/ui/MapMarkers/MapZoom'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const ROW_COLORS = ['#F2464A', '#F3921B', '#F3921B', '#F3921B', '#F3921B']

const THREAT_ORDER = ['high', 'medium', 'low']
const THREAT_COLORS = { high: '#F2464A', medium: '#F3921B', low: '#F0C028' }

function toTitleCase(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function buildDonutData(byThreatLevel) {
  if (!byThreatLevel?.length) return [{ value: 1, color: '#12304D' }]
  return THREAT_ORDER
    .map(level => {
      const found = byThreatLevel.find(x => x.threat_level?.toLowerCase() === level)
      return found ? { value: found.count, color: THREAT_COLORS[level] } : null
    })
    .filter(Boolean)
}

function DonutChart({ overview }) {
  const byThreat  = overview?.by_threat_level ?? []
  const donutData = buildDonutData(byThreat)
  const total     = overview?.total_articles ?? byThreat.reduce((s, x) => s + (x.count ?? 0), 0)

  return (
    <div className={styles.donutWrapper}>
      <PieChart width={108} height={108} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        {/* dark background track ring */}
        <Pie
          data={[{ value: 1 }]}
          cx={54}
          cy={54}
          innerRadius={33}
          outerRadius={46}
          dataKey="value"
          strokeWidth={0}
          fill="#091A29"
        />
        {/* colored segments */}
        <Pie
          data={donutData}
          cx={54}
          cy={54}
          innerRadius={33}
          outerRadius={46}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
          paddingAngle={0}
        >
          {donutData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className={styles.donutCenter}>
        <span className={styles.donutTotal}>{Number(total).toLocaleString()}</span>
        <span className={styles.donutLabel}>Total Activities</span>
      </div>
    </div>
  )
}

export default function GlobalMap({ hotspots = [], overview = null }) {
  const { hovered, setHovered, pos, onMouseMove } = useMapTooltip()
  const zoomCtl = useMapZoom()
  const maxCount = hotspots.length > 0 ? Math.max(...hotspots.map(h => h.doc_count ?? 0), 1) : 1

  const markers = hotspots
    .filter(h => h.lat != null && h.lng != null)
    .map((h, idx) => ({
      coords: [parseFloat(h.lng), parseFloat(h.lat)],
      r: 2.5 + ((h.doc_count ?? 0) / maxCount) * 4.5,
      color: idx === 0 ? '#F2464A' : '#F3921B',
      label: toTitleCase(h.location ?? ''),
      count: `${(h.doc_count ?? 0).toLocaleString()} Activities`,
    }))

  return (
    <div className="section-card h-100">
      <div className="section-card-header">
        <h2 className="section-card-title">Global Activity Map</h2>
        <a href="/heatmap" className="linkButton">View Fullscreen</a>
      </div>
      <div className="section-card-content h-100">
        <div className={styles.inner}>

          {/* World map */}
          <div className={styles.mapArea} style={{ position: 'relative' }} onMouseMove={onMouseMove}>
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: 145, center: [10, 5] }}
              width={800}
              height={380}
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
          </div>

          {/* Hotspot Analysis */}
          <div className={styles.analysis}>
            <h3 className={styles.analysisTitle}>Hotspot Analysis</h3>
            <div className={styles.analysisBody}>
              <div className={styles.hotspotList}>
                {hotspots.slice(0, 5).map(({ location, doc_count }, idx) => (
                  <div key={location} className={styles.hotspotRow}>
                    <span className={styles.rank}>{idx + 1}.</span>
                    <span className={styles.city}>{toTitleCase(location)}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width:      `${((doc_count ?? 0) / maxCount) * 100}%`,
                          background: ROW_COLORS[idx],
                        }}
                      />
                    </div>
                    <span className={styles.count}>{(doc_count ?? 0).toLocaleString()} Activities</span>
                  </div>
                ))}
              </div>
              <DonutChart overview={overview} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
