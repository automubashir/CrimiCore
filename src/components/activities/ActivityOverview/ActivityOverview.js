'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import styles from './ActivityOverview.module.css'

const DATA = [
  { label: 'Robbery',          pct: 28, count: 349, color: '#F2464A' },
  { label: 'Drug Trafficking', pct: 24, count: 299, color: '#70EA8D' },
  { label: 'Homicide',         pct: 18, count: 225, color: '#F3921B' },
  { label: 'Vehicle Crime',    pct: 14, count: 174, color: '#F0C028' },
  { label: 'Assault',          pct: 8,  count: 112, color: '#3DA1D8' },
  { label: 'Terrorism',        pct: 7,  count: 112, color: '#AF83EA' },
]

export default function ActivityOverview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Activity Overview</h2>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            {mounted ? (
              <PieChart width={120} height={120} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={DATA}
                  cx={60}
                  cy={60}
                  innerRadius={34}
                  outerRadius={56}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="pct"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div style={{ width: 120, height: 120 }} />
            )}
          </div>
          <ul className={styles.legend}>
            {DATA.map(({ label, pct, count, color }) => (
              <li key={label} className={styles.row}>
                <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{pct}%&nbsp;({count})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
