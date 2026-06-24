'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import styles from './ThreatDistribution.module.css'

export default function ThreatDistribution({ pieStats }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const pieData = [
    { label: 'High Threat',   pct: pieStats?.high?.pct   ?? 0, count: pieStats?.high?.count   ?? 0, color: '#F2464A' },
    { label: 'Medium Threat', pct: pieStats?.medium?.pct ?? 0, count: pieStats?.medium?.count ?? 0, color: '#F3921B' },
    { label: 'Low Threat',    pct: pieStats?.low?.pct    ?? 0, count: pieStats?.low?.count    ?? 0, color: '#70EA8D' },
  ]
  const total = pieStats?.total ?? 0

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Threat Distribution</h2>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            {mounted ? (
              <PieChart width={160} height={160} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={pieData}
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
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div style={{ width: 160, height: 160 }} />
            )}
            <div className={styles.centerLabel} aria-hidden="true">
              <span className={styles.centerNum}>{total.toLocaleString()}</span>
              <span className={styles.centerText}>Total Criminals</span>
            </div>
          </div>

          <ul className={styles.legend}>
            {pieData.map(({ label, count, pct, color }) => (
              <li key={label} className={styles.legendRow}>
                <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
                <span className={styles.legendLabel}>{label}</span>
                <span className={styles.legendValue}>{count.toLocaleString()} ({pct}%)</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
