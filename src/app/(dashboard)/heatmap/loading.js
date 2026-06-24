import { Bone } from '@/components/ui/Skeleton/Skeleton'

export default function Loading() {
  return (
    <div style={{
      height: 'calc(100vh - 81px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>

      {/* Controls bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-secondary)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Bone width={110} height={22} />
          <Bone width={260} height={13} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Bone width={140} height={32} />
          <Bone width={120} height={32} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid var(--border-secondary)',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            padding: 'var(--space-3) var(--space-6)',
            borderRight: i < 3 ? '1px solid var(--border-secondary)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <Bone width="55%" height={22} />
            <Bone width="70%" height={13} />
            <Bone width="60%" height={12} />
          </div>
        ))}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, background: '#0A1F33' }} />

    </div>
  )
}
