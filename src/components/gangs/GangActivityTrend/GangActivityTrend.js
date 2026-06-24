'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import styles from './GangActivityTrend.module.css'

const LINES = [
  { key: 'high',   label: 'High Threat',   color: '#F2464A' },
  { key: 'medium', label: 'Medium Threat', color: '#F3921B' },
  { key: 'low',    label: 'Low Threat',    color: '#70EA8D' },
]

export default function GangActivityTrend({ trendData = [] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="section-card">
      <div className={`section-card-header ${styles.header}`}>
        <div>
          <h2 className="section-card-title">Gang Activity Trend</h2>
          <p className={styles.subtitle}>Last 30 Days</p>
        </div>
        <button className="linkButton" type="button">View Analytics</button>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          {mounted ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart
                data={trendData}
                margin={{ top: 8, right: 8, bottom: 0, left: -28 }}
              >
                <CartesianGrid
                  stroke="var(--border-secondary)"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: 'var(--text-tertiary)',
                    fontSize: 9,
                    fontFamily: 'var(--font-ibm-plex)',
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                  cursor={{ stroke: 'var(--border-primary)', strokeWidth: 1 }}
                />
                {LINES.map(({ key, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 150 }} />
          )}

          <ul className={styles.legend}>
            {LINES.map(({ key, label, color }) => (
              <li key={key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: color }} aria-hidden="true" />
                <span className={styles.legendLabel}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
