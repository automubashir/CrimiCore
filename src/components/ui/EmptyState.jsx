const noResultsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
    <path d="m15 8-6 6" />
    <path d="m9 8 6 6" />
  </svg>
);

const alertIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function EmptyState({ title, text, type = 'search', children, style }) {
  return (
    <div className="empty-state" style={style}>
      {type === 'error' ? alertIcon : noResultsIcon}
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-text">{text}</p>
      {children}
    </div>
  );
}
