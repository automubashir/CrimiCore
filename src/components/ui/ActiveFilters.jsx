import { capitalizeFirst, truncate } from '../../utils/formatters';

export default function ActiveFilters({ filters, labels, onRemove, onClearAll }) {
  const allFilters = [];
  Object.keys(filters).forEach(key => {
    (filters[key] || []).forEach(v => allFilters.push({ type: key, label: labels[key] || key, value: v }));
  });

  if (allFilters.length === 0) return null;

  return (
    <div className="active-filters" style={{ display: 'flex' }}>
      {allFilters.map((f, i) => (
        <span key={`${f.type}-${f.value}-${i}`} className="active-chip">
          <span className="active-chip-label">{f.label}:</span> {capitalizeFirst(truncate(f.value, 20))}
          <button className="active-chip-close" onClick={() => onRemove(f.type, f.value)}>&times;</button>
        </span>
      ))}
      <button className="active-chip-clear" onClick={onClearAll}>Clear All</button>
    </div>
  );
}
