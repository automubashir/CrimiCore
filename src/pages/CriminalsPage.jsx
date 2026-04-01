import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import ActiveFilters from '../components/ui/ActiveFilters';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTableRows } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useCountryFilter } from '../context/CountryFilterContext';
import { useDebounce } from '../hooks/useDebounce';
import { getCriminals } from '../services/api';
import { capitalizeFirst, truncate, highlightMatch, formatDate } from '../utils/formatters';

const sortIcons = {
  asc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z" /></svg>,
  desc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z" /></svg>,
  neutral: <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z" /><path d="M5 13L1 9H9L5 13Z" /></svg>
};

export default function CriminalsPage() {
  const { country } = useCountryFilter();
  const showToast = useToast();
  const [criminals, setCriminals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({ crimeType: [], source: [], location: [] });

  const sentinelRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Reset when country or filters change
  useEffect(() => {
    setCriminals([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [country, filters]);

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (currentPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const apiFilters = {};
        if (filters.crimeType.length === 1) apiFilters.crime_type = filters.crimeType[0];
        if (filters.source.length === 1) apiFilters.source = filters.source[0];
        if (filters.location.length === 1) apiFilters.location = filters.location[0];

        let data = await getCriminals(apiFilters, currentPage, country);

        if (filters.crimeType.length > 1) data = data.filter(c => filters.crimeType.includes(c.crimeType));
        if (filters.source.length > 1) data = data.filter(c => filters.source.includes(c.source));
        if (filters.location.length > 1) data = data.filter(c => filters.location.includes(c.location));

        if (!cancelled) {
          setCriminals(prev => currentPage === 1 ? data : [...prev, ...data]);
          setHasMore(data.length >= 10);
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      } catch (error) {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setHasMore(false);
          // showToast(error.message, 'error');
        }
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [currentPage, country, filters, showToast]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore]);

  // Sorting + searching
  const visible = useMemo(() => {
    let data = [...criminals];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(c =>
        (c.criminalName && c.criminalName.toLowerCase().includes(q)) ||
        (c.crimeType && c.crimeType.toLowerCase().includes(q)) ||
        (c.source && c.source.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }
    if (sortColumn) {
      data.sort((a, b) => {
        let valA, valB;
        switch (sortColumn) {
          case 'name': valA = (a.criminalName || '').toLowerCase(); valB = (b.criminalName || '').toLowerCase(); break;
          case 'crime': valA = (a.crimeType || '').toLowerCase(); valB = (b.crimeType || '').toLowerCase(); break;
          case 'location': valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase(); break;
          default: return 0;
        }
        const cmp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [criminals, debouncedSearch, sortColumn, sortDirection]);

  const filterConfig = useMemo(() => ({
    crimeType: { label: 'Crime Type', options: [...new Set(criminals.map(c => c.crimeType).filter(Boolean))].sort(), maxShow: 12 },
    source: { label: 'Source', options: [...new Set(criminals.map(c => c.source).filter(Boolean))].sort(), maxShow: 10 },
    location: { label: 'Location', options: [...new Set(criminals.map(c => c.location).filter(l => l && l !== 'none, none' && l !== ''))].sort(), maxShow: 10 }
  }), [criminals]);

  const handleSort = useCallback((column) => {
    setSortColumn(prev => {
      if (prev === column) {
        if (sortDirection === 'asc') { setSortDirection('desc'); return column; }
        setSortDirection('asc'); return null;
      }
      setSortDirection('asc');
      return column;
    });
  }, [sortDirection]);

  function getSortIcon(col) {
    if (sortColumn === col) return sortDirection === 'asc' ? sortIcons.asc : sortIcons.desc;
    return sortIcons.neutral;
  }

  return (
    <>
      <div className="page-content gangs-page criminal-page">
          <div className="page-gradient"></div>
          <div className='gangs-card-lg'>
            <div className='gcl'>
              <div className="toolbar">
                <div className="toolbar-left">
                  <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search criminals..." />
                </div>
                <FilterDropdown filterConfig={filterConfig} activeFilters={filters} onApply={(f) => { setFilters(f); }} />
              </div>
              <ActiveFilters
                filters={filters}
                labels={{ crimeType: 'Crime', source: 'Source', location: 'Location' }}
                onRemove={(type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(v => v !== value) })); }}
                onClearAll={() => { setFilters({ crimeType: [], source: [], location: [] }); }}
              />
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th data-sort="name" className="sortable" onClick={() => handleSort('name')}>
                        Name <span className={`sort-icon${sortColumn === 'name' ? ' sort-active' : ''}`}>{getSortIcon('name')}</span>
                      </th>
                      <th data-sort="crime" className="sortable" onClick={() => handleSort('crime')}>
                        Crime <span className={`sort-icon${sortColumn === 'crime' ? ' sort-active' : ''}`}>{getSortIcon('crime')}</span>
                      </th>
                      <th>Published</th>
                      <th data-sort="location" className="sortable" onClick={() => handleSort('location')}>
                        Location <span className={`sort-icon${sortColumn === 'location' ? ' sort-active' : ''}`}>{getSortIcon('location')}</span>
                      </th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <SkeletonTableRows rows={10} cols={5} widths={['120px', '100px', '80px', '100px', '90px']} />
                    ) : visible.length === 0 ? (
                      <tr>
                        <td colSpan="5">
                          <EmptyState title="No criminals found" text="Try adjusting your search or filters" />
                        </td>
                      </tr>
                    ) : (
                      visible.map((c, i) => (
                          <tr key={`${c.criminalName}-${i}`} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                            <td><span className="font-medium" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(c.criminalName), debouncedSearch) }} /></td>
                            <td><span className="text-secondary">{truncate(capitalizeFirst(c.crimeType), 40)}</span></td>
                            <td><span className="text-muted">{formatDate(c.published_date || c.publishedDate)}</span></td>
                            <td><span className="text-secondary" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(c.location), debouncedSearch) }} /></td>
                            <td><Link to={`/criminals/${encodeURIComponent(c.criminalName)}`} className="btn-view">View</Link></td>
                          </tr>
                      ))
                    )}
                    {isLoadingMore && (
                      <SkeletonTableRows rows={3} cols={5} widths={['120px', '100px', '80px', '100px', '90px']} />
                    )}
                  </tbody>
                </table>

                {/* Infinite scroll sentinel */}
                {!isLoading && hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

                <div className="table-footer">
                  <span className="table-info">
                    {criminals.length > 0 ? `${criminals.length} records loaded` : 'No entries to show'}
                  </span>
                  {!hasMore && criminals.length > 0 && (
                    <span className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>All records loaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}