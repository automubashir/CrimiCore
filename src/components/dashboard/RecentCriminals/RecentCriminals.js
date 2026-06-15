import CriminalCard from './CriminalCard'
import styles from './CriminalCard.module.css'
const CRIMINALS = [
  {
    id: 1,
    name: 'Miquel Angel Garcia',
    organization: 'Member of Los Zetas',
    threat: 'high',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Miquel Angel Garcia',
    organization: 'Member of Los Zetas',
    threat: 'high',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 3,
    name: 'Miquel Angel Garcia',
    organization: 'Member of Los Zetas',
    threat: 'medium',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    id: 4,
    name: 'Miquel Angel Garcia',
    organization: 'Member of Los Zetas',
    threat: 'high',
    avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
  },
  {
    id: 5,
    name: 'Miquel Angel Garcia',
    organization: 'Member of Los Zetas',
    threat: 'medium',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
]

export default function RecentCriminals() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recent Criminal News</h2>
        <a href="/criminals" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">
        <div className={styles.cardList}>
          {CRIMINALS.map((c) => (
            <CriminalCard key={c.id} {...c} />
          ))}
        </div>
      </div>
    </div>
  )
}
