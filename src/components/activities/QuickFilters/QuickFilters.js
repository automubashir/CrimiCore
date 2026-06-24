import styles from './QuickFilters.module.css'

export default function QuickFilters({ overview = null, todayCount = 0 }) {
  const highCount = overview?.by_threat_level
    ?.find(x => x.threat_level?.toLowerCase() === 'high')?.count ?? null

  const FILTERS = [
    { label: 'High Threats Only',  count: highCount, color: '#F2464A' },
    { label: 'My Watchlist',       count: null,      color: '#F0C028' },
    { label: "Today's Activities", count: todayCount || null, color: '#F3921B' },
  ]

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Quick Filters</h2>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {FILTERS.map(({ label, count, color }) => (
            <li key={label} className={styles.item}>
              <button className={styles.btn} type="button">
                <span className={styles.dot} style={{ background: color }} aria-hidden="true" />
                <span className={styles.label}>{label}</span>
                <span className={styles.count}>{count != null ? count.toLocaleString() : '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
