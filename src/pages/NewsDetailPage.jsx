import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SimilarNewsCard from '../components/ui/SimilarNewsCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCards } from '../components/ui/Skeleton';
import { getNewsDetail } from '../services/api';
import { capitalizeFirst, formatDate } from '../utils/formatters';

const externalLinkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function NewsDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const newsLink = searchParams.get('link');

  // state.article is a pre-fill from navigation — avoids blank flash when clicking a card.
  // On refresh, state is gone and we fall back to fetching via newsLink from the URL.
  const [article, setArticle] = useState(state?.article || null);
  const [similarNews, setSimilarNews] = useState([]);
  const [isLoading, setIsLoading] = useState(!state?.article);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(!!newsLink);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!newsLink) return;
    let cancelled = false;

    async function load() {
      if (!state?.article) setIsLoading(true);
      setIsLoadingSimilar(true);

      const { article: fetched, similarNews: similar } = await getNewsDetail(newsLink);

      if (!cancelled) {
        if (fetched) setArticle(fetched);
        setSimilarNews(similar);
        setIsLoading(false);
        setIsLoadingSimilar(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [newsLink]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (article) {
      document.title = `${capitalizeFirst(article.title || 'News')} - CrimePanel`;
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="page-content">
        <div className="page-gradient" />
        <SkeletonCards count={1} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-content">
        <div className="page-gradient" />
        <EmptyState
          title="Article Not Found"
          text="No article data found. Please go back and click a news card."
          type="error"
          style={{ minHeight: 400 }}
        >
          <button className="btn btn-primary mt-4" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </EmptyState>
      </div>
    );
  }

  const showImage = article.imageUrl && article.imageUrl.trim() && !imgError;
  const date = formatDate(article.publishedDate);
  const source = article.source || 'Unknown';

  return (
    <div className="page-content news-detail-page">
      <div className="page-gradient" />

      <button
        className="profile-back"
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      {/* ── Single outer card ── */}
      <div className="w-100">
        <div className="w-100">
          <div className="gangs-card-lg gcl-overlay" style={{ width: '100%' }}>
            <div className="gcl news-detail-card animate-fade-in">

              {/* Title — full width */}
              <h1 className="news-detail-title">
                {capitalizeFirst(article.title || 'Untitled')}
              </h1>

              {/* Meta row — source + date + visit source */}
              <div className="news-detail-meta">
                <span className="news-detail-source">{source}</span>
                <span className="news-detail-date">{date}</span>
                <div style={{ flex: 1 }} />
                {article.newsLink && (
                  <a
                    href={article.newsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card-source-badge"
                    style={{ gap: 'var(--sp-2)' }}
                  >
                    Visit Source {externalLinkIcon}
                  </a>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-color)', margin: '0 0 var(--sp-6)' }} />

              {/* Two-column content */}
              <div className="news-detail-columns">

                {/* Left — image + description */}
                <div className="news-detail-left">
                  <div className="news-detail-hero">
                    {showImage ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="news-detail-hero-img"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="news-detail-hero-fallback">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {article.description && (
                    <p className="news-detail-description">
                      {article.description}
                    </p>
                  )}
                </div>

                {/* Right — similar news (scrollable) */}
                <div className="news-detail-right">
                  <div className="news-detail-similar-header">
                    Similar News
                  </div>
                  <div className="news-detail-similar-scroll">
                    {isLoadingSimilar ? (
                      <SkeletonCards count={3} />
                    ) : similarNews.length === 0 ? (
                      <EmptyState title="No similar news" text="" style={{ minHeight: 120 }} />
                    ) : (
                      similarNews.map((a, i) => (
                        <SimilarNewsCard key={`similar-${a.newsLink || i}`} article={a} index={i} />
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
