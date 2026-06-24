import {
  SkeletonCard, SkeletonCardHeader, SkeletonCardBody, Bone,
} from '@/components/ui/Skeleton/Skeleton'

export default function Loading() {
  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SkeletonCard>
          <SkeletonCardBody>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Bone width={64} height={64} style={{ borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Bone width="40%" height={22} />
                <Bone width="25%" height={13} style={{ marginTop: 6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              {Array.from({ length: 5 }, (_, i) => <Bone key={i} width={80} height={40} />)}
            </div>
          </SkeletonCardBody>
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonCardHeader />
          <SkeletonCardBody>
            <Bone width="100%" height={300} />
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
