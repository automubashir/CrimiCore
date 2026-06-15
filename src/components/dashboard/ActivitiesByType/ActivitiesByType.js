'use client'
import styles from './ActivitiesByType.module.css'
import { PieChart, Pie, Cell } from 'recharts'

/*
  Colors are mapped directly to design-system tokens:
  error-primary  #F2464A  |  success-primary #70EA8D
  alert-primary  #F3921B  |  warning-primary #F0C028
  info-primary   #3DA1D8  |  indigo-primary  #AF83EA
*/

const DATA = [
  { label: 'Robbery',          pct: 28, count: 349, color: '#F2464A' },
  { label: 'Drug Trafficking', pct: 24, count: 299, color: '#70EA8D' },
  { label: 'Homicide',         pct: 18, count: 225, color: '#F3921B' },
  { label: 'Vehicle Crime',    pct: 14, count: 174, color: '#F0C028' },
  { label: 'Assault',          pct: 8,  count: 112, color: '#3DA1D8' },
  { label: 'Terrorism',        pct: 7,  count: 112, color: '#AF83EA' },
]

function ActivityDonut() {
  return (
    <PieChart width={124} height={124} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <Pie
        data={DATA}
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
        {DATA.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

export default function ActivitiesByType() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Activities by Type</h2>
        <a href="/activities" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>

          {/* Donut chart */}
          <div className={styles.chartWrap}>
            <ActivityDonut />
          </div>

          {/* Legend */}
          <ul className={styles.legend}>
            {DATA.map(({ label, pct, count, color }) => (
              <li key={label} className={styles.row}>
                <span
                  className={styles.swatch}
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <span className={styles.label} title={label}>{label}</span>
                <span className={styles.value}>{pct}%&nbsp;({count})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
