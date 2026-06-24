'use client'
import styles from './ActivitiesByType.module.css'
import { PieChart, Pie, Cell } from 'recharts'
import NotFound from '@/components/ui/NotFound/NotFound'

const COLORS = ['#F2464A', '#70EA8D', '#F3921B', '#F0C028', '#3DA1D8', '#AF83EA']

function ActivityDonut({ chartData }) {
  return (
    <PieChart width={124} height={124} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <Pie
        data={chartData}
        cx={62}
        cy={62}
        innerRadius={36}
        outerRadius={58}
        startAngle={90}
        endAngle={-270}
        dataKey="pct"
        paddingAngle={2}
        strokeWidth={0}
      >
        {chartData.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

export default function ActivitiesByType({ data = [] }) {
  const total = data.reduce((sum, d) => sum + (d.doc_count ?? 0), 0) || 1

  const chartData = data.slice(0, 6).map((d, i) => ({
    label: d.crime_type,
    count: d.doc_count ?? 0,
    pct: Math.round(((d.doc_count ?? 0) / total) * 100),
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Activities by Type</h2>
        <a href="/activities" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">
        {chartData.length === 0 ? (
          <NotFound title="No activity data" message="No crime type data is available right now." />
        ) : (
          <div className={styles.body}>
            <div className={styles.chartWrap}>
              <ActivityDonut chartData={chartData} />
            </div>
            <ul className={styles.legend}>
              {chartData.map(({ label, pct, count, color }) => (
                <li key={label} className={styles.row}>
                  <span
                    className={styles.swatch}
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className={styles.label} title={label}>{label}</span>
                  <span className={styles.value}>{pct}%&nbsp;({count.toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
