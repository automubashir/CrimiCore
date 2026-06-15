import Link from 'next/link'
import Badge from '@/components/ui/Badge/Badge'
import styles from './CriminalItem.module.css'

const THREAT_LABELS = {
  critical: 'Critical',
  high: 'High Threat',
  medium: 'Medium Threat',
  low: 'Low Threat',
}

/**
 * CriminalItem — compact row card for displaying a criminal's identity.
 *
 * Props:
 *   name      {string}   required
 *   image     {string}   avatar src; falls back to initials placeholder
 *   city      {string}   optional
 *   country   {string}   optional
 *   threat    {'critical'|'high'|'medium'|'low'}  optional
 *   href      {string}   when provided, wraps the item in a Next.js Link
 *   className {string}   extra class names for the host element
 */
export default function CriminalItem({
  name,
  image,
  city,
  country,
  threat,
  href,
  className = '',
}) {
  const location = [city, country].filter(Boolean).join(', ')
  const threatLabel = THREAT_LABELS[threat] ?? threat
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?'

  const hostClass = [styles.item, href && styles.itemLink, className]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span className={styles.avatarWrap} aria-hidden="true">
        {image ? (
          <img src={image} alt={name} className={styles.avatar} />
        ) : (
          <span className={styles.avatarFallback}>{initials}</span>
        )}
      </span>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {threat && <Badge variant="sm" threat={threat}>{threatLabel}</Badge>}
        </div>
        {location && <span className={styles.location}>{location}</span>}
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={hostClass}>
        {inner}
      </Link>
    )
  }

  return <div className={hostClass}>{inner}</div>
}
