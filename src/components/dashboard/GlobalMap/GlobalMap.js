'use client'
import styles from './GlobalMap.module.css'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { PieChart, Pie, Cell } from 'recharts'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const HOTSPOTS = [
  { rank: 1, city: 'Chicago (USA)',        activities: 187, color: '#F2464A' },
  { rank: 2, city: 'Johannesburg, SA',     activities: 97,  color: '#F3921B' },
  { rank: 3, city: 'Mexico City, Mexico',  activities: 85,  color: '#F3921B' },
  { rank: 4, city: 'Tokyo, Japan',         activities: 72,  color: '#F3921B' },
  { rank: 5, city: 'Paris, France',        activities: 68,  color: '#F3921B' },
]
const MAX_ACT = 187
const TOTAL   = 424

/* Geographic coordinates [lng, lat] for each hotspot marker */
const MAP_MARKERS = [
  { coords: [-87.6298, 41.8781], r: 7,   color: '#F2464A' }, // Chicago
  { coords: [-99.1332, 19.4326], r: 5,   color: '#F3921B' }, // Mexico City
  { coords: [28.0473, -26.2041], r: 5,   color: '#F3921B' }, // Johannesburg
  { coords: [2.3522,  48.8566],  r: 3.5, color: '#F3921B' }, // Paris
  { coords: [139.6917, 35.6895], r: 3.5, color: '#F3921B' }, // Tokyo
  { coords: [44.3661,  33.3152], r: 3,   color: '#F3921B' }, // Baghdad
  { coords: [3.3792,   6.5244],  r: 3,   color: '#F2464A' }, // Lagos
  { coords: [100.9925, 15.87],   r: 2.5, color: '#F0C028' }, // SE Asia
]

const DONUT_DATA = [
  { value: 53, color: '#F2464A' },
  { value: 27, color: '#F3921B' },
  { value: 20, color: '#F0C028' },
]

function DonutChart() {
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
          data={DONUT_DATA}
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
          {DONUT_DATA.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className={styles.donutCenter}>
        <span className={styles.donutTotal}>{TOTAL}</span>
        <span className={styles.donutLabel}>Total Activities</span>
      </div>
    </div>
  )
}

export default function GlobalMap() {
  return (
    <div className="section-card h-100">
      <div className="section-card-header">
        <h2 className="section-card-title">Global Activity Map</h2>
        <a href="/heatmap" className="linkButton">View Fullscreen</a>
      </div>
      <div className="section-card-content h-100">
        <div className={styles.inner}>

          {/* World map */}
          <div className={styles.mapArea}>
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: 145, center: [10, 5] }}
              width={800}
              height={380}
              style={{ width: '100%', height: '100%' }}
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

              {MAP_MARKERS.map((m, i) => (
                <Marker key={i} coordinates={m.coords}>
                  {/* layered circles create a soft glow effect */}
                  <circle r={m.r * 3.2} fill={m.color} fillOpacity={0.07} />
                  <circle r={m.r * 2}   fill={m.color} fillOpacity={0.15} />
                  <circle r={m.r}       fill={m.color} fillOpacity={0.6} />
                  <circle r={m.r * 0.5} fill={m.color} />
                </Marker>
              ))}
            </ComposableMap>
          </div>

          {/* Hotspot Analysis */}
          <div className={styles.analysis}>
            <h3 className={styles.analysisTitle}>Hotspot Analysis</h3>
            <div className={styles.analysisBody}>
              <div className={styles.hotspotList}>
                {HOTSPOTS.map(({ rank, city, activities, color }) => (
                  <div key={rank} className={styles.hotspotRow}>
                    <span className={styles.rank}>{rank}.</span>
                    <span className={styles.city}>{city}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width:      `${(activities / MAX_ACT) * 100}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <span className={styles.count}>{activities} Activities</span>
                  </div>
                ))}
              </div>
              <DonutChart />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
