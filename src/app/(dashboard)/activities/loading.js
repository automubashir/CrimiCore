import {
  SkeletonCard, SkeletonCardHeader, SkeletonCardBody, NewsCardSkeleton, Bone,
} from '@/components/ui/Skeleton/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SkeletonCard>
          <SkeletonCardHeader />
          <SkeletonCardBody>
            <div style={{ display: 'flex', gap: 8 }}>
              <Bone width="40%" height={36} />
              {Array.from({ length: 4 }, (_, i) => <Bone key={i} width={100} height={36} />)}
            </div>
            {Array.from({ length: 6 }, (_, i) => <NewsCardSkeleton key={i} />)}
          </SkeletonCardBody>
        </SkeletonCard>
      </div>
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonCard key={i}>
            <SkeletonCardHeader />
            <SkeletonCardBody>
              {Array.from({ length: 4 }, (_, j) => <Bone key={j} width="100%" height={14} />)}
            </SkeletonCardBody>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
