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

/* ── Sidebar widget skeletons — reuse the global section-card chrome so they
      match the real widgets (same card border/padding + actual title). ── */

export function SidebarCardSkeleton({ title, children }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">{title}</h2>
      </div>
      <div className="section-card-content">{children}</div>
    </div>
  )
}

export function DonutBodySkeleton({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '4px 0' }}>
      <Bone width={150} height={150} style={{ borderRadius: '50%' }} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bone width={10} height={10} style={{ borderRadius: '50%' }} />
            <Bone width="40%" height={12} />
            <Bone width={64} height={12} style={{ marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListBodySkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bone width={16} height={13} />
          <Bone width="45%" height={13} />
          <Bone width="100%" height={6} style={{ flex: 1 }} />
          <Bone width={32} height={13} />
        </div>
      ))}
    </div>
  )
}

export function PersonListSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bone width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <Bone width="60%" height={13} />
            <Bone width="40%" height={11} />
          </div>
          <Bone width={48} height={20} />
        </div>
      ))}
    </div>
  )
}

export function ChartBodySkeleton({ height = 180 }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <Bone width="100%" height={height} />
    </div>
  )
}

export function SimpleRowsSkeleton({ rows = 4, dot = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {dot && <Bone width={8} height={8} style={{ borderRadius: '50%' }} />}
          <Bone width="55%" height={13} />
          <Bone width={40} height={13} style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  )
}

export function TagsBodySkeleton({ count = 10 }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} width={60 + (i % 4) * 18} height={26} />
      ))}
    </div>
  )
}

export { styles as skeletonStyles }
