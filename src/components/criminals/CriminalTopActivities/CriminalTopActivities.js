import styles from './CriminalTopActivities.module.css'

export default function CriminalTopActivities({ crimeTypes = [] }) {
  const maxCount = crimeTypes[0]?.count ?? 1

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Top Activities Overall</h2>
        <span className={styles.topBadge}>Top {crimeTypes.length}</span>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {crimeTypes.map(({ rank, name, count }) => (
            <li key={rank} className={styles.item}>
              <span className={styles.rank}>{rank}.</span>
              <span className={styles.name}>{name}</span>
              <div className={styles.barWrap}>
                <span className={styles.count}>{count.toLocaleString()}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
