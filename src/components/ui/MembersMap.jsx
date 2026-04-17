import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { geocodeLocation } from '../../services/api';
import { capitalizeFirst, truncate } from '../../utils/formatters';

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
                <MemberCard key={`${m.criminalName}-${i}`} member={m} index={i} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const externalLinkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

function MemberCard({ member, index }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const imgUrl = member.imageUrl || '';
  const showImage = imgUrl && !imgError;

  const article = {
    title: member.title || member.criminalName,
    imageUrl: member.imageUrl,
    publishedDate: member.publishedDate,
    description: member.description,
    newsLink: member.linkToArticle,
    source: member.source,
    criminal_count: 0,
  };

  function handleCardClick() {
    if (!article.newsLink) return;
    navigate(`/news/detail?link=${encodeURIComponent(article.newsLink)}`, { state: { article } });
  }

  return (
    <div className="nc-wrapper w-100">
      <div className="nc-papa w-100">
        <div
          className="similar-news-card animate-fade-in"
          style={{ animationDelay: `${index * 30}ms` }}
          onClick={handleCardClick}
        >
          <div className={`similar-news-img${!showImage ? ' news-card-img-fallback' : ''}`}>
            {showImage ? (
              <img src={imgUrl} alt="" onError={() => setImgError(true)} />
            ) : (
              <img src="/broken-img.jpg" alt="" />
            )}
            {member.linkToArticle ? (
              <a
                href={member.linkToArticle}
                target="_blank"
                rel="noopener noreferrer"
                className="similar-news-source-btn"
                onClick={(e) => e.stopPropagation()}
              >
                Source {externalLinkIcon}
              </a>
            ) : (
              <span className="similar-news-source-btn">Source</span>
            )}
          </div>
          <div className="similar-news-body">
            <h4 className="similar-news-title">{capitalizeFirst(member.title || member.criminalName)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
