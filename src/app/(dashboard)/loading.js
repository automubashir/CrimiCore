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

export default function DashboardLoading() {
  return (
    <main className={styles.dashboardWrapper}>
      <StatsGridSkeleton />
      <div className={styles.dashboardGrid}>
        {/* Recent News skeleton */}
        <div className={styles.col1}>
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
        </div>

        {/* Map skeleton */}
        <div className={styles.col2}>
          <SkeletonCard>
            <SkeletonCardHeader />
            <SkeletonCardBody>
              <Bone width="100%" height={320} />
            </SkeletonCardBody>
          </SkeletonCard>
        </div>

        {/* Top Gangs skeleton */}
        <div className={styles.col4}>
          <SkeletonCard>
            <SkeletonCardHeader />
            <TopGangsSkeleton />
          </SkeletonCard>
        </div>

        {/* Activities by Type skeleton */}
        <div className={styles.col5}>
          <SkeletonCard>
            <SkeletonCardHeader />
            <DonutSkeleton />
          </SkeletonCard>
        </div>

        {/* Recently Added Criminals skeleton */}
        <div className={styles.col6}>
          <SkeletonCard>
            <SkeletonCardHeader />
            <CriminalsListSkeleton />
          </SkeletonCard>
        </div>
      </div>
    </main>
  )
}
