import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import styles from './RelatedNewsCard.module.css'

export default function RelatedNewsCard({
  id,
  image,
  reporter,
  category,
  categoryLabel,
  title,
  description,
  location,
  date,
}) {
  return (
    <Link to={`/activities/${encodeURIComponent(id)}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <SafeImage src={image} alt={title} className={styles.image} />
        {reporter && (
          <span
            className={styles.reporter}
            style={{ background: reporter.color }}
            aria-hidden="true"
          >
            {reporter.initial}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <Badge category={category}>{categoryLabel}</Badge>
          <span className={styles.arrow} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <CalendarIcon />
            {date}
          </span>
          <span className={styles.metaItem}>
            <LocationIcon />
            {location}
          </span>
        </div>
      </div>
    </Link>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
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

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
