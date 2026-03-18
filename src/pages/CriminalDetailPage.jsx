import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonProfile } from '../components/ui/Skeleton';
import { getCriminalByName } from '../services/api';
import { capitalizeFirst, formatDateLong, getInitials } from '../utils/formatters';

const icons = {
  crime: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  gang: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  link: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  news: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14,2 14,8 20,8" /></svg>
};

export default function CriminalDetailPage() {
  const { name } = useParams();
  const [criminal, setCriminal] = useState(null);
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!name) { setError('No criminal name specified'); setIsLoading(false); return; }
      setIsLoading(true);
      setError(null);
      try {
        const results = await getCriminalByName(decodeURIComponent(name));

        if (!cancelled) {
          if (!results || results.length === 0) {
            setError(`No record found for: ${decodeURIComponent(name)}`);
          } else {
            setCriminal(results?.all_criminal?.[0]);
            setNews({...results?.all_news?.[0]?.news});
            document.title = `${capitalizeFirst(results?.all_criminal?.[0]?.criminalName || '')} - CrimePanel`;
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) { setIsLoading(false); }
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [name]);

  const affiliation = criminal?.affiliation && criminal.affiliation.toLowerCase() !== 'empty' ? criminal.affiliation : '';
  const hasImage = criminal?.imageUrl && criminal.imageUrl.trim() && !imgError;

  return (
    <>
      <Topbar title="Criminal Profile" />
      <div className="page-content">
        <Link to="/criminals" className="profile-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Criminals
        </Link>

        {isLoading ? (
          <SkeletonProfile />
        ) : error ? (
          <EmptyState title="Error Loading Profile" text={error} type="error" style={{ minHeight: 400 }}>
            <Link to="/criminals" className="btn btn-primary mt-4">Back to Criminals</Link>
          </EmptyState>
        ) : criminal && (
          <>
            <div className="profile-header animate-fade-in">
              <div className="profile-photo-wrapper">
                {hasImage ? (
                  <img
                    className="profile-photo"
                    src={criminal.imageUrl}
                    alt={criminal.criminalName}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="profile-photo avatar-placeholder" style={{ width: 160, height: 200 }}>
                    {getInitials(criminal.criminalName)}
                  </div>
                )}
              </div>
              <div className="profile-summary">
                <div className="profile-name-row">
                  <h1 className="profile-name">{capitalizeFirst(criminal.criminalName)}</h1>
                  <span className="badge badge-burglary">
                    {capitalizeFirst(criminal.crimeType ? criminal.crimeType.substring(0, 30) : 'Unknown')}
                    {criminal.crimeType && criminal.crimeType.length > 30 ? '...' : ''}
                  </span>
                </div>
                <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="info-item"><span className="info-label">Location:</span><span className="info-value">{capitalizeFirst(criminal.location) || 'Unknown'}</span></div>
                  <div className="info-item"><span className="info-label">Source:</span><span className="info-value" style={{ textTransform: 'capitalize' }}>{criminal.source || 'Unknown'}</span></div>
                  <div className="info-item"><span className="info-label">Published:</span><span className="info-value">{formatDateLong(criminal.publishedDate)}</span></div>
                  {criminal.country && <div className="info-item"><span className="info-label">Country:</span><span className="info-value">{capitalizeFirst(criminal.country)}</span></div>}
                  {criminal.publishedBy && <div className="info-item"><span className="info-label">Published By:</span><span className="info-value">{capitalizeFirst(criminal.publishedBy)}</span></div>}
                </div>
              </div>
            </div>

            <div className="profile-sections animate-slide-up">
              <div className="profile-section">
                <h3>{icons.crime} Crime Details</h3>
                <p style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-md)', lineHeight: 'var(--lh-relaxed)' }}>
                  {capitalizeFirst(criminal.crimeType) || 'No crime details available'}
                </p>
              </div>

              <div className="profile-section">
                <h3>{icons.gang} Gang Affiliation</h3>
                <p style={{ fontSize: 'var(--fs-md)' }}>
                  {affiliation
                    ? <Link to={`/gangs/${encodeURIComponent(affiliation)}`} className="text-link">{capitalizeFirst(affiliation)}</Link>
                    : <span className="text-muted">None</span>
                  }
                </p>
              </div>

              {criminal.linkToArticle && (
                <div className="profile-section">
                  <h3>{icons.link} Source Article</h3>
                  <a href={criminal.linkToArticle} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: 'var(--fs-md)', wordBreak: 'break-all' }}>
                    {criminal.linkToArticle}
                  </a>
                </div>
              )}

              {news.title && (
                <div className="profile-section">
                  <h3>{icons.news} News Title</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-md)', lineHeight: 'var(--lh-relaxed)' }}>
                    {capitalizeFirst(news.title)}
                  </p>
                </div>
              )}

              {news.description && (
                <div className="profile-section profile-section-full">
                  <h3>{icons.alert} Description</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-md)', lineHeight: 'var(--lh-relaxed)', whiteSpace: 'pre-line' }}>
                    {news.description}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}