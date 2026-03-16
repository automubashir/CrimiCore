import { capitalizeFirst, truncate, formatDate } from '../../utils/formatters';

const calendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function NewsCard({ article, index = 0 }) {
  const date = formatDate(article.publishedDate);
  const description = article.description
    ? truncate(article.description, 120)
    : truncate(capitalizeFirst(article.criminalName) + ' — ' + capitalizeFirst(article.crimeType), 100);
  const title = truncate(capitalizeFirst(article.title), 80);
  const imgUrl = article.imageUrl || '';

  return (
    <div className="news-card animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      {imgUrl ? (
        <div className="news-card-img" style={{ backgroundImage: `url('${imgUrl}')` }}>
          <span className="news-card-source">{article.source || 'Unknown'}</span>
        </div>
      ) : (
        <div className="news-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)' }}>
          <span className="news-card-source">{article.source || 'Unknown'}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
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
