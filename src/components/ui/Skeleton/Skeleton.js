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

export { styles as skeletonStyles }
