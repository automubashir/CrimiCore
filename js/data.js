/* ================================================================
   CrimiCore - Data Service Layer
   Connects to the live criminal intelligence API
   ================================================================ */

const DataService = {
  apiBaseURL: 'http://192.168.20.121:8000',

  // Cache to avoid re-fetching the same data
  _cache: {},
  _cacheExpiry: 5 * 60 * 1000, // 5 minutes

  /* ================================================================
     Core API Methods
     ================================================================ */

  /**
   * Get all criminals from the API
   * Used by: Criminals list, Gangs list (unique affiliations), Activities (news)
   */
  async getCriminals() {
    return this._fetchWithCache('/criminals/');
  },

  /**
   * Filter criminals by name
   * Used by: Criminal detail page
   */
  async getCriminalByName(name) {
    const encoded = encodeURIComponent(name);
    return this._fetchFromAPI(`/criminals/filter?criminal_name=${encoded}`);
  },

  /**
   * Filter criminals by affiliation (gang)
   * Used by: Gang detail page
   */
  async getCriminalsByAffiliation(affiliation) {
    const encoded = encodeURIComponent(affiliation);
    return this._fetchFromAPI(`/criminals/filter?affiliation=${encoded}`);
  },

  /**
   * Get unique gangs derived from criminal affiliations
   * Aggregates data from the criminals list
   */
  async getGangs() {
    const criminals = await this.getCriminals();
    const gangMap = {};

    criminals.forEach(c => {
      const aff = (c.affiliation || '').trim();
      if (!aff || aff.toLowerCase() === 'empty' || aff === '') return;

      if (!gangMap[aff]) {
        gangMap[aff] = {
          name: aff,
          members: [],
          locations: [],
          crimes: [],
          sources: []
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

    return Object.values(gangMap).map(g => ({
      name: g.name,
      memberCount: g.members.length,
      location: g.locations[0] || 'Unknown',
      members: g.members,
      crimes: [...new Set(g.crimes)],
      sources: [...new Set(g.sources)]
    }));
  },

  /**
   * Get activities (news items) from criminal data
   * Uses the title field as the news headline
   */
  async getActivities() {
    const criminals = await this.getCriminals();
    return criminals
      .filter(c => c.title && c.imageUrl)
      .map(c => ({
        _id: c._id,
        title: c.title,
        imageUrl: c.imageUrl,
        publishedDate: c.publishedDate,
        source: c.source,
        criminalName: c.criminalName,
        crimeType: c.crimeType,
        location: c.location,
        linkToArticle: c.linkToArticle
      }));
  },


  /* ================================================================
     Internal Helpers
     ================================================================ */

  async _fetchWithCache(endpoint) {
    const cacheKey = endpoint;
    const cached = this._cache[cacheKey];

    if (cached && (Date.now() - cached.timestamp < this._cacheExpiry)) {
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
      throw new Error('Failed to fetch data. Please check your connection and try again.');
    }
  },

  clearCache() {
    this._cache = {};
  }
};
