import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import ActiveFilters from '../components/ui/ActiveFilters';
import Pagination from '../components/ui/Pagination';
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
  const [hasMore, setHasMore] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({ crimeType: [], affiliation: [], source: [], location: [] });

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => { setCurrentPage(1); }, [country]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const apiFilters = {};
        if (filters.crimeType.length === 1) apiFilters.crime_type = filters.crimeType[0];
        if (filters.affiliation.length === 1) apiFilters.affiliation = filters.affiliation[0];
        if (filters.source.length === 1) apiFilters.source = filters.source[0];
        if (filters.location.length === 1) apiFilters.location = filters.location[0];

        let data = await getCriminals(apiFilters, currentPage, country);

        if (filters.crimeType.length > 1) data = data.filter(c => filters.crimeType.includes(c.crimeType));
        if (filters.affiliation.length > 1) data = data.filter(c => filters.affiliation.includes(c.affiliation));
        if (filters.source.length > 1) data = data.filter(c => filters.source.includes(c.source));
        if (filters.location.length > 1) data = data.filter(c => filters.location.includes(c.location));

        if (!cancelled) {
          setCriminals(data);
          setHasMore(data.length >= 10);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setIsLoading(false);
          showToast(error.message, 'error');
        }
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [currentPage, country, filters, showToast]);

  // Sorting + searching
  const visible = useMemo(() => {
    let data = [...criminals];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(c =>
        (c.criminalName && c.criminalName.toLowerCase().includes(q)) ||
        (c.crimeType && c.crimeType.toLowerCase().includes(q)) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }
    if (sortColumn) {
      data.sort((a, b) => {
        let valA, valB;
        switch (sortColumn) {
          case 'name': valA = (a.criminalName || '').toLowerCase(); valB = (b.criminalName || '').toLowerCase(); break;
          case 'crime': valA = (a.crimeType || '').toLowerCase(); valB = (b.crimeType || '').toLowerCase(); break;
          case 'gang': valA = (a.affiliation || '').toLowerCase(); valB = (b.affiliation || '').toLowerCase(); break;
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
    affiliation: { label: 'Gang / Affiliation', options: [...new Set(criminals.map(c => c.affiliation).filter(a => a && a.toLowerCase() !== 'empty'))].sort(), maxShow: 12 },
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

  function handlePageChange(page) {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Topbar title="Criminal Records" />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search criminals..." />
          </div>
          <FilterDropdown filterConfig={filterConfig} activeFilters={filters} onApply={(f) => { setFilters(f); setCurrentPage(1); }} />
        </div>

        <ActiveFilters
          filters={filters}
          labels={{ crimeType: 'Crime', affiliation: 'Gang', source: 'Source', location: 'Location' }}
          onRemove={(type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(v => v !== value) })); setCurrentPage(1); }}
          onClearAll={() => { setFilters({ crimeType: [], affiliation: [], source: [], location: [] }); setCurrentPage(1); }}
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
                <th>DOB</th>
                <th data-sort="gang" className="sortable" onClick={() => handleSort('gang')}>
                  Gang <span className={`sort-icon${sortColumn === 'gang' ? ' sort-active' : ''}`}>{getSortIcon('gang')}</span>
                </th>
                <th data-sort="location" className="sortable" onClick={() => handleSort('location')}>
                  Location <span className={`sort-icon${sortColumn === 'location' ? ' sort-active' : ''}`}>{getSortIcon('location')}</span>
                </th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={10} cols={6} widths={['120px', '100px', '30px', '90px', '100px', '90px']} />
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState title="No criminals found" text="Try adjusting your search or filters" />
                  </td>
                </tr>
              ) : (
                visible.map((c, i) => {
                  const gang = c.affiliation || '';
                  const gangLink = gang && gang.toLowerCase() !== 'empty'
                    ? <Link to={`/gangs/${encodeURIComponent(gang)}`} className="text-link">{capitalizeFirst(gang)}</Link>
                    : <span className="text-muted">None</span>;

                  return (
                    <tr key={`${c.criminalName}-${i}`} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <td><span className="font-medium" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(c.criminalName), debouncedSearch) }} /></td>
                      <td><span className="text-secondary">{truncate(capitalizeFirst(c.crimeType), 40)}</span></td>
                      <td><span className="text-muted">{formatDate(c.dateOfBirth)}</span></td>
                      <td>{gangLink}</td>
                      <td><span className="text-secondary" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(c.location), debouncedSearch) }} /></td>
                      <td><Link to={`/criminals/${encodeURIComponent(c.criminalName)}`} className="btn-view">View</Link></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="table-info">
              {criminals.length > 0 ? `Page ${currentPage} — ${criminals.length} entries loaded` : 'No entries to show'}
            </span>
            <Pagination currentPage={currentPage} hasMore={hasMore} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </>
  );
}
