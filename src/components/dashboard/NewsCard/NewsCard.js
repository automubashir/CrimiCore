import Badge from '@/components/ui/Badge/Badge'
import styles from './NewsCard.module.css'

export default function NewsCard({ category, categoryLabel, time, title, description }) {
  return (
    <article className={styles.card}>
      <div className={styles.thumbnail} />
      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge category={category}>{categoryLabel}</Badge>
          <span className={styles.time}>{time}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
