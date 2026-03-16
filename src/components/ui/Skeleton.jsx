export function SkeletonTableRows({ rows = 10, cols = 6, widths }) {
  const defaultWidths = ['120px', '100px', '30px', '90px', '100px', '90px'];
  const w = widths || defaultWidths.slice(0, cols);

  return Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="skeleton-row">
      {w.map((width, j) => (
        <td key={j}>
          <div className="skeleton skeleton-text" style={{ width, height: '14px' }} />
        </td>
      ))}
    </tr>
  ));
}

export function SkeletonCards({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="news-card">
      <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)' }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ width: '85%', height: '18px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ width: '70%', height: '14px', marginBottom: '14px' }} />
        <div className="skeleton" style={{ width: '40%', height: '12px' }} />
      </div>
    </div>
  ));
}

export function SkeletonProfile() {
  return (
    <>
      <div className="profile-header">
        <div className="profile-photo-wrapper">
          <div className="skeleton" style={{ width: '160px', height: '200px', borderRadius: '8px' }} />
        </div>
        <div className="profile-summary" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div className="skeleton" style={{ width: '220px', height: '30px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '4px' }} />
          </div>
          <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                <div className="skeleton" style={{ width: '120px', height: '14px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="profile-sections" style={{ marginTop: '24px' }}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="profile-section">
            <div className="skeleton" style={{ width: '150px', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '85%', height: '14px' }} />
          </div>
        ))}
      </div>
    </>
  );
}
