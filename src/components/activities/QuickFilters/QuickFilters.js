import styles from './QuickFilters.module.css'

const FILTERS = [
  { label: 'High Threats Only',   count: 312, color: '#F2464A' },
  { label: 'My Watchlist',        count: 86,  color: '#F0C028' },
  { label: "Today's Activities",  count: 64,  color: '#F3921B' },
]

export default function QuickFilters() {
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
                <span className={styles.count}>{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
