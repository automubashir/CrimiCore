import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

export default function CriminalAvatar({ imageUrl, name, size = 28 }) {
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (imageUrl && !error) {
    return (
      <>
        <div
          style={containerStyle}
          className="img-clickable"
          onClick={() => setLightboxOpen(true)}
          title={`View photo of ${name}`}
        >
          <img
            src={imageUrl}
            alt={name}
            onError={() => setError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        </div>
        {lightboxOpen && (
          <ImageLightbox src={imageUrl} alt={name} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  return (
    <div style={containerStyle}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ width: size * 0.55, height: size * 0.55, color: 'var(--text-muted)' }}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}
