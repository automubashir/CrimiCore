'use client'
import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { PieChart, Pie, Cell } from 'recharts'
import styles from './HeatmapView.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// [lng, lat] centroids for country name labels
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

const MAP_MARKERS = [
  {
    coords: [-87.6298, 41.8781], r: 7, color: '#F2464A',
    city: 'Chicago', country: 'USA', activities: 187,
    crimes: ['Drug Trafficking', 'Assault', 'Robbery'], trend: '+12%', risk: 'High',
  },
  {
    coords: [-118.2437, 34.0522], r: 5, color: '#F2464A',
    city: 'Los Angeles', country: 'USA', activities: 134,
    crimes: ['Gang Activity', 'Drug Trafficking', 'Robbery'], trend: '+8%', risk: 'High',
  },
  {
    coords: [-99.1332, 19.4326], r: 5, color: '#F3921B',
    city: 'Mexico City', country: 'Mexico', activities: 85,
    crimes: ['Drug Trafficking', 'Extortion'], trend: '+5%', risk: 'Medium',
  },
  {
    coords: [-46.6333, -23.5505], r: 4, color: '#F3921B',
    city: 'São Paulo', country: 'Brazil', activities: 74,
    crimes: ['Armed Robbery', 'Gang Activity'], trend: '-2%', risk: 'Medium',
  },
  {
    coords: [28.0473, -26.2041], r: 5, color: '#F3921B',
    city: 'Johannesburg', country: 'South Africa', activities: 97,
    crimes: ['Armed Robbery', 'Fraud', 'Assault'], trend: '+3%', risk: 'Medium',
  },
  {
    coords: [3.3792, 6.5244], r: 4, color: '#F2464A',
    city: 'Lagos', country: 'Nigeria', activities: 91,
    crimes: ['Cybercrime', 'Fraud', 'Gang Activity'], trend: '+18%', risk: 'High',
  },
  {
    coords: [31.2357, 30.0444], r: 3, color: '#F3921B',
    city: 'Cairo', country: 'Egypt', activities: 56,
    crimes: ['Trafficking', 'Assault'], trend: '+1%', risk: 'Medium',
  },
  {
    coords: [2.3522, 48.8566], r: 3.5, color: '#F3921B',
    city: 'Paris', country: 'France', activities: 68,
    crimes: ['Fraud', 'Robbery', 'Cybercrime'], trend: '-4%', risk: 'Medium',
  },
  {
    coords: [-0.1276, 51.5074], r: 3, color: '#F0C028',
    city: 'London', country: 'UK', activities: 49,
    crimes: ['Cybercrime', 'Fraud'], trend: '-7%', risk: 'Low',
  },
  {
    coords: [44.3661, 33.3152], r: 3, color: '#F3921B',
    city: 'Baghdad', country: 'Iraq', activities: 62,
    crimes: ['Trafficking', 'Extortion'], trend: '+2%', risk: 'Medium',
  },
  {
    coords: [67.0099, 24.8607], r: 3, color: '#F3921B',
    city: 'Karachi', country: 'Pakistan', activities: 58,
    crimes: ['Drug Trafficking', 'Gang Activity'], trend: '+6%', risk: 'Medium',
  },
  {
    coords: [72.8777, 19.076], r: 3.5, color: '#F3921B',
    city: 'Mumbai', country: 'India', activities: 79,
    crimes: ['Fraud', 'Extortion', 'Gang Activity'], trend: '+4%', risk: 'Medium',
  },
  {
    coords: [139.6917, 35.6895], r: 3.5, color: '#F3921B',
    city: 'Tokyo', country: 'Japan', activities: 72,
    crimes: ['Cybercrime', 'Fraud'], trend: '-1%', risk: 'Medium',
  },
  {
    coords: [100.9925, 15.87], r: 2.5, color: '#F0C028',
    city: 'Southeast Asia', country: 'Regional', activities: 43,
    crimes: ['Trafficking', 'Drug Trade'], trend: '+9%', risk: 'Low',
  },
]

const HOTSPOTS = MAP_MARKERS
  .slice()
  .sort((a, b) => b.activities - a.activities)
  .slice(0, 8)

const MAX_ACT = 187

const STATS = [
  { label: 'Active Hotspots',  value: '14',      sub: 'Across 6 continents'  },
  { label: 'Total Activities', value: '813',     sub: 'Last 30 days'         },
  { label: 'Highest Density',  value: 'Chicago', sub: '187 activities'       },
  { label: 'High Risk Zones',  value: '4',       sub: 'Critical alert level' },
]

const DONUT_DATA = [
  { value: 53, color: '#F2464A' },
  { value: 27, color: '#F3921B' },
  { value: 20, color: '#F0C028' },
]

const LEGEND = [
  { color: '#F2464A', label: 'High Risk'   },
  { color: '#F3921B', label: 'Medium Risk' },
  { color: '#F0C028', label: 'Low Risk'    },
]

const CRIME_TYPES  = ['All Crime Types', 'Drug Trafficking', 'Assault', 'Robbery', 'Homicide', 'Fraud']
const TIME_PERIODS = ['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year', 'All Time']

const RISK_COLOR = { High: '#F2464A', Medium: '#F3921B', Low: '#F0C028' }

const MIN_ZOOM = 1
const MAX_ZOOM = 8

export default function HeatmapView() {
  const [crimeType,    setCrimeType]    = useState(CRIME_TYPES[0])
  const [timePeriod,   setTimePeriod]   = useState(TIME_PERIODS[0])
  const [zoom,         setZoom]         = useState(1)
  const [center,       setCenter]       = useState([0, 0])
  const [activeMarker, setActiveMarker] = useState(null)

  function handleMoveEnd({ coordinates, zoom: newZoom }) {
    setCenter(coordinates)
    setZoom(newZoom)
  }

  function handleZoomIn()  { setZoom(z => Math.min(+(z + 0.75).toFixed(2), MAX_ZOOM)) }
  function handleZoomOut() { setZoom(z => Math.max(+(z - 0.75).toFixed(2), MIN_ZOOM)) }
  function handleReset()   { setZoom(1); setCenter([0, 0]); setActiveMarker(null) }

  function handleMarkerClick(e, marker) {
    e.stopPropagation()
    setActiveMarker(prev => prev?.city === marker.city ? null : marker)
  }

  return (
    <div className={styles.page}>

      {/* ── Controls bar ── */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <h1 className={styles.pageTitle}>Heatmap</h1>
          <p className={styles.pageSubtitle}>Crime density & hotspot analysis across regions</p>
        </div>
        <div className={styles.controlsRight}>
          <select className={styles.select} value={crimeType}  onChange={e => setCrimeType(e.target.value)}>
            {CRIME_TYPES.map(t  => <option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} value={timePeriod} onChange={e => setTimePeriod(e.target.value)}>
            {TIME_PERIODS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        {STATS.map(({ label, value, sub }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statSub}>{sub}</span>
          </div>
        ))}
      </div>

      {/* ── Map ── */}
      <div className={styles.mapSection} onClick={() => setActiveMarker(null)}>

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

            {MAP_MARKERS.map((m, i) => (
              <Marker
                key={i}
                coordinates={m.coords}
                onClick={e => handleMarkerClick(e, m)}
                style={{ cursor: 'pointer' }}
              >
                <circle r={m.r * 3.2} fill={m.color} fillOpacity={0.07} />
                <circle r={m.r * 2}   fill={m.color} fillOpacity={0.15} />
                <circle
                  r={m.r}
                  fill={m.color}
                  fillOpacity={activeMarker?.city === m.city ? 1 : 0.6}
                  stroke={activeMarker?.city === m.city ? '#fff' : 'none'}
                  strokeWidth={activeMarker?.city === m.city ? 1.5 / zoom : 0}
                />
                <circle r={m.r * 0.5} fill={m.color} />
              </Marker>
            ))}
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

        {/* Active marker popup */}
        {activeMarker && (
          <div className={styles.markerPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div className={styles.popupDot} style={{ background: activeMarker.color }} />
              <div>
                <p className={styles.popupCity}>{activeMarker.city}</p>
                <p className={styles.popupCountry}>{activeMarker.country}</p>
              </div>
              <button
                className={styles.popupClose}
                onClick={() => setActiveMarker(null)}
                aria-label="Close"
              >×</button>
            </div>
            <div className={styles.popupStats}>
              <div className={styles.popupStat}>
                <span className={styles.popupStatValue} style={{ color: activeMarker.color }}>
                  {activeMarker.activities}
                </span>
                <span className={styles.popupStatLabel}>Activities</span>
              </div>
              <div className={styles.popupDivider} />
              <div className={styles.popupStat}>
                <span
                  className={styles.popupStatValue}
                  style={{ color: activeMarker.trend.startsWith('+') ? '#F2464A' : '#70EA8D' }}
                >
                  {activeMarker.trend}
                </span>
                <span className={styles.popupStatLabel}>Trend (30d)</span>
              </div>
              <div className={styles.popupDivider} />
              <div className={styles.popupStat}>
                <span className={styles.popupStatValue} style={{ color: RISK_COLOR[activeMarker.risk] }}>
                  {activeMarker.risk}
                </span>
                <span className={styles.popupStatLabel}>Risk Level</span>
              </div>
            </div>
            <div className={styles.popupCrimes}>
              {activeMarker.crimes.map(c => (
                <span key={c} className={styles.popupCrimeTag}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Hotspot ranking — bottom-left overlay */}
        <div className={styles.hotspotOverlay}>
          <p className={styles.overlayTitle}>Hotspot Analysis</p>
          <div className={styles.hotspotList}>
            {HOTSPOTS.map(({ city, country, activities, color }, i) => (
              <div key={city} className={styles.hotspotRow}>
                <span className={styles.rank}>{i + 1}.</span>
                <span className={styles.city}>{city}, {country}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(activities / MAX_ACT) * 100}%`, background: color }}
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
                data={DONUT_DATA}
                cx={45} cy={45}
                innerRadius={27} outerRadius={39}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className={styles.donutCenter}>
              <span className={styles.donutTotal}>813</span>
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
