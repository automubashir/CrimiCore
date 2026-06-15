import styles from './DataSources.module.css'

const SOURCES = [
  { name: 'Breaking News Network',   status: 'live' },
  { name: 'Global News Watch',       status: 'live' },
  { name: 'Daily News Update',       status: 'live' },
  { name: 'Current Events Tracker',  status: 'offline' },
  { name: "Today's Headlines",       status: 'live' },
  { name: 'Live News Bulletin',      status: 'deprecated' },
  { name: 'News Today',              status: 'live' },
  { name: 'The News Roundup',        status: 'live' },
]

const STATUS_LABEL = { live: 'Live', offline: 'Offline', deprecated: 'Deprecated' }

export default function DataSources() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Data Sources:</h2>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {SOURCES.map(({ name, status }) => (
            <li key={name} className={styles.item}>
              <span className={styles.name}>{name}</span>
              <span className={`${styles.status} ${styles[status]}`}>
                {status !== 'deprecated' && (
                  <span className={`${styles.dot} ${styles[`dot_${status}`]}`} aria-hidden="true" />
                )}
                {STATUS_LABEL[status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
