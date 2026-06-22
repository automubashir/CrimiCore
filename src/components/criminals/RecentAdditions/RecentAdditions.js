import Link from 'next/link'
import CriminalItem from '@/components/criminals/CriminalItem/CriminalItem'
import { RECENT_ADDITIONS } from '@/lib/data/criminals'
import styles from './RecentAdditions.module.css'

export default function RecentAdditions() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recent Additions</h2>
        <div className={styles.headerRight}>
          <span className={styles.countBadge}>{RECENT_ADDITIONS.length}</span>
          <Link href="/criminals" className={styles.viewAll}>View All</Link>
        </div>
      </div>
      <div className="section-card-content">
        <ul className={styles.list}>
          {RECENT_ADDITIONS.map(criminal => (
            <li key={criminal.id}>
              <CriminalItem
                name={criminal.name}
                image={criminal.image}
                city={criminal.organization}
                threat={criminal.threat}
                href={`/criminals/${criminal.id}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
