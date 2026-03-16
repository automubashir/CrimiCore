/* ================================================================
   CrimiCore - Data Service Layer
   Connects to the live criminal intelligence API
   ================================================================ */
function getQueryString(filters = {}) {
  const params = [];
  if (filters.criminal_name) params.push(`criminal_name=${encodeURIComponent(filters.criminal_name)}`);
  if (filters.crime_type) params.push(`crime_type=${encodeURIComponent(filters.crime_type)}`);
  if (filters.affiliation) params.push(`affiliation=${encodeURIComponent(filters.affiliation)}`);
  if (filters.location) params.push(`location=${encodeURIComponent(filters.location)}`);
  if (filters.source) params.push(`source=${encodeURIComponent(filters.source)}`);
  if (filters.page) params.push(`page=${filters.page}`);
  return params.length > 0 ? '?' + params.join('&') : '';
}

/**
 * Normalize API response item from new format { news, criminal_detail }
 * to a flat object used throughout the app
 */
function normalizeItem(item) {
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
    imageUrl: news.thumbnail || '',
    publishedDate: news.published_date || '',
    description: news.description || '',
    country: news.country || '',
    newsType: news.type || '',
    publishedBy: news.published_by || '',
    newsLink: news.news_link || news.link || ''
  };
}

/**
 * Normalize an array of API items
 */
function normalizeResponse(data) {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeItem).filter(Boolean);
}

/* Global country state - shared across pages */
const CountryFilter = {
  _selected: 'All',
  _listeners: [],

  get() { return this._selected; },

  set(country) {
    this._selected = country;
    DataService.clearCache();
    this._listeners.forEach(fn => fn(country));
  },

  onChange(fn) { this._listeners.push(fn); },

  getFilter() {
    return this._selected && this._selected !== 'All'
      ? { location: this._selected }
      : {};
  }
};

const DataService = {
  apiBaseURL: 'http://192.168.20.121:8000',

  // Cache to avoid re-fetching the same data
  _cache: {},
  _cacheExpiry: 5 * 60 * 1000, // 5 minutes

  /* ================================================================
     Core API Methods
     ================================================================ */

  /**
   * Get criminals from the API with optional filters and pagination
   */
  async getCriminals(filters = {}, page = null) {
    const merged = { ...CountryFilter.getFilter(), ...filters };
    if (page) merged.page = page;
    const query = getQueryString(merged);
    const data = await this._fetchWithCache(`/criminals/filter${query}`);
    return normalizeResponse(data);
  },

  /**
   * Filter criminals by name
   */
  async getCriminalByName(name) {
    const filters = { criminal_name: name, ...CountryFilter.getFilter() };
    const query = getQueryString(filters);
    const data = await this._fetchFromAPI(`/criminals/filter${query}`);
    return normalizeResponse(data);
  },

  /**
   * Filter criminals by affiliation (gang)
   */
  async getCriminalsByAffiliation(affiliation) {
    const filters = { affiliation, ...CountryFilter.getFilter() };
    const query = getQueryString(filters);
    const data = await this._fetchFromAPI(`/criminals/filter${query}`);
    return normalizeResponse(data);
  },

  /**
   * Get unique gangs derived from criminal affiliations
   */
  async getGangs(filters = {}, page = null) {
    const merged = { ...CountryFilter.getFilter(), ...filters };
    if (page) merged.page = page;
    const query = getQueryString(merged);
    const data = await this._fetchWithCache(`/criminals/filter${query}`);
    const criminals = normalizeResponse(data);
    const gangMap = {};

    criminals.forEach((c) => {
      const aff = (c.affiliation || '').trim();
      if (!aff || aff.toLowerCase() === 'empty' || aff === '') return;

      if (!gangMap[aff]) {
        gangMap[aff] = {
          name: aff,
          members: [],
          locations: [],
          crimes: [],
          sources: [],
        };
      }

      gangMap[aff].members.push(c.criminalName);

      if (c.location && c.location !== 'none, none' && c.location !== '') {
        gangMap[aff].locations.push(c.location);
      }

      if (c.crimeType) {
        gangMap[aff].crimes.push(c.crimeType);
      }

      if (c.source) {
        gangMap[aff].sources.push(c.source);
      }
    });

    return Object.values(gangMap).map((g) => ({
      name: g.name,
      memberCount: g.members.length,
      location: g.locations[0] || 'Unknown',
      members: g.members,
      crimes: [...new Set(g.crimes)],
      sources: [...new Set(g.sources)],
    }));
  },

  /**
   * Get activities (news items) from criminal data
   */
  async getActivities(filters = {}, page = null) {
    const merged = { ...CountryFilter.getFilter(), ...filters };
    if (page) merged.page = page;
    const query = getQueryString(merged);
    const data = await this._fetchWithCache(`/criminals/filter${query}`);
    const criminals = normalizeResponse(data);
    return criminals
      .filter((c) => c.title)
      .map((c) => ({
        title: c.title,
        imageUrl: c.imageUrl,
        publishedDate: c.publishedDate,
        source: c.source,
        criminalName: c.criminalName,
        crimeType: c.crimeType,
        location: c.location,
        linkToArticle: c.linkToArticle,
        description: c.description,
        country: c.country,
        publishedBy: c.publishedBy,
        newsLink: c.newsLink
      }));
  },

  /* ================================================================
     Internal Helpers
     ================================================================ */

  async _fetchWithCache(endpoint) {
    const cacheKey = endpoint;
    const cached = this._cache[cacheKey];

    if (cached && Date.now() - cached.timestamp < this._cacheExpiry) {
      return cached.data;
    }

    const data = await this._fetchFromAPI(endpoint);
    this._cache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  },

  async _fetchFromAPI(endpoint) {
    try {
      const response = await fetch(this.apiBaseURL + endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(
        'Failed to fetch data. Please check your connection and try again.',
      );
    }
  },

  clearCache() {
    this._cache = {};
  },
};
