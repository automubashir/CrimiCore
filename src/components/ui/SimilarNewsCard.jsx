import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalizeFirst, truncate } from '../../utils/formatters';

const sourceIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function SimilarNewsCard({ article, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const title = truncate(capitalizeFirst(article.title), 80);
  const imgUrl = article.imageUrl || '';
  const showImage = imgUrl && !imgError;

  function handleCardClick() {
    if (!article.newsLink) return;
    navigate(`/news/detail?link=${encodeURIComponent(article.newsLink)}`, { state: { article } });
  }

  return (
    <div className="nc-wrapper w-100">
      <div className="nc-papa w-100">
        <div
          className="similar-news-card animate-fade-in w-100"
          style={{ animationDelay: `${index * 40}ms` }}
          onClick={handleCardClick}
        >
          {/* Image with source icon pinned to bottom-right */}
          <div className={`similar-news-img${!showImage ? ' news-card-img-fallback' : ''}`}>
            {showImage ? (
              <img src={imgUrl} alt="" onError={() => setImgError(true)} />
            ) : (
              <img src="/broken-img.jpg" alt="" />
            )}

            {/* Source icon — bottom right of image */}
            {article.newsLink ? (
              <a
                href={article.newsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="similar-news-source-btn"
                onClick={(e) => e.stopPropagation()}
              >
                Source {sourceIcon}
              </a>
            ) : (
              <span className="similar-news-source-btn">
                Source
              </span>
            )}
          </div>

          {/* Title only */}
          <div className="similar-news-body">
            <h4 className="similar-news-title">{title}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
