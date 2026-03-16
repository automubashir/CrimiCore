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
import { getGangs } from '../services/api';
import { capitalizeFirst, highlightMatch } from '../utils/formatters';

const sortIcons = {
  asc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z" /></svg>,
  desc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z" /></svg>,
  neutral: <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z" /><path d="M5 13L1 9H9L5 13Z" /></svg>
};

export default function GangsPage() {
  const { country } = useCountryFilter();
  const showToast = useToast();
  const [gangs, setGangs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({ location: [], source: [] });

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => { setCurrentPage(1); }, [country]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const apiFilters = {};
        if (filters.location.length === 1) apiFilters.location = filters.location[0];
        if (filters.source.length === 1) apiFilters.source = filters.source[0];

        let data = await getGangs(apiFilters, currentPage, country);

        if (filters.location.length > 1) {
          data = data.filter(g => filters.location.includes(g.location));
        }
        if (filters.source.length > 1) {
          data = data.filter(g => g.sources && g.sources.some(s => filters.source.includes(s)));
        }

        data.sort((a, b) => b.memberCount - a.memberCount);

        if (!cancelled) {
          setGangs(data);
          setHasMore(data.length >= 5);
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

  const visible = useMemo(() => {
    let data = [...gangs];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    }
    if (sortColumn) {
      data.sort((a, b) => {
        let valA, valB;
        switch (sortColumn) {
          case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
          case 'members': return sortDirection === 'asc' ? a.memberCount - b.memberCount : b.memberCount - a.memberCount;
          case 'location': valA = a.location.toLowerCase(); valB = b.location.toLowerCase(); break;
          default: return 0;
        }
        const cmp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [gangs, debouncedSearch, sortColumn, sortDirection]);

  const filterConfig = useMemo(() => ({
    location: {
      label: 'Location',
      options: [...new Set(gangs.map(g => g.location).filter(l => l && l !== 'Unknown'))].sort(),
      maxShow: 12
    },
    source: {
      label: 'Source',
      options: [...new Set(gangs.flatMap(g => g.sources || []).filter(Boolean))].sort(),
      maxShow: 10
    }
  }), [gangs]);

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
      <Topbar title="Criminal Gangs" />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search gangs..." />
          </div>
          <FilterDropdown filterConfig={filterConfig} activeFilters={filters} onApply={(f) => { setFilters(f); setCurrentPage(1); }} />
        </div>

        <ActiveFilters
          filters={filters}
          labels={{ location: 'Location', source: 'Source' }}
          onRemove={(type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(v => v !== value) })); setCurrentPage(1); }}
          onClearAll={() => { setFilters({ location: [], source: [] }); setCurrentPage(1); }}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Gang Name <span className="sort-icon">{getSortIcon('name')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('members')}>
                  Members <span className="sort-icon">{getSortIcon('members')}</span>
                </th>
                <th className="sortable" onClick={() => handleSort('location')}>
                  Location <span className="sort-icon">{getSortIcon('location')}</span>
                </th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={10} cols={4} widths={['140px', '40px', '120px', '90px']} />
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <EmptyState title="No gangs found" text="Try adjusting your search or filters" />
                  </td>
                </tr>
              ) : (
                visible.map((g, i) => (
                  <tr key={`${g.name}-${i}`} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <Link to={`/gangs/${encodeURIComponent(g.name)}`} className="text-link font-medium">
                        <span dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(g.name), debouncedSearch) }} />
                      </Link>
                    </td>
                    <td><span className="font-semibold">{g.memberCount}</span></td>
                    <td>
                      <span className="text-secondary" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(g.location), debouncedSearch) }} />
                    </td>
                    <td><Link to={`/gangs/${encodeURIComponent(g.name)}`} className="btn-view">View</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="table-info">
              {gangs.length > 0 ? `Page ${currentPage} — ${gangs.length} gangs loaded` : 'No entries to show'}
            </span>
            <Pagination currentPage={currentPage} hasMore={hasMore} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </>
  );
}
