import { useState, useEffect, useMemo } from 'react';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import ActiveFilters from '../components/ui/ActiveFilters';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ source: [], crimeType: [] });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Reset when country or filters change
  useEffect(() => {
    setActivities([]);
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
          setActivities(prev => currentPage === 1 ? data : [...prev, ...data]);
          setHasMore(data.length > 0);
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      } catch (error) {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setHasMore(false)
          // showToast(error.message, 'error');
        }
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [currentPage, country, filters, showToast]);

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

  return (
    <>
      <div className="page-content activities-page">
        <div className='page-gradient'></div>
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search" />
          </div>
          <div className="toolbar-actions">
            {country !== 'All' && (
              <span className="sector-badge">
                <span className="sector-badge-dot" />
                {country.toUpperCase()} SECTOR
              </span>
            )}
            <FilterDropdown filterConfig={filterConfig} activeFilters={filters} onApply={setFilters} />
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          labels={{ source: 'Source', crimeType: 'Crime' }}
          onRemove={(type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(v => v !== value) })); }}
          onClearAll={() => { setFilters({ source: [], crimeType: [] }); }}
        />

        {/* Results count */}
        {!isLoading && visible.length > 0 && (
          <p className="results-count">
            Showing <strong>{visible.length}</strong> Results
          </p>
        )}

        {/* News Grid */}
        <div className="news-grid">
          {isLoading ? (
            <SkeletonCards count={8} />
          ) : visible.length === 0 ? (
            <EmptyState
              title={activities.length === 0 ? 'No news found' : 'No news match your search'}
              text="Try adjusting your search or filters"
              style={{ gridColumn: '1 / -1' }}
            />
          ) : (
            visible.map((a, i) => <NewsCard key={`${a.title}-${i}`} article={a} index={Math.min(i, 8)} />)
          )}
          {isLoadingMore && <SkeletonCards count={4} />}
        </div>

        {/* Load more */}
        {!isLoading && hasMore && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        <div className="page-footer">
          <span className="table-info">
            {activities.length > 0 ? `${activities.length} articles loaded` : 'No entries to show'}
          </span>
          {!hasMore && activities.length > 0 && (
            <span className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>All articles loaded</span>
          )}
        </div>
      </div>
    </>
  );
}
