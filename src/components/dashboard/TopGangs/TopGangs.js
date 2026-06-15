import styles from './TopGangs.module.css'

/* Scale bar relative to 200 so the max value (142) fills ~71% visually */
const BAR_SCALE = 200

const GANGS = [
  {
    rank: 1,
    name: 'Los Zetas',
    region: 'Mexico',
    activities: 142,
    color: '#F2464A',
    image: 'https://picsum.photos/seed/zetas/60/60',
  },
  {
    rank: 2,
    name: 'Ms-13',
    region: 'Mexico',
    activities: 142,
    color: '#F3921B',
    image: 'https://picsum.photos/seed/ms13x/60/60',
  },
  {
    rank: 3,
    name: 'Bloods',
    region: 'USA, El Salvadore',
    activities: 97,
    color: '#F0C028',
    image: 'https://picsum.photos/seed/bloods/60/60',
  },
  {
    rank: 4,
    name: 'Cartel del Norte',
    region: 'Mexico',
    activities: 85,
    color: '#1BB1F0',
    image: 'https://picsum.photos/seed/cartelx/60/60',
  },
  {
    rank: 5,
    name: 'Primeiro Commando',
    region: 'Mexico',
    activities: 142,
    color: '#70EA8D',
    image: 'https://picsum.photos/seed/primeiro/60/60',
  },
]

export default function TopGangs() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Top Gangs by Activity</h2>
        <a href="/gangs" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">

        {/* Column headers */}
        <div className={styles.thead}>
          <span />
          <span />
          <span className={styles.th}>Gang Name</span>
          <span className={styles.th}>Region</span>
          <span className={`${styles.th} ${styles.thAct}`}>Activities</span>
        </div>

        {/* Data rows */}
        <div className={styles.list}>
          {GANGS.map(({ rank, name, region, activities, color, image }) => (
            <div key={rank} className={styles.row}>
              <span className={styles.rank}>{rank}.</span>
              <img
                src={image}
                alt={name}
                className={styles.logo}
                width={52}
                height={52}
              />
              <span className={styles.name}>{name}</span>
              <span className={styles.region}>{region}</span>
              <div className={styles.actCell}>
                <span className={styles.count}>{activities}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(activities / BAR_SCALE) * 100}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
