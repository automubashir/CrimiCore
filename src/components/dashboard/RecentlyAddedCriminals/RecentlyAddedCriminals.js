import Badge from '@/components/ui/Badge/Badge'
import styles from './RecentlyAddedCriminals.module.css'

const CRIMINALS = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    location: 'USA, El Salvadore',
    threat: 'medium',
    thumb: 'https://picsum.photos/seed/mendoza/104/80',
  },
  {
    id: 2,
    name: 'Ms-13',
    location: 'Mexico',
    threat: 'high',
    thumb: 'https://picsum.photos/seed/ms13rc/104/80',
  },
  {
    id: 3,
    name: 'Bloods',
    location: 'USA, El Salvadore',
    threat: 'high',
    thumb: 'https://picsum.photos/seed/bloodsrc/104/80',
  },
  {
    id: 4,
    name: 'Cartel del Norte',
    location: 'Mexico',
    threat: 'medium',
    thumb: 'https://picsum.photos/seed/cartelnorte/104/80',
  },
  {
    id: 5,
    name: 'Primeiro Commando',
    location: 'Mexico',
    threat: 'high',
    thumb: 'https://picsum.photos/seed/primeirorc/104/80',
  },
]

export default function RecentlyAddedCriminals() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recently Added Criminals</h2>
        <a href="/criminals" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">

        <div className={styles.thead}>
          <span className={styles.th}>Name</span>
          <span className={styles.th}>Recent Location</span>
          <span className={`${styles.th} ${styles.thThreat}`}>Threat Level</span>
        </div>

        <div className={styles.list}>
          {CRIMINALS.map(({ id, name, location, threat, thumb }) => (
            <div key={id} className={styles.row}>
              <div className={styles.nameCell}>
                <img
                  src={thumb}
                  alt={name}
                  className={styles.thumb}
                  width={52}
                  height={40}
                />
                <span className={styles.name}>{name}</span>
              </div>
              <span className={styles.location}>{location}</span>
              <div className={styles.threatCell}>
                <Badge threat={threat}>
                  {threat === 'high' ? 'High Threat' : 'Medium Threat'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
