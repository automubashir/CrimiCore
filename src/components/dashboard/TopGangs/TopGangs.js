import styles from './TopGangs.module.css'
import NotFound from '@/components/ui/NotFound/NotFound'
import SafeImage from '@/components/ui/SafeImage/SafeImage'

const ROW_COLORS = ['#F2464A', '#F3921B', '#F0C028', '#1BB1F0', '#70EA8D']

export default function TopGangs({ data = [] }) {
  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.doc_count ?? 0), 1) : 1

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Top Gangs by Activity</h2>
        <a href="/gangs" className="linkButton">View All</a>
      </div>
      <div className="section-card-content">
        <div className={styles.thead}>
          <span />
          <span />
          <span className={styles.th}>Gang Name</span>
          <span className={styles.th}>Region</span>
          <span className={`${styles.th} ${styles.thAct}`}>Activities</span>
        </div>

        {data.length === 0 ? (
          <NotFound title="No gang data" message="No affiliation data is available right now." />
        ) : (
          <div className={styles.list}>
            {data.slice(0, 5).map(({ affiliation, doc_count, top_locations }, idx) => {
              const color = ROW_COLORS[idx % ROW_COLORS.length]
              const region = top_locations?.[0]?.location ?? '—'
              const activities = doc_count ?? 0
              return (
                <div key={affiliation} className={styles.row}>
                  <span className={styles.rank}>{idx + 1}.</span>
                  <SafeImage
                    src={null}
                    alt={affiliation}
                    className={styles.logo}
                    width={52}
                    height={52}
                  />
                  <span className={styles.name}>{affiliation}</span>
                  <span className={styles.region}>{region}</span>
                  <div className={styles.actCell}>
                    <span className={styles.count}>{activities}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${(activities / maxCount) * 100}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
