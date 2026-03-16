/**
 * Normalize API response item from new format { news, criminal_detail }
 * to a flat object used throughout the app
 */
export function normalizeItem(item) {
  if (!item) return null;

  // Already flat format (legacy)
  if (item.criminalName) return item;

  const news = item.news || {};
  const detail = item.criminal_detail || {};

  return {
    criminalName: detail.criminalName || '',
    crimeType: detail.crimeType || '',
    affiliation: detail.affiliation || '',
    location: detail.location || '',
    source: detail.source || news.source || '',
    linkToArticle: detail.linkToArticle || news.link || news.news_link || '',
    title: news.title || '',
    imageUrl: detail.imageUrl || news.thumbnail || '',
    publishedDate: news.published_date || '',
    description: news.description || '',
    country: news.country || '',
    newsType: news.type || '',
    publishedBy: news.published_by || '',
    newsLink: news.news_link || news.link || ''
  };
}

/**
 * Normalize an array of API items.
 * Handles both raw arrays and wrapped responses like { total_records, data: [...] }
 */
export function normalizeResponse(data) {
  const items = Array.isArray(data) ? data : (data?.data || []);
  return items.map(normalizeItem).filter(Boolean);
}
