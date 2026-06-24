import Link from 'next/link'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import styles from './LocationActivityCard.module.css'

export default function LocationActivityCard({ id, image, title, date, threatLevel }) {
  return (
    <Link href={`/activities/${id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <SafeImage src={image} alt={title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <Badge threat={threatLevel} variant="sm">
          {threatLevel === 'high'
            ? 'High Threat'
            : threatLevel === 'medium'
              ? 'Medium Threat'
              : 'Low Threat'}
        </Badge>
        <p className={styles.title}>{title}</p>
        <span className={styles.date}>
          <CalendarIcon />
          {date}
        </span>
      </div>
      <div className={styles.arrow}>
        <ChevronRightIcon />
      </div>
    </Link>
  )
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
