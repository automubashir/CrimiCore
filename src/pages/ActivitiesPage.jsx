import { useState, useEffect, useMemo } from 'react';
import Topbar from '../components/layout/Topbar';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import ActiveFilters from '../components/ui/ActiveFilters';
import Pagination from '../components/ui/Pagination';
import NewsCard from '../components/ui/NewsCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCards } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useCountryFilter } from '../context/CountryFilterContext';
import { useDebounce } from '../hooks/useDebounce';
import { getActivities } from '../services/api';

export default function ActivitiesPage() {
  const { country } = useCountryFilter();
  const showToast = useToast();
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ source: [], crimeType: [] });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [country]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const apiFilters = {};
        if (filters.source.length === 1) apiFilters.source = filters.source[0];
        if (filters.crimeType.length === 1) apiFilters.crime_type = filters.crimeType[0];

        let data = await getActivities(apiFilters, currentPage, country);

        if (filters.source.length > 1) {
          data = data.filter(a => filters.source.includes(a.source));
        }
        if (filters.crimeType.length > 1) {
          data = data.filter(a => filters.crimeType.includes(a.crimeType));
        }

        data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

        if (!cancelled) {
          setActivities(data);
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

  // Stats
  const stats = useMemo(() => {
    const total = activities.length;
    const sources = [...new Set(activities.map(a => a.source))].length;
    const locations = [...new Set(activities.filter(a => a.location).map(a => a.location))].length;
    const today = new Date().toDateString();
    const recent = activities.filter(a => a.publishedDate && new Date(a.publishedDate).toDateString() === today).length;
    return { total, sources, locations, recent };
  }, [activities]);

  // Client-side search
  const visible = useMemo(() => {
    if (!debouncedSearch) return activities;
    const q = debouncedSearch.toLowerCase();
    return activities.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.criminalName && a.criminalName.toLowerCase().includes(q)) ||
      (a.crimeType && a.crimeType.toLowerCase().includes(q)) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.source && a.source.toLowerCase().includes(q))
    );
  }, [activities, debouncedSearch]);

  // Filter options derived from data
  const filterConfig = useMemo(() => ({
    source: {
      label: 'Filter by Source',
      options: [...new Set(activities.map(a => a.source).filter(Boolean))].sort(),
      maxShow: 15
    },
    crimeType: {
      label: 'Filter by Crime Type',
      options: [...new Set(activities.map(a => a.crimeType).filter(Boolean))].sort(),
      maxShow: 15
    }
  }), [activities]);

  function handleFilterApply(newFilters) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  function handleFilterRemove(type, value) {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(v => v !== value)
    }));
    setCurrentPage(1);
  }

  function handleClearAll() {
    setFilters({ source: [], crimeType: [] });
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Topbar title="Recent News" />
      <div className="page-content">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14,2 14,8 20,8" /></svg>
            </div>
            <div className="stat-info" id="stat-total">
              {isLoading ? <div className="skeleton skeleton-text" style={{ width: 40, height: 24, marginBottom: 4 }} /> : <><h4>{stats.total}</h4><span>Total News</span></>}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </div>
            <div className="stat-info" id="stat-sources">
              {isLoading ? <div className="skeleton skeleton-text" style={{ width: 40, height: 24, marginBottom: 4 }} /> : <><h4>{stats.sources}</h4><span>Sources</span></>}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-wanted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div className="stat-info" id="stat-locations">
              {isLoading ? <div className="skeleton skeleton-text" style={{ width: 40, height: 24, marginBottom: 4 }} /> : <><h4>{stats.locations}</h4><span>Locations</span></>}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-locked">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <div className="stat-info" id="stat-recent">
              {isLoading ? <div className="skeleton skeleton-text" style={{ width: 40, height: 24, marginBottom: 4 }} /> : <><h4>{stats.recent}</h4><span>Today</span></>}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search news..." />
          </div>
          <FilterDropdown filterConfig={filterConfig} activeFilters={filters} onApply={handleFilterApply} />
        </div>

        <ActiveFilters
          filters={filters}
          labels={{ source: 'Source', crimeType: 'Crime' }}
          onRemove={handleFilterRemove}
          onClearAll={handleClearAll}
        />

        {/* News Grid */}
        <div className="news-grid" id="news-grid">
          {isLoading ? (
            <SkeletonCards count={8} />
          ) : visible.length === 0 ? (
            <EmptyState
              title={activities.length === 0 ? 'No news found' : 'No news match your search'}
              text="Try adjusting your search or filters"
              style={{ gridColumn: '1 / -1' }}
            />
          ) : (
            visible.map((a, i) => <NewsCard key={`${a.title}-${i}`} article={a} index={i} />)
          )}
        </div>

        {/* Pagination */}
        <div className="page-footer">
          <span className="table-info">
            {activities.length > 0 ? `Page ${currentPage} — ${activities.length} entries loaded` : 'No entries to show'}
          </span>
          <Pagination currentPage={currentPage} hasMore={hasMore} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  );
}
