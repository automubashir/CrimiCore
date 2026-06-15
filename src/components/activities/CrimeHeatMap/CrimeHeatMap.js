'use client'
import styles from './CrimeHeatMap.module.css'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

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

const ACTIVE_AREAS = [
  { rank: 1, city: 'Chicago (USA)',       activities: 187, color: '#F2464A' },
  { rank: 2, city: 'Johannesburg, SA',    activities: 97,  color: '#F3921B' },
  { rank: 3, city: 'Mexico City, Mexico', activities: 85,  color: '#F3921B' },
  { rank: 4, city: 'Tokyo, Japan',        activities: 72,  color: '#F3921B' },
  { rank: 5, city: 'Paris, France',       activities: 68,  color: '#F3921B' },
]
const MAX_ACT = 187

export default function CrimeHeatMap() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Crime Heat Map</h3>
      </div>
      <div className={styles.mapWrap}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 145, center: [10, 5] }}
          width={800}
          height={400}
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
              <circle r={m.r * 3.2} fill={m.color} fillOpacity={0.07} />
              <circle r={m.r * 2}   fill={m.color} fillOpacity={0.15} />
              <circle r={m.r}       fill={m.color} fillOpacity={0.6} />
              <circle r={m.r * 0.5} fill={m.color} />
            </Marker>
          ))}
        </ComposableMap>

        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>Active Operating Area</p>
          <p className={styles.overlaySub}>
            Most active places where the mentioned criminals are operating
          </p>
          <div className={styles.areaList}>
            {ACTIVE_AREAS.map(({ rank, city, activities, color }) => (
              <div key={rank} className={styles.areaRow}>
                <span className={styles.areaRank}>{rank}.</span>
                <span className={styles.areaCity}>{city}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(activities / MAX_ACT) * 100}%`, background: color }}
                  />
                </div>
                <span className={styles.areaCount}>
                  <strong>{activities}</strong> Activities
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
