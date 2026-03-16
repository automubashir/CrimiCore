import { normalizeResponse } from './normalize';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.20.121:8000';

// Cache with 5-minute TTL
const cache = {};
const CACHE_EXPIRY = 5 * 60 * 1000;

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

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(API_BASE_URL + endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch data. Please check your connection and try again.');
  }
}

async function fetchWithCache(endpoint) {
  const cached = cache[endpoint];
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }
  const data = await fetchFromAPI(endpoint);
  cache[endpoint] = { data, timestamp: Date.now() };
  return data;
}

export function clearCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
}

function getCountryFilter(country) {
  return country && country !== 'All' ? { location: country } : {};
}

export async function getCriminals(filters = {}, page = null, country = 'All') {
  const merged = { ...getCountryFilter(country), ...filters };
  if (page) merged.page = page;
  const query = getQueryString(merged);
  const data = await fetchWithCache(`/criminals/filter${query}`);
  return normalizeResponse(data);
}

export async function getCriminalByName(name, country = 'All') {
  const filters = { criminal_name: name, ...getCountryFilter(country) };
  const query = getQueryString(filters);
  const data = await fetchFromAPI(`/criminals/filter${query}`);
  return normalizeResponse(data);
}

export async function getCriminalsByAffiliation(affiliation, country = 'All') {
  const filters = { affiliation, ...getCountryFilter(country) };
  const query = getQueryString(filters);
  const data = await fetchFromAPI(`/criminals/filter${query}`);
  return normalizeResponse(data);
}

export async function getGangs(filters = {}, page = null, country = 'All') {
  const merged = { ...getCountryFilter(country), ...filters };
  if (page) merged.page = page;
  const query = getQueryString(merged);
  const data = await fetchWithCache(`/criminals/filter${query}`);
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
}

export async function geocodeLocation(location) {
  const data = await fetchWithCache(`/geocode?location=${encodeURIComponent(location)}`);
  return data;
}

export async function getActivities(filters = {}, page = null, country = 'All') {
  const merged = { ...getCountryFilter(country), ...filters };
  if (page) merged.page = page;
  const query = getQueryString(merged);
  const data = await fetchWithCache(`/criminals/filter${query}`);
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
}
