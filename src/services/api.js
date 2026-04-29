const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://192.168.20.121:8000/api';

// Cache with 5-minute TTL
const cache = {};
const CACHE_EXPIRY = 5 * 60 * 1000;

function getToken() {
  return localStorage.getItem('cc_token');
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const form = new FormData();
  form.append('username', username);
  form.append('password', password);

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Invalid username or password.');
  }

  const data = await response.json();
  return data.access_token;
}

function getQueryString(filters = {}) {
  const params = [];
  if (filters.criminal_name)
    params.push(`criminal_name=${encodeURIComponent(filters.criminal_name)}`);
  if (filters.crime_type)
    params.push(`crime_type=${encodeURIComponent(filters.crime_type)}`);
  if (filters.affiliation)
    params.push(`affiliation=${encodeURIComponent(filters.affiliation)}`);
  if (filters.location)
    params.push(`location=${encodeURIComponent(filters.location)}`);
  if (filters.source)
    params.push(`source=${encodeURIComponent(filters.source)}`);
  if (filters.page) params.push(`page=${filters.page}`);
  return params.length > 0 ? '?' + params.join('&') : '';
}

async function fetchFromAPI(endpoint, direct = false) {
  try {
    const full_url = direct ? endpoint : API_BASE_URL + endpoint;
    const response = await fetch(full_url, { headers: getAuthHeaders() });

    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(
      error.message || 'Failed to fetch data. Please check your connection and try again.',
    );
  }
}

async function fetchWithCache(endpoint, direct = false) {
  const cached = cache[endpoint];
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }
  const data = await fetchFromAPI(endpoint, direct);
  cache[endpoint] = { data, timestamp: Date.now() };
  return data;
}

export function clearCache() {
  Object.keys(cache).forEach((key) => delete cache[key]);
}

function getCountryFilter(country) {
  return country && country !== 'All' ? { location: country } : {};
}

export async function getCriminals(filters = {}, page = null, country = 'All') {
  const merged = { ...getCountryFilter(country), ...filters };
  if (page) merged.page = page;
  const query = getQueryString(merged);
  const data = await fetchWithCache(`/criminals/filter${query}`);
  return data?.all_criminal || [];
}

export async function getCriminalByName(name, affiliation = '') {
  const params = { criminal_name: name };
  if (affiliation) params.affiliation = affiliation;
  const query = getQueryString(params);
  const data = await fetchFromAPI(`/criminals/filter${query}`);
  return data;
}

export async function getCriminalsByAffiliation(affiliation, page = null, location='') {
  const filters = { affiliation, location };
  if (page) filters.page = page;
  const query = getQueryString(filters);
  const data = await fetchWithCache(`/criminals/filter${query}`);
  return data;
}

export async function getGangs(country = 'All') {
  const locationParam =
    country && country !== 'All'
      ? `?location=${encodeURIComponent(country)}`
      : '';
  const data = await fetchWithCache(`/affiliations${locationParam}`);
  const items = data?.data || [];
  return items
    .filter((g) => g.affiliation && g.affiliation.toLowerCase() !== 'empty')
    .map((g) => ({
      name: g.affiliation,
      memberCount: g.total_count,
      location: g.top_location || 'Unknown',
    }));
}

export async function geocodeLocation(location) {
  const data = await fetchWithCache(
    `${API_BASE_URL}/geocode?location=${encodeURIComponent(location)}`,
    true,
  );
  return data;
}

export async function getActivities(
  filters = {},
  page = null,
  country = 'All',
) {
  const merged = { ...getCountryFilter(country), ...filters };
  if (page) merged.page = page;
  const query = getQueryString(merged);
  const data = await fetchWithCache(`/news/filter${query}`);
  const criminals = data?.all_news || [];
  return criminals
    .filter((c) => c.criminal_count > 0)
    .map((news) => {
      let criminal_count = news?.criminal_count || 0;
      let c = news?.news || {};
      return {
        title: c.title || '',
        imageUrl: c.thumbnail || '',
        publishedDate: c.published_date || '',
        description: c.description || '',
        newsLink: c.news_link || '',
        criminal_count,
        source: c.source || '',
      };
    });
}

function normalizeArticle(item) {
  return {
    title: item.title || '',
    imageUrl: item.thumbnail || item.imageUrl || '',
    publishedDate: item.published_date || item.publishedDate || '',
    description: item.description || '',
    newsLink: item.news_link || item.newsLink || '',
    source: item.source || '',
    country: item.country || '',
    publishedBy: item.published_by || [],
  };
}

export async function getNewsDetail(newsLink) {
  try {
    const url = `${API_BASE_URL}/news?news_link=${encodeURIComponent(newsLink)}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const article = data?.news ? normalizeArticle(data.news) : null;
    const similarNews = Array.isArray(data?.similar_news)
      ? data.similar_news.map(normalizeArticle).slice(0, 10)
      : [];
    return { article, similarNews };
  } catch (error) {
    console.error('News Detail API Error:', error);
    return { article: null, similarNews: [] };
  }
}
