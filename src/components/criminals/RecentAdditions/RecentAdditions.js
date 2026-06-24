import { Link } from 'react-router-dom'
import CriminalItem from '@/components/criminals/CriminalItem/CriminalItem'
import styles from './RecentAdditions.module.css'

export default function RecentAdditions({ recentCriminals = [] }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recent Additions</h2>
        <div className={styles.headerRight}>
          <span className={styles.countBadge}>{recentCriminals.length}</span>
          <Link to="/criminals" className={styles.viewAll}>View All</Link>
        </div>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {recentCriminals.map(criminal => (
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
