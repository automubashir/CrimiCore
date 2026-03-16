import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { geocodeLocation } from '../../services/api';
import { capitalizeFirst, truncate, formatDate } from '../../utils/formatters';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// SVG marker: person silhouette with crosshair
function createMarkerIcon(count) {
  const size = 36 + Math.min(count * 2, 12);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#1e293b" stroke="#3b82f6" stroke-width="2.5"/>
      <circle cx="24" cy="16" r="6" fill="#3b82f6"/>
      <path d="M14 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#3b82f6"/>
      <circle cx="36" cy="10" r="9" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
      <text x="36" y="14" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold" font-family="Arial">${count}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f1724' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0f1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2540' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070b14' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// Load Google Maps script once
let mapsPromise = null;
function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise;
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  mapsPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) { reject(new Error('Google Maps API key not configured')); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export default function MembersMap({ members }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedMembers, setSelectedMembers] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const closePanel = useCallback(() => {
    setSelectedMembers(null);
    setSelectedLocation('');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          zoom: 3,
          center: { lat: 30, lng: 10 },
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        });
        mapInstanceRef.current = map;

        // Group members by location
        const locationMap = {};
        members.forEach(m => {
          const loc = (m.location || '').trim();
          if (!loc || loc === 'none, none' || loc === '') return;
          if (!locationMap[loc]) locationMap[loc] = [];
          locationMap[loc].push(m);
        });

        const uniqueLocations = Object.keys(locationMap);
        if (uniqueLocations.length === 0) {
          setIsLoading(false);
          return;
        }

        // Geocode all unique locations in parallel
        const geocodeResults = await Promise.allSettled(
          uniqueLocations.map(async (loc) => {
            const result = await geocodeLocation(loc);
            return { location: loc, coords: result };
          })
        );

        if (cancelled) return;

        const bounds = new maps.LatLngBounds();
        let hasValidMarker = false;

        geocodeResults.forEach(result => {
          if (result.status !== 'fulfilled') return;
          const { location, coords } = result.value;
          if (!coords || coords.lat == null || coords.lng == null) return;
          // Handle if API returns lat/lng or latitude/longitude
          const lat = parseFloat(coords.lat ?? coords.latitude);
          const lng = parseFloat(coords.lng ?? coords.longitude);
          if (isNaN(lat) || isNaN(lng)) return;

          const position = { lat, lng };
          const membersAtLocation = locationMap[location];

          const iconSize = 36 + Math.min(membersAtLocation.length * 2, 12);
          const marker = new maps.Marker({
            position,
            map,
            title: `${capitalizeFirst(location)} (${membersAtLocation.length})`,
            icon: {
              url: createMarkerIcon(membersAtLocation.length),
              scaledSize: new maps.Size(iconSize, iconSize),
              anchor: new maps.Point(iconSize / 2, iconSize / 2),
            },
          });

          marker.addListener('click', () => {
            setSelectedMembers(membersAtLocation);
            setSelectedLocation(location);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
          hasValidMarker = true;
        });

        if (hasValidMarker) {
          map.fitBounds(bounds, { padding: 60 });
          // Don't zoom in too far for single markers
          const listener = maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 12) map.setZoom(12);
            maps.event.removeListener(listener);
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setMapError(err.message);
          setIsLoading(false);
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [members]);

  if (mapError) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <div className="map-container" style={{ position: 'relative' }}>
        {isLoading && (
          <div className="map-loading">
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Side Panel */}
      {selectedMembers && (
        <>
          <div className="map-panel-backdrop" onClick={closePanel} />
          <div className="map-panel">
            <div className="map-panel-header">
              <div>
                <h3 className="map-panel-title">{capitalizeFirst(selectedLocation)}</h3>
                <span className="map-panel-count">{selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}</span>
              </div>
              <button className="map-panel-close" onClick={closePanel}>&times;</button>
            </div>
            <div className="map-panel-body">
              {selectedMembers.map((m, i) => (
                <div key={`${m.criminalName}-${i}`} className="map-panel-card">
                  <div className="map-panel-card-img">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.criminalName} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="map-panel-card-img-fallback" style={m.imageUrl ? { display: 'none' } : {}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="map-panel-card-body">
                    <Link to={`/criminals/${encodeURIComponent(m.criminalName)}`} className="map-panel-card-name">
                      {capitalizeFirst(m.criminalName)}
                    </Link>
                    {m.crimeType && <p className="map-panel-card-crime">{capitalizeFirst(truncate(m.crimeType, 60))}</p>}
                    {m.source && <p className="map-panel-card-source">{capitalizeFirst(m.source)}</p>}
                    {m.title && (
                      <div className="map-panel-card-article">
                        <p className="map-panel-card-article-title">{truncate(capitalizeFirst(m.title), 80)}</p>
                        {m.description && <p className="map-panel-card-article-desc">{truncate(m.description, 120)}</p>}
                        {m.publishedDate && <span className="map-panel-card-date">{formatDate(m.publishedDate)}</span>}
                      </div>
                    )}
                    {m.linkToArticle && (
                      <a href={m.linkToArticle} target="_blank" rel="noopener noreferrer" className="map-panel-card-link">
                        Read Article &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
