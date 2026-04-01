import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalizeFirst, truncate, formatDate } from '../../utils/formatters';

const externalLinkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function NewsCard({ article, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const date = formatDate(article.publishedDate);
  const description = article.description
    ? truncate(article.description, 120)
    : truncate(capitalizeFirst(article.criminalName) + ' — ' + capitalizeFirst(article.crimeType), 110);
  const title = truncate(capitalizeFirst(article.title), 80);
  const imgUrl = article.imageUrl || '';
  const showImage = imgUrl && !imgError;
  const source = article.source || 'Unknown';

  function handleCardClick() {
    navigate('/news/detail', { state: { article } });
  }

  return (
   <div className='nc-wrapper'>
    <div className='nc-papa'>
      <div
        className="news-card animate-fade-in"
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={handleCardClick}
      >

        {/* Image area */}
        <div className={`news-card-img${!showImage ? ' news-card-img-fallback' : ''}`}>
          {showImage && (
            <img src={imgUrl} alt="" onError={() => setImgError(true)} />
          )}
          {!showImage && (
            <div className="news-card-broken-icon">
              <img src='/broken-img.jpg' alt="" />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="news-card-body">
          <h4 className="news-card-title">{title}</h4>
          <p className="news-card-desc">{description}</p>

          {/* Source badge — stops propagation so external link still works */}
          {article.newsLink ? (
            <a
              href={article.newsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card-source-badge"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{source}</span>
              {externalLinkIcon}
            </a>
          ) : (
            <span className="news-card-source-badge">
              <span>{source}</span>
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="news-card-footer">
          <span className="news-card-date">{date}</span>
          <span className="news-card-criminals">
            <span className="news-card-dot" />
            CRIMINALS:&nbsp;{article.criminal_count || 0}
          </span>
        </div>
      </div>
    </div>
   </div>
  );
}
