import Badge from '@/components/ui/Badge/Badge'
import styles from './CriminalCard.module.css'

export default function CriminalCard({ name, organization, threat, avatar }) {
  return (
    <div className={styles.card}>
      <img
        src={avatar}
        alt={name}
        className={styles.photo}
        width={72}
        height={86}
      />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.org}>{organization}</span>
        <Badge threat={threat}>
          {threat === 'high' ? 'High Threat' : 'Medium Threat'}
        </Badge>
      </div>
      <button className={styles.arrow} aria-label={`View ${name}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
