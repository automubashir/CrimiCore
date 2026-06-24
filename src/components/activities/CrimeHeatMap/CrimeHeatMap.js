'use client'
import styles from './CrimeHeatMap.module.css'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function toTitleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function CrimeHeatMap({ locations = [] }) {
  const maxCount = locations.length > 0 ? Math.max(...locations.map(l => l.doc_count ?? 0), 1) : 1

  const markers = locations
    .filter(l => l.lat != null && l.lng != null)
    .map((l, idx) => ({
      coords: [parseFloat(l.lng), parseFloat(l.lat)],
      r:      2.5 + ((l.doc_count ?? 0) / maxCount) * 4.5,
      color:  idx === 0 ? '#F2464A' : '#F3921B',
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

          {markers.map((m, i) => (
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
