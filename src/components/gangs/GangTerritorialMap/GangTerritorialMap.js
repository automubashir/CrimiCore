'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import styles from './GangTerritorialMap.module.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const PRESENCE_TABS = [
  { key: 'mostPresence',     label: 'Most Presence' },
  { key: 'moderatePresence', label: 'Moderate Presence' },
  { key: 'limitedPresence',  label: 'Limited Presence' },
]

const MARKER_COLORS = {
  most:     { fill: 'rgba(242, 70, 74, 0.85)',  ring: 'rgba(242, 70, 74, 0.25)' },
  moderate: { fill: 'rgba(243, 146, 27, 0.85)', ring: 'rgba(243, 146, 27, 0.25)' },
  limited:  { fill: 'rgba(27, 177, 240, 0.85)', ring: 'rgba(27, 177, 240, 0.25)' },
}

export default function GangTerritorialMap({ territories }) {
  const [activeTab, setActiveTab] = useState('mostPresence')

  if (!territories) return null

  const cities = territories[activeTab] ?? []
  const maxCount = cities.length > 0 ? cities[0].count : 1

  return (
    <div className={styles.wrap}>
      {/* Presence tabs */}
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

      {/* Map + city list */}
      <div className={styles.body}>
        {/* Map */}
        <div className={styles.mapWrap}>
          <ComposableMap
            projectionConfig={{ scale: 120, center: [0, 10] }}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#091A29"
                    stroke="#12304D"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover:   { outline: 'none', fill: '#0d2540' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {(territories.markers ?? []).map((m, i) => {
              const color = MARKER_COLORS[m.type] ?? MARKER_COLORS.most
              return (
                <Marker key={i} coordinates={m.coords}>
                  <circle r={m.r + 4} fill={color.ring} />
                  <circle r={m.r}     fill={color.fill} />
                </Marker>
              )
            })}
          </ComposableMap>
        </div>

        {/* City ranking */}
        <div className={styles.cityList}>
          <div className={styles.cityListHeader}>
            <span className={styles.cityCol}>City</span>
            <span className={styles.countCol}>Count</span>
          </div>
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

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotMost}`} />
          Most Presence
          <strong className={styles.legendCount}>{territories.mostPresenceCount}</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotModerate}`} />
          Moderate Presence
          <strong className={styles.legendCount}>{territories.moderatePresenceCount}</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotLimited}`} />
          Limited Presence
          <strong className={styles.legendCount}>{territories.limitedPresenceCount}</strong>
        </span>
      </div>
    </div>
  )
}
