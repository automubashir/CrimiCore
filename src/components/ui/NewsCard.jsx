import { useState } from 'react';
import { capitalizeFirst, truncate, formatDate } from '../../utils/formatters';

const calendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const brokenImageIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, color: 'var(--text-muted)' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function NewsCard({ article, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const date = formatDate(article.publishedDate);
  const description = article.description
    ? truncate(article.description, 120)
    : truncate(capitalizeFirst(article.criminalName) + ' — ' + capitalizeFirst(article.crimeType), 100);
  const title = truncate(capitalizeFirst(article.title), 80);
  const imgUrl = article.imageUrl || '';
  const showImage = imgUrl && !imgError;

  return (
    <div className="news-card animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      {showImage ? (
        <div className="news-card-img" style={{ backgroundImage: `url('${imgUrl}')` }}>
          <span className="news-card-source">{article.source || 'Unknown'}</span>
          <img src={imgUrl} alt="" style={{ display: 'none' }} onError={() => setImgError(true)} />
        </div>
      ) : (
        <div className="news-card-img news-card-img-fallback">
          <span className="news-card-source">{article.source || 'Unknown'}</span>
          {brokenImageIcon}
        </div>
      )}
      <div className="news-card-body">
        <h4 className="news-card-title">{title}</h4>
        <p className="news-card-desc">{description}</p>
        <div className="news-card-footer">
          <span className="news-card-date">{calendarIcon} {date}</span>
          {article.linkToArticle && (
            <a href={article.linkToArticle} target="_blank" rel="noopener noreferrer" className="news-card-link">Read More</a>
          )}
        </div>
      </div>
    </div>
  );
}
