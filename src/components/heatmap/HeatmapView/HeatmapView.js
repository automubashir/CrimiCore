'use client'
import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { PieChart, Pie, Cell } from 'recharts'
import MapMarkers from '@/components/ui/MapMarkers/MapMarkers'
import styles from './HeatmapView.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const COUNTRY_LABELS = [
  { name: 'Canada',        coords: [-96,    60]    },
  { name: 'USA',           coords: [-100,   38]    },
  { name: 'Mexico',        coords: [-102,   24]    },
  { name: 'Brazil',        coords: [-52,   -10]    },
  { name: 'Argentina',     coords: [-65,   -35]    },
  { name: 'Colombia',      coords: [-74,     4]    },
  { name: 'Peru',          coords: [-76,   -10]    },
  { name: 'Greenland',     coords: [-42,    72]    },
  { name: 'UK',            coords: [ -2,    54]    },
  { name: 'France',        coords: [  2,    46]    },
  { name: 'Germany',       coords: [ 10,    51]    },
  { name: 'Spain',         coords: [ -4,    40]    },
  { name: 'Italy',         coords: [ 12,    43]    },
  { name: 'Sweden',        coords: [ 18,    62]    },
  { name: 'Ukraine',       coords: [ 32,    49]    },
  { name: 'Russia',        coords: [ 98,    62]    },
  { name: 'Kazakhstan',    coords: [ 67,    48]    },
  { name: 'Turkey',        coords: [ 35,    39]    },
  { name: 'Saudi Arabia',  coords: [ 45,    24]    },
  { name: 'Iran',          coords: [ 53,    32]    },
  { name: 'Pakistan',      coords: [ 70,    30]    },
  { name: 'India',         coords: [ 79,    22]    },
  { name: 'China',         coords: [105,    36]    },
  { name: 'Mongolia',      coords: [105,    46]    },
  { name: 'Myanmar',       coords: [ 96,    19]    },
  { name: 'Japan',         coords: [137,    36]    },
  { name: 'Indonesia',     coords: [117,    -4]    },
  { name: 'Australia',     coords: [134,   -26]    },
  { name: 'Egypt',         coords: [ 30,    26]    },
  { name: 'Libya',         coords: [ 17,    26]    },
  { name: 'Algeria',       coords: [  3,    28]    },
  { name: 'Mali',          coords: [ -2,    18]    },
  { name: 'Sudan',         coords: [ 30,    16]    },
  { name: 'Congo',         coords: [ 24,    -2]    },
  { name: 'Ethiopia',      coords: [ 40,     9]    },
  { name: 'Nigeria',       coords: [  8,    10]    },
  { name: 'Angola',        coords: [ 18,   -12]    },
  { name: 'Mozambique',    coords: [ 35,   -18]    },
  { name: 'S. Africa',     coords: [ 25,   -29]    },
  { name: 'Madagascar',    coords: [ 47,   -20]    },
]

const LEGEND = [
  { color: '#F2464A', label: 'High Risk'   },
  { color: '#F3921B', label: 'Medium Risk' },
  { color: '#F0C028', label: 'Low Risk'    },
]

const TIME_PERIODS = ['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year', 'All Time']
const RISK_COLOR   = { High: '#F2464A', Medium: '#F3921B', Low: '#F0C028' }
const MIN_ZOOM = 1
const MAX_ZOOM = 8

export default function HeatmapView({
  markers            = [],
  hotspots           = [],
  maxAct             = 1,
  stats              = [],
  donutData          = [],
  totalCount         = 0,
  crimeTypes         = ['All Crime Types'],
  crimeType:         crimeTypeProp,
  timePeriod:        timePeriodProp,
  onCrimeTypeChange,
  onTimePeriodChange,
  loading            = false,
}) {
  const crimeType  = crimeTypeProp  ?? crimeTypes[0] ?? 'All Crime Types'
  const timePeriod = timePeriodProp ?? TIME_PERIODS[4]
  const [zoom,          setZoom]          = useState(1)
  const [center,        setCenter]        = useState([0, 0])
  const [activeMarker,  setActiveMarker]  = useState(null)
  const [hoveredMarker, setHoveredMarker] = useState(null)

  const popupMarker = hoveredMarker ?? activeMarker

  function handleMoveEnd({ coordinates, zoom: newZoom }) {
    setCenter(coordinates)
    setZoom(newZoom)
  }

  function handleZoomIn()  { setZoom(z => Math.min(+(z + 0.75).toFixed(2), MAX_ZOOM)) }
  function handleZoomOut() { setZoom(z => Math.max(+(z - 0.75).toFixed(2), MIN_ZOOM)) }
  function handleReset()   { setZoom(1); setCenter([0, 0]); setActiveMarker(null); setHoveredMarker(null) }

  function handleSelect(m) {
    setActiveMarker(prev => (prev?._id === m._id ? null : m))
  }

  return (
    <div className={styles.page}>

      {/* ── Controls bar ── */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <h1 className={styles.pageTitle}>Heatmap</h1>
          <p className={styles.pageSubtitle}>Crime density &amp; hotspot analysis across regions</p>
        </div>
        <div className={styles.controlsRight}>
          <select className={styles.select} value={crimeType}  onChange={e => onCrimeTypeChange?.(e.target.value)}>
            {crimeTypes.map(t  => <option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} value={timePeriod} onChange={e => onTimePeriodChange?.(e.target.value)}>
            {TIME_PERIODS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        {stats.map(({ label, value, sub }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statSub}>{sub}</span>
          </div>
        ))}
      </div>

      {/* ── Map ── */}
      <div className={styles.mapSection} onClick={() => setActiveMarker(null)}>
        {loading && <div className={styles.mapLoadingOverlay}><span className={styles.mapLoadingText}>Loading…</span></div>}

        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 160, center: [10, 5] }}
          width={800}
          height={500}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
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

            {COUNTRY_LABELS.map(({ name, coords }) => (
              <Marker key={name} coordinates={coords}>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={3.5}
                  fontFamily="IBM Plex Sans, sans-serif"
                  fontWeight={500}
                  letterSpacing={0.4}
                  fill="#2E5470"
                  pointerEvents="none"
                  style={{ userSelect: 'none' }}
                >
                  {name.toUpperCase()}
                </text>
              </Marker>
            ))}

            <MapMarkers
              markers={markers}
              zoom={zoom}
              selectedId={activeMarker?._id ?? null}
              onHoverChange={setHoveredMarker}
              onSelect={handleSelect}
            />
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls */}
        <div className={styles.zoomControls}>
          <button
            className={styles.zoomBtn}
            onClick={e => { e.stopPropagation(); handleZoomIn() }}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >+</button>
          <button
            className={styles.zoomBtn}
            onClick={e => { e.stopPropagation(); handleReset() }}
            aria-label="Reset view"
            title="Reset view"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
              <path d="M1 8a7 7 0 1 0 7-7" strokeLinecap="round"/>
              <path d="M1 3.5V8h4.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className={styles.zoomBtn}
            onClick={e => { e.stopPropagation(); handleZoomOut() }}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >−</button>
        </div>

        {/* Marker popup — shown on hover, or pinned open on click */}
        {popupMarker && (
          <div className={styles.markerPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div className={styles.popupDot} style={{ background: popupMarker.color }} />
              <div>
                <p className={styles.popupCity}>{popupMarker.city}</p>
                <p className={styles.popupCountry}>{popupMarker.country}</p>
              </div>
              {activeMarker?._id === popupMarker._id && (
                <button
                  className={styles.popupClose}
                  onClick={() => setActiveId(null)}
                  aria-label="Close"
                >×</button>
              )}
            </div>
            <div className={styles.popupStats}>
              <div className={styles.popupStat}>
                <span className={styles.popupStatValue} style={{ color: popupMarker.color }}>
                  {popupMarker.activities}
                </span>
                <span className={styles.popupStatLabel}>Activities</span>
              </div>
              <div className={styles.popupDivider} />
              <div className={styles.popupStat}>
                <span
                  className={styles.popupStatValue}
                  style={{ color: popupMarker.trend?.startsWith('+') ? '#F2464A' : '#70EA8D' }}
                >
                  {popupMarker.trend}
                </span>
                <span className={styles.popupStatLabel}>Trend (30d)</span>
              </div>
              <div className={styles.popupDivider} />
              <div className={styles.popupStat}>
                <span className={styles.popupStatValue} style={{ color: RISK_COLOR[popupMarker.risk] }}>
                  {popupMarker.risk}
                </span>
                <span className={styles.popupStatLabel}>Risk Level</span>
              </div>
            </div>
            <div className={styles.popupCrimes}>
              {(popupMarker.crimeTypes ?? []).map(c => (
                <span key={c} className={styles.popupCrimeTag}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Hotspot ranking — bottom-left overlay */}
        <div className={styles.hotspotOverlay}>
          <p className={styles.overlayTitle}>Hotspot Analysis</p>
          <div className={styles.hotspotList}>
            {hotspots.map(({ city, country, activities, color }, i) => (
              <div key={city} className={styles.hotspotRow}>
                <span className={styles.rank}>{i + 1}.</span>
                <span className={styles.city}>{city}{country ? `, ${country}` : ''}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(activities / maxAct) * 100}%`, background: color }}
                  />
                </div>
                <span className={styles.count}><strong>{activities}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution donut + legend — bottom-right overlay */}
        <div className={styles.legendOverlay}>
          <div className={styles.donutWrapper}>
            <PieChart width={90} height={90} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={[{ value: 1 }]}
                cx={45} cy={45}
                innerRadius={27} outerRadius={39}
                dataKey="value"
                strokeWidth={0}
                fill="#091A29"
              />
              <Pie
                data={donutData}
                cx={45} cy={45}
                innerRadius={27} outerRadius={39}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className={styles.donutCenter}>
              <span className={styles.donutTotal}>{totalCount.toLocaleString()}</span>
              <span className={styles.donutLabel}>Total</span>
            </div>
          </div>
          <div className={styles.legendList}>
            {LEGEND.map(({ color, label }) => (
              <div key={label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: color }} />
                <span className={styles.legendLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
