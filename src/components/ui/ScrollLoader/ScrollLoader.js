import { useScrollEnd } from '@/hooks/useScrollEnd'
import styles from './ScrollLoader.module.css'

// Place this as the last child of a scrollable container.
// When it scrolls into view the `onLoad` callback fires and the
// three-dot animation appears while `loading` is true.
export default function ScrollLoader({ onLoad, loading = false, hasMore = false, style }) {
  const ref = useScrollEnd(onLoad, hasMore && !loading)

  if (!hasMore) return null

  return (
    <div ref={ref} className={styles.sentinel} aria-live="polite" aria-label="Loading more" style={style}>
      {loading && (
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      )}
    </div>
  )
}
