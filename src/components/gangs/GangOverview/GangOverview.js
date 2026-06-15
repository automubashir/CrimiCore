'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { GANG_STATS } from '@/lib/data/gangs'
import styles from './GangOverview.module.css'

const PIE_DATA = [
  { label: 'High Threat',   pct: 9,  count: GANG_STATS.high,   color: '#F2464A' },
  { label: 'Medium Threat', pct: 28, count: GANG_STATS.medium, color: '#F3921B' },
  { label: 'Low Threat',    pct: 63, count: GANG_STATS.low,    color: '#70EA8D' },
]

export default function GangOverview() {
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
              <PieChart width={160} height={160} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={PIE_DATA}
                  cx={80}
                  cy={80}
                  innerRadius={52}
                  outerRadius={72}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="pct"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div style={{ width: 160, height: 160 }} />
            )}
            <div className={styles.centerLabel} aria-hidden="true">
              <span className={styles.centerNum}>{GANG_STATS.total}</span>
              <span className={styles.centerText}>Total Gangs</span>
            </div>
          </div>

          <ul className={styles.legend}>
            {PIE_DATA.map(({ label, count, pct, color }) => (
              <li key={label} className={styles.legendRow}>
                <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
                <span className={styles.legendLabel}>{label}</span>
                <span className={styles.legendValue}>{count} ({pct}%)</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
