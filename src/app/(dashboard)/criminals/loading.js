import {
  SkeletonCard, SkeletonCardHeader, SkeletonCardBody, Bone,
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
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <Bone width={44} height={44} style={{ borderRadius: '50%', flexShrink: 0 }} />
                <Bone width="28%" height={13} />
                <Bone width={70} height={22} style={{ marginLeft: 'auto' }} />
                <Bone width={90} height={13} />
                <Bone width={80} height={13} />
              </div>
            ))}
          </SkeletonCardBody>
        </SkeletonCard>
      </div>
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {Array.from({ length: 4 }, (_, i) => (
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
