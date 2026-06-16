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
  most:     '#F2464A',
  moderate: '#F3921B',
  limited:  '#1BB1F0',
}

export default function GangTerritorialMap({ territories }) {
  const [activeTab, setActiveTab] = useState('mostPresence')

  if (!territories) return null

  const cities = territories[activeTab] ?? []
  const maxCount = cities.length > 0 ? cities[0].count : 1
  const resultCount =
    activeTab === 'mostPresence'     ? territories.mostPresenceCount :
    activeTab === 'moderatePresence' ? territories.moderatePresenceCount :
    territories.limitedPresenceCount

  return (
    <div className={styles.wrap}>

      {/* 1. Map */}
      <div className={styles.mapWrap}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 145, center: [10, 5] }}
          width={800}
          height={360}
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

          {(territories.markers ?? []).map((m, i) => {
            const color = MARKER_COLORS[m.type] ?? MARKER_COLORS.most
            return (
              <Marker key={i} coordinates={m.coords}>
                <circle r={m.r * 3.2} fill={color} fillOpacity={0.07} />
                <circle r={m.r * 2}   fill={color} fillOpacity={0.15} />
                <circle r={m.r}       fill={color} fillOpacity={0.6}  />
                <circle r={m.r * 0.5} fill={color} />
              </Marker>
            )
          })}
        </ComposableMap>
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
