import { Bone } from '@/components/ui/Skeleton/Skeleton'

const PANEL = {
  background: 'rgba(5, 12, 20, 0.92)',
  border: '1px solid var(--border-secondary)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-4)',
}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Bone width={104} height={20} />
          <Bone width={250} height={13} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Bone width={140} height={30} />
          <Bone width={120} height={30} />
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
            gap: 4,
          }}>
            <Bone width={64} height={20} />
            <Bone width={96} height={12} />
            <Bone width={72} height={11} />
          </div>
        ))}
      </div>

      {/* Map area — mirrors the real map's overlays */}
      <div style={{ flex: 1, position: 'relative', background: 'var(--bg-primary)', overflow: 'hidden' }}>

        {/* Zoom controls — right edge, vertically centered */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 'var(--space-5)',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {[0, 1, 2].map(i => <Bone key={i} width={32} height={32} />)}
        </div>

        {/* Hotspot panel — bottom left */}
        <div style={{
          ...PANEL,
          position: 'absolute',
          bottom: 'var(--space-5)',
          left: 'var(--space-5)',
          width: 380,
          maxWidth: 'calc(100% - 40px)',
        }}>
          <Bone width={120} height={13} style={{ marginBottom: 'var(--space-3)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Bone width={10} height={12} />
                <Bone width={130} height={12} />
                <Bone width="100%" height={4} style={{ flex: 1 }} />
                <Bone width={28} height={12} />
              </div>
            ))}
          </div>
        </div>

        {/* Donut + legend — bottom right */}
        <div style={{
          ...PANEL,
          position: 'absolute',
          bottom: 'var(--space-5)',
          right: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-5)',
        }}>
          <Bone width={90} height={90} style={{ borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Bone width={8} height={8} style={{ borderRadius: '50%' }} />
                <Bone width={70} height={12} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
