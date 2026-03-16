import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import NewsCard from '../components/ui/NewsCard';
import { SkeletonProfile, SkeletonTableRows } from '../components/ui/Skeleton';
import { getCriminalsByAffiliation } from '../services/api';
import MembersMap from '../components/ui/MembersMap';
import { capitalizeFirst, truncate, formatDate, highlightMatch } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';

const sortIcons = {
  asc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z" /></svg>,
  desc: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z" /></svg>,
  neutral: <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z" /><path d="M5 13L1 9H9L5 13Z" /></svg>
};

const starIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ width: 10, height: 10, color: 'var(--color-primary)', flexShrink: 0 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function SectionPagination({ totalItems, currentPage, perPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / perPage);
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  return (
    <div className="pagination">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button>
      {startPage > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span className="pagination-btn" style={{ cursor: 'default' }}>...</span>}
        </>
      )}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
        <button key={p} className={`pagination-btn ${p === currentPage ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-btn" style={{ cursor: 'default' }}>...</span>}
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  );
}

export default function GangDetailPage() {
  const { name } = useParams();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Members section state
  const [membersSearch, setMembersSearch] = useState('');
  const [membersSortCol, setMembersSortCol] = useState(null);
  const [membersSortDir, setMembersSortDir] = useState('asc');

  // Articles section state
  const [articlesSearch, setArticlesSearch] = useState('');
  const [articlesPage, setArticlesPage] = useState(1);
  const articlesPerPage = 6;

  const sentinelRef = useRef(null);
  const debouncedMembersSearch = useDebounce(membersSearch, 250);
  const debouncedArticlesSearch = useDebounce(articlesSearch, 250);

  // Load members with server-side pagination
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (!name) { setError('No gang name specified'); setIsLoading(false); return; }
      if (currentPage === 1) { setIsLoading(true); setError(null); }
      else setIsLoadingMore(true);

      try {
        const decodedName = decodeURIComponent(name);
        const data = await getCriminalsByAffiliation(decodedName, currentPage);
        if (!cancelled) {
          if (currentPage === 1 && (!data || data.length === 0)) {
            setError(`No records found for gang: ${decodedName}`);
          } else {
            setMembers(prev => currentPage === 1 ? data : [...prev, ...data]);
            setHasMore(data.length >= 10);
            document.title = `${capitalizeFirst(decodedName)} - CrimiCore`;
          }
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setIsLoading(false); setIsLoadingMore(false); }
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [name, currentPage]);

  // Infinite scroll observer for members
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

  const gangName = decodeURIComponent(name || '');
  const locations = useMemo(() => [...new Set(members.map(m => m.location).filter(l => l && l !== 'none, none' && l !== ''))], [members]);
  const crimes = useMemo(() => [...new Set(members.map(m => m.crimeType).filter(Boolean))], [members]);
  const sources = useMemo(() => [...new Set(members.map(m => m.source).filter(Boolean))], [members]);
  const articles = useMemo(() => members.filter(m => m.title), [members]);
  const media = useMemo(() => members.filter(m => m.imageUrl && m.imageUrl.trim()), [members]);
  const territory = locations[0] || 'Unknown';

  // Filtered members (client-side search + sort on accumulated data)
  const filteredMembers = useMemo(() => {
    let result = [...members];
    if (debouncedMembersSearch) {
      const q = debouncedMembersSearch.toLowerCase();
      result = result.filter(m =>
        (m.criminalName && m.criminalName.toLowerCase().includes(q)) ||
        (m.crimeType && m.crimeType.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q))
      );
    }
    if (membersSortCol) {
      result.sort((a, b) => {
        let valA, valB;
        switch (membersSortCol) {
          case 'name': valA = (a.criminalName || '').toLowerCase(); valB = (b.criminalName || '').toLowerCase(); break;
          case 'crime': valA = (a.crimeType || '').toLowerCase(); valB = (b.crimeType || '').toLowerCase(); break;
          case 'location': valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase(); break;
          default: return 0;
        }
        const cmp = valA.localeCompare(valB);
        return membersSortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [members, debouncedMembersSearch, membersSortCol, membersSortDir]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (!debouncedArticlesSearch) return articles;
    const q = debouncedArticlesSearch.toLowerCase();
    return articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.criminalName && a.criminalName.toLowerCase().includes(q)) ||
      (a.source && a.source.toLowerCase().includes(q))
    );
  }, [articles, debouncedArticlesSearch]);

  const articlesSlice = useMemo(() => {
    const start = (articlesPage - 1) * articlesPerPage;
    return filteredArticles.slice(start, start + articlesPerPage);
  }, [filteredArticles, articlesPage]);

  const handleMemberSort = useCallback((col) => {
    setMembersSortCol(prev => {
      if (prev === col) {
        if (membersSortDir === 'asc') { setMembersSortDir('desc'); return col; }
        setMembersSortDir('asc'); return null;
      }
      setMembersSortDir('asc');
      return col;
    });
  }, [membersSortDir]);

  function getMemberSortIcon(col) {
    if (membersSortCol === col) return membersSortDir === 'asc' ? sortIcons.asc : sortIcons.desc;
    return sortIcons.neutral;
  }

  // Reset articles pagination on search change
  useEffect(() => { setArticlesPage(1); }, [debouncedArticlesSearch]);

  return (
    <>
      <Topbar title="Gang Profile" />
      <div className="page-content">
        <Link to="/gangs" className="profile-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Gangs
        </Link>

        {isLoading ? (
          <SkeletonProfile />
        ) : error ? (
          <EmptyState title="Error Loading Gang Profile" text={error} type="error" style={{ minHeight: 400 }}>
            <Link to="/gangs" className="btn btn-primary mt-4">Back to Gangs</Link>
          </EmptyState>
        ) : (
          <>
            {/* Gang Header */}
            <div className="profile-header animate-fade-in" style={{ marginBottom: 'var(--sp-8)' }}>
              <div className="profile-photo-wrapper">
                <div className="profile-photo avatar-placeholder" style={{ width: 160, height: 200, fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 80, height: 80, color: 'var(--text-muted)' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className="profile-summary">
                <div className="profile-name-row">
                  <h1 className="profile-name">{capitalizeFirst(gangName)}</h1>
                  <span className="badge badge-burglary">{members.length} Members</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-2) 0' }}>
                  <div className="gang-info-row">{starIcon}<span className="gang-info-label">Territory:</span><span className="gang-info-value">{capitalizeFirst(territory)}</span></div>
                  <div className="gang-info-row">{starIcon}<span className="gang-info-label">Members:</span><span className="gang-info-value" style={{ color: 'var(--status-active)', fontWeight: 'var(--fw-bold)' }}>{members.length}</span></div>
                  <div className="gang-info-row">{starIcon}<span className="gang-info-label">Sources:</span><span className="gang-info-value">{sources.map(s => capitalizeFirst(s)).join(', ') || 'Unknown'}</span></div>
                  <div className="gang-info-row">{starIcon}<span className="gang-info-label">Locations:</span><span className="gang-info-value">{locations.slice(0, 5).map(l => capitalizeFirst(l)).join('; ') || 'Unknown'}</span></div>
                  <div className="gang-info-row">{starIcon}<span className="gang-info-label">Primary Activities:</span><span className="gang-info-value">{crimes.slice(0, 5).map(c => capitalizeFirst(c)).join(', ') || 'Unknown'}</span></div>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="gang-section animate-slide-up">
              <div className="gang-section-header">
                <h2 className="gang-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Members <span className="gang-section-count">{members.length}</span>
                </h2>
                <SearchInput value={membersSearch} onChange={setMembersSearch} placeholder="Search members..." className="search-wrapper-sm" />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleMemberSort('name')}>Name <span className="sort-icon">{getMemberSortIcon('name')}</span></th>
                      <th className="sortable" onClick={() => handleMemberSort('crime')}>Crime <span className="sort-icon">{getMemberSortIcon('crime')}</span></th>
                      <th className="sortable" onClick={() => handleMemberSort('location')}>Location <span className="sort-icon">{getMemberSortIcon('location')}</span></th>
                      <th>Source</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 && !isLoadingMore ? (
                      <tr><td colSpan="5"><div className="empty-state" style={{ minHeight: 100 }}><p className="text-muted">No members match your search</p></div></td></tr>
                    ) : (
                      filteredMembers.map((m, i) => (
                        <tr key={`${m.criminalName}-${i}`} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 10) * 20}ms` }}>
                          <td><span className="font-medium" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(m.criminalName), debouncedMembersSearch) }} /></td>
                          <td><span className="text-secondary">{m.crimeType ? truncate(capitalizeFirst(m.crimeType), 50) : 'N/A'}</span></td>
                          <td><span className="text-secondary" dangerouslySetInnerHTML={{ __html: highlightMatch(capitalizeFirst(m.location), debouncedMembersSearch) || 'Unknown' }} /></td>
                          <td><span className="text-muted" style={{ textTransform: 'capitalize' }}>{m.source || 'Unknown'}</span></td>
                          <td><Link to={`/criminals/${encodeURIComponent(m.criminalName)}`} className="btn-view">View</Link></td>
                        </tr>
                      ))
                    )}
                    {isLoadingMore && <SkeletonTableRows rows={3} cols={5} widths={['120px', '100px', '100px', '80px', '70px']} />}
                  </tbody>
                </table>

                {/* Infinite scroll sentinel */}
                {!isLoading && hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

                <div className="table-footer">
                  <span className="table-info">
                    {members.length > 0 ? `${members.length} members loaded` : 'No entries'}
                  </span>
                  {!hasMore && members.length > 0 && (
                    <span className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>All members loaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Locations Map Section */}
            {locations.length > 0 && (
              <div className="gang-section animate-slide-up" style={{ animationDelay: '50ms' }}>
                <div className="gang-section-header">
                  <h2 className="gang-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    Locations <span className="gang-section-count">{locations.length}</span>
                  </h2>
                </div>
                <MembersMap members={members} />
              </div>
            )}

            {/* Articles Section */}
            <div className="gang-section animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="gang-section-header">
                <h2 className="gang-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14,2 14,8 20,8" />
                  </svg>
                  Articles <span className="gang-section-count">{articles.length}</span>
                </h2>
                <SearchInput value={articlesSearch} onChange={setArticlesSearch} placeholder="Search articles..." className="search-wrapper-sm" />
              </div>
              <div className="news-grid news-grid-3">
                {articlesSlice.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1', minHeight: 100 }}>
                    <p className="text-muted">{articles.length === 0 ? 'No articles available' : 'No articles match your search'}</p>
                  </div>
                ) : (
                  articlesSlice.map((a, i) => <NewsCard key={`${a.title}-${i}`} article={a} index={i} />)
                )}
              </div>
              <div className="table-footer" style={{ marginTop: 'var(--sp-4)' }}>
                <span className="table-info">
                  {filteredArticles.length > 0
                    ? `Showing ${(articlesPage - 1) * articlesPerPage + 1} to ${Math.min(articlesPage * articlesPerPage, filteredArticles.length)} of ${filteredArticles.length}`
                    : 'No entries'}
                </span>
                <SectionPagination totalItems={filteredArticles.length} currentPage={articlesPage} perPage={articlesPerPage} onPageChange={setArticlesPage} />
              </div>
            </div>

            {/* Media Section */}
            <div className="gang-section animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="gang-section-header">
                <h2 className="gang-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  Media <span className="gang-section-count">{media.length}</span>
                </h2>
              </div>
              <div className="media-gallery">
                {media.length > 0 ? (
                  media.map((m, i) => (
                    <MediaItem key={`${m.criminalName}-${i}`} member={m} />
                  ))
                ) : (
                  <p className="text-muted" style={{ padding: 'var(--sp-4)' }}>No media available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function MediaItem({ member }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="media-item">
      <img src={member.imageUrl} alt={capitalizeFirst(member.criminalName)} loading="lazy" onError={() => setHidden(true)} />
      <div className="media-overlay">
        <span className="media-name">{capitalizeFirst(member.criminalName)}</span>
        {member.source && <span className="media-source">{capitalizeFirst(member.source)}</span>}
      </div>
    </div>
  );
}
