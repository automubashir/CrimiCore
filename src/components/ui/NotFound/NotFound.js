import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound({
  title = 'Nothing found',
  message = 'The item you are looking for does not exist or has been removed.',
  href,
  linkLabel = 'Go back',
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.iconWrap}>
        <SearchOffIcon />
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {href && (
        <Link to={href} className={styles.action}>
          <ChevronLeftIcon />
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function SearchOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="8" x2="14" y2="14" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
