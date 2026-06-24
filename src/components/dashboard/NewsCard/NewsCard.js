import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import styles from './NewsCard.module.css'

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const mos = Math.floor(days / 30)
  if (mos < 12) return `${mos}mo ago`
  return `${Math.floor(mos / 12)}y ago`
}

export default function NewsCard({ item }) {
  const { news } = item
  const { title, thumbnail, published_date, description, crimeType } = news

  const firstCrime = crimeType?.split(',')[0]?.trim() ?? 'General'
  const category = firstCrime.toLowerCase().replace(/\s+/g, '-')
  const time = relativeTime(published_date)

  return (
    <article className={styles.card}>
      <SafeImage
        src={thumbnail}
        alt={title}
        className={styles.thumbnail}
        width={96}
        height={68}
      />
      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge category={category}>{firstCrime}</Badge>
          <span className={styles.time}>{time}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
