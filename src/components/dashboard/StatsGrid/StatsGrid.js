import styles from './StatsGrid.module.css'

const STATS = [
  { label: 'Total Activities',  value: '1,248', variant: 'default' },
  { label: 'Active Gangs',      value: '342',   variant: 'default' },
  { label: 'Known Criminals',   value: '1,756', variant: 'default' },
  { label: 'Active Watchlist',  value: '186',   variant: 'default' },
  { label: 'High Threat Alert', value: '12',    variant: 'alert'   },
]

export default function StatsGrid() {
  return (
    <section className={styles.section} aria-label="System statistics">
      <div className={styles.grid}>
        {STATS.map(({ label, value, variant }) => {
          const isAlert = variant === 'alert'
          return (
            <div
              key={label}
              className={`${styles.card} ${isAlert ? styles.cardAlert : ''}`}
            >
              <div className={`${styles.circle} ${isAlert ? styles.circleAlert : ''}`} />
              <div className={styles.info}>
                <span className={`${styles.label} ${isAlert ? styles.labelAlert : ''}`}>
                  {label}
                </span>
                <span className={styles.value}>{value}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
