import { useState, useRef, useEffect } from 'react';
import { capitalizeFirst, truncate } from '../../utils/formatters';

export default function FilterDropdown({ filterConfig, activeFilters, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  // Sync selected state when opening
  useEffect(() => {
    if (isOpen) {
      setSelected({ ...activeFilters });
    }
  }, [isOpen, activeFilters]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        isOpen &&
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  function toggleChip(key, value) {
    setSelected(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  }

  function handleApply() {
    onApply(selected);
    setIsOpen(false);
  }

  function handleClear() {
    const cleared = {};
    Object.keys(filterConfig).forEach(k => cleared[k] = []);
    setSelected(cleared);
  }

  return (
    <div className="toolbar-right" style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="btn btn-sm"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
      </button>
      {isOpen && (
        <div className="filter-dropdown" ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: "16px" }}>
          {Object.entries(filterConfig).map(([key, config]) => (
            <div key={key}>
              <h4>{config.label}</h4>
              <div className="filter-section">
                <div className="filter-options">
                  {config.options.slice(0, config.maxShow || 12).map(opt => (
                    <button
                      key={opt}
                      className={`filter-chip ${(selected[key] || []).includes(opt) ? 'active' : ''}`}
                      onClick={() => toggleChip(key, opt)}
                    >
                      {capitalizeFirst(truncate(opt, 25))}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="filter-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>Clear</button>
            <button className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
