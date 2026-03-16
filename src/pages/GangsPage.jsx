import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTableRows } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { getGangs } from '../services/api';
import { capitalizeFirst, highlightMatch } from '../utils/formatters';

const sortIcons = {
  asc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z" /></svg>,
  desc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z" /></svg>,
  neutral: <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z" /><path d="M5 13L1 9H9L5 13Z" /></svg>
};

const PER_PAGE = 10;

export default function GangsPage() {
  const showToast = useToast();
  const [allGangs, setAllGangs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getGangs();
        if (!cancelled) {
          // Default sort: highest member count first
          data.sort((a, b) => b.memberCount - a.memberCount);
          setAllGangs(data);
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
  }, [showToast]);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...allGangs];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(g => g.name.toLowerCase().includes(q));
    }
    if (sortColumn) {
      data.sort((a, b) => {
        if (sortColumn === 'members') {
          return sortDirection === 'asc' ? a.memberCount - b.memberCount : b.memberCount - a.memberCount;
        }
        // name
        const cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [allGangs, debouncedSearch, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  const handleSort = useCallback((column) => {
    setSortColumn(prev => {
      if (prev === column) {
        if (sortDirection === 'asc') { setSortDirection('desc'); return column; }
        setSortDirection('asc'); return null;
      }
      setSortDirection('asc');
      return column;
    });
    setCurrentPage(1);
  }, [sortDirection]);

  function getSortIcon(col) {
    if (sortColumn === col) return sortDirection === 'asc' ? sortIcons.asc : sortIcons.desc;
    return sortIcons.neutral;
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
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
        </div>

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
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={10} cols={3} widths={['200px', '60px', '90px']} />
              ) : pageSlice.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <EmptyState title="No gangs found" text="Try adjusting your search" />
                  </td>
                </tr>
              ) : (
                pageSlice.map((g, i) => (
                  <tr key={`${g.name}-${i}`} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <Link to={`/gangs/${encodeURIComponent(g.name)}`} className="text-link font-medium">
                        <span dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(g.name), debouncedSearch) }} />
                      </Link>
                    </td>
                    <td><span className="font-semibold">{g.memberCount}</span></td>
                    <td><Link to={`/gangs/${encodeURIComponent(g.name)}`} className="btn-view">View</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="table-info">
              {filtered.length > 0
                ? `Showing ${(currentPage - 1) * PER_PAGE + 1} to ${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length} gangs`
                : 'No entries to show'}
            </span>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </>
  );
}
