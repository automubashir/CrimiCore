import styles from './dashboard.module.css'
import {
  StatsGridSkeleton,
  TopGangsSkeleton,
  CriminalsListSkeleton,
  DonutSkeleton,
  NewsCardSkeleton,
  SkeletonCard,
  SkeletonCardHeader,
  SkeletonCardBody,
  Bone,
} from '@/components/ui/Skeleton/Skeleton'

/* ── Per-section skeletons — shared by the page so each section can load
      and reveal independently instead of behind one full-page skeleton. ── */

export function NewsSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonCardHeader />
      <SkeletonCardBody>
        <Bone width="100%" height={36} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: 5 }, (_, i) => <Bone key={i} width={80} height={28} />)}
        </div>
        {Array.from({ length: 4 }, (_, i) => <NewsCardSkeleton key={i} />)}
      </SkeletonCardBody>
    </SkeletonCard>
  )
}

export function MapSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonCardHeader />
      <SkeletonCardBody>
        <Bone width="100%" height={320} />
      </SkeletonCardBody>
    </SkeletonCard>
  )
}

export function GangsSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonCardHeader />
      <TopGangsSkeleton />
    </SkeletonCard>
  )
}

export function CrimeTypesSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonCardHeader />
      <DonutSkeleton />
    </SkeletonCard>
  )
}

export function CriminalsSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonCardHeader />
      <CriminalsListSkeleton />
    </SkeletonCard>
  )
}

export default function DashboardLoading() {
  return (
    <main className={styles.dashboardWrapper}>
      <StatsGridSkeleton />
      <div className={styles.dashboardGrid}>
        <div className={styles.col1}><NewsSkeleton /></div>
        <div className={styles.col2}><MapSkeleton /></div>
        <div className={styles.col4}><GangsSkeleton /></div>
        <div className={styles.col5}><CrimeTypesSkeleton /></div>
        <div className={styles.col6}><CriminalsSkeleton /></div>
      </div>
    </main>
  )
}
