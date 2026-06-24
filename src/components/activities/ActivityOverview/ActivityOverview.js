'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import styles from './ActivityOverview.module.css'

const COLORS = ['#F2464A', '#70EA8D', '#F3921B', '#F0C028', '#3DA1D8', '#AF83EA']

export default function ActivityOverview({ crimeTypes = [] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const total = crimeTypes.reduce((s, d) => s + (d.doc_count ?? 0), 0) || 1
  const data = crimeTypes.slice(0, 6).map((d, i) => ({
    label: d.crime_type,
    pct:   Math.round(((d.doc_count ?? 0) / total) * 100),
    count: d.doc_count ?? 0,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Activity Overview</h2>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            {mounted && data.length > 0 ? (
              <PieChart width={120} height={120} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
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
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div style={{ width: 120, height: 120 }} />
            )}
          </div>
          <ul className={styles.legend}>
            {data.map(({ label, pct, count, color }) => (
              <li key={label} className={styles.row}>
                <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{pct}%&nbsp;({count.toLocaleString()})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
