import styles from './DataSources.module.css'

export default function DataSources({ sources = [] }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Data Sources:</h2>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {sources.slice(0, 8).map(({ source }) => (
            <li key={source} className={styles.item}>
              <span className={styles.name}>{source}</span>
              <span className={`${styles.status} ${styles.live}`}>
                <span className={`${styles.dot} ${styles.dot_live}`} aria-hidden="true" />
                Live
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
