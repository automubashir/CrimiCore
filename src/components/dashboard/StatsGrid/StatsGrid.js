import styles from './StatsGrid.module.css'

function formatNumber(n) {
  if (n == null) return '--'
  return Number(n).toLocaleString()
}

function ActivityIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function GangsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CriminalsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      <line x1="17" y1="11" x2="22" y2="16" />
      <line x1="22" y1="11" x2="17" y2="16" />
    </svg>
  )
}

function WatchlistIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="5" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="19" />
      <line x1="5" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--error-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.4" />
    </svg>
  )
}

export default function StatsGrid({ stats }) {
  const highThreat = stats?.by_threat_level?.find(x => x.threat_level?.toLowerCase() === 'high')?.count ?? null

  const STATS = [
    { label: 'Total Activities',  value: formatNumber(stats?.total_articles),    variant: 'default', Icon: ActivityIcon  },
    { label: 'Active Gangs',      value: formatNumber(stats?.total_affiliations), variant: 'default', Icon: GangsIcon     },
    { label: 'Known Criminals',   value: formatNumber(stats?.total_criminals),    variant: 'default', Icon: CriminalsIcon },
    { label: 'Active Watchlist',  value: formatNumber(stats?.total_criminals),    variant: 'default', Icon: WatchlistIcon },
    { label: 'High Threat Alert', value: formatNumber(highThreat),               variant: 'alert',   Icon: AlertIcon     },
  ]

  return (
    <section className={styles.section} aria-label="System statistics">
      <div className={styles.grid}>
        {STATS.map(({ label, value, variant, Icon }) => {
          const isAlert = variant === 'alert'
          return (
            <div
              key={label}
              className={`${styles.card} ${isAlert ? styles.cardAlert : ''}`}
            >
              <div className={`${styles.circle} ${isAlert ? styles.circleAlert : ''}`}>
                <Icon />
              </div>
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
