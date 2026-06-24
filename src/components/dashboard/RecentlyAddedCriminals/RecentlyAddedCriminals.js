import Badge from '@/components/ui/Badge/Badge'
import NotFound from '@/components/ui/NotFound/NotFound'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import styles from './RecentlyAddedCriminals.module.css'


export default function RecentlyAddedCriminals({ data = [] }) {
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

        {data.length === 0 ? (
          <NotFound title="No criminals found" message="No criminal data is available right now." />
        ) : (
          <div className={styles.list}>
            {data.slice(0, 5).map(({ criminal_name, location, country, threat_level, image_url }) => {
              const threat = threat_level?.toLowerCase() ?? 'low'
              const displayLocation = location ?? country ?? '—'
              const thumb = image_url ?? null
              const threatLabel = threat === 'high' ? 'High Threat' : threat === 'low' ? 'Low Threat' : 'Medium Threat'
              return (
                <div key={criminal_name} className={styles.row}>
                  <div className={styles.nameCell}>
                    <SafeImage
                      src={thumb}
                      alt={criminal_name}
                      className={styles.thumb}
                      width={52}
                      height={40}
                    />
                    <span className={styles.name}>{criminal_name}</span>
                  </div>
                  <span className={styles.location}>{displayLocation}</span>
                  <div className={styles.threatCell}>
                    <Badge threat={threat}>{threatLabel}</Badge>
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
