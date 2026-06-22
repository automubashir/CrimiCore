import { TOP_CRIMINAL_ACTIVITIES } from '@/lib/data/criminals'
import styles from './CriminalTopActivities.module.css'

const MAX_COUNT = TOP_CRIMINAL_ACTIVITIES[0].count

export default function CriminalTopActivities() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Top Activities Overall</h2>
        <span className={styles.topBadge}>Top 10</span>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {TOP_CRIMINAL_ACTIVITIES.map(({ rank, name, count }) => (
            <li key={rank} className={styles.item}>
              <span className={styles.rank}>{rank}.</span>
              <span className={styles.name}>{name}</span>
              <div className={styles.barWrap}>
                <span className={styles.count}>{count.toLocaleString()}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(count / MAX_COUNT) * 100}%` }}
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
