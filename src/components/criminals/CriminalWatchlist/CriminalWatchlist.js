import { Link } from 'react-router-dom'
import CriminalItem from '@/components/criminals/CriminalItem/CriminalItem'
import styles from './CriminalWatchlist.module.css'

export default function CriminalWatchlist({ topCriminals = [] }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Watchlist</h2>
        <div className={styles.headerRight}>
          <span className={styles.countBadge}>{topCriminals.length}</span>
          <Link to="/criminals" className={styles.viewAll}>View All</Link>
        </div>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {topCriminals.map(criminal => (
            <li key={criminal.id}>
              <CriminalItem
                name={criminal.name}
                image={criminal.image}
                city={criminal.organization}
                threat={criminal.threat}
                href={`/criminals/${encodeURIComponent(criminal.id)}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
