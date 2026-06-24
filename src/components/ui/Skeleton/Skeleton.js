import styles from './Skeleton.module.css'

export function Bone({ width = '100%', height = 16, className = '', style = {} }) {
  return (
    <span
      className={`${styles.bone} ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ children }) {
  return <div className={styles.card}>{children}</div>
}

export function SkeletonCardHeader() {
  return (
    <div className={styles.cardHeader}>
      <Bone width={120} height={14} />
      <Bone width={50} height={12} />
    </div>
  )
}

export function SkeletonCardBody({ children }) {
  return <div className={styles.cardBody}>{children}</div>
}

export function StatsGridSkeleton() {
  return (
    <div className={styles.statsGrid}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={styles.statCard}>
          <Bone width={64} height={64} className={styles.circle} />
          <div className={styles.statInfo}>
            <Bone width={100} height={11} />
            <Bone width={70} height={28} style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TopGangsSkeleton() {
  return (
    <div className={styles.listSkeleton}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={styles.listRow}>
          <Bone width={18} height={14} />
          <Bone width={52} height={52} className={styles.circle} />
          <Bone width="80%" height={13} />
          <Bone width={60} height={13} />
          <Bone width={80} height={13} />
        </div>
      ))}
    </div>
  )
}

export function CriminalsListSkeleton() {
  return (
    <div className={styles.listSkeleton}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={styles.listRow}>
          <Bone width={52} height={40} />
          <Bone width="60%" height={13} />
          <Bone width={80} height={13} />
          <Bone width={90} height={22} />
        </div>
      ))}
    </div>
  )
}

export function DonutSkeleton() {
  return (
    <div className={styles.donutSkeleton}>
      <Bone width={124} height={124} className={styles.circle} />
      <div className={styles.donutLegend}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.legendRow}>
            <Bone width={10} height={10} className={styles.circle} />
            <Bone width={90} height={12} />
            <Bone width={50} height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function NewsCardSkeleton() {
  return (
    <div className={styles.newsCardRow}>
      <Bone width={96} height={68} />
      <div className={styles.newsCardBody}>
        <Bone width={80} height={18} />
        <Bone width="90%" height={13} style={{ marginTop: 4 }} />
        <Bone width="70%" height={11} style={{ marginTop: 4 }} />
      </div>
    </div>
  )
}

export { styles as skeletonStyles }
