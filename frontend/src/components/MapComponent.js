import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for webpack/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

const defaultIcon = createColoredIcon('#6366f1');
const lostIcon = createColoredIcon('#ef4444');
const foundIcon = createColoredIcon('#10b981');
const listingIcons = {
  sell: createColoredIcon('#f59e0b'),
  adopt: createColoredIcon('#8b5cf6'),
  boarding: createColoredIcon('#3b82f6'),
};

// Reverse geocode lat/lng to address using Nominatim (free)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
    );
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',').map(s => s.trim());
      return parts.length > 3 ? parts.slice(0, 3).join(', ') : data.display_name;
    }
  } catch (err) {
    console.error('Reverse geocode failed:', err);
  }
  return '';
}

// Search Nominatim for locations (used by autocomplete)
async function searchLocations(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    const data = await res.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      shortName: item.display_name.split(',').slice(0, 2).join(',').trim(),
      type: item.type || item.class || '',
    }));
  } catch (err) {
    console.error('Search failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Google Maps-style Autocomplete Search Input (standalone)
// ─────────────────────────────────────────────────────────────
export function LocationSearchInput({ value = '', onChange, onSelect, placeholder = '🔍 Search area, city or address...' }) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const results = await searchLocations(q);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
    setSelectedIndex(-1);
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    // Debounce API calls (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelectSuggestion = (item) => {
    setQuery(item.shortName);
    setShowDropdown(false);
    setSuggestions([]);
    if (onSelect) onSelect({ lat: item.lat, lng: item.lng, name: item.shortName, fullName: item.name });
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const typeIcons = {
    city: '🏙️', town: '🏘️', village: '🏡', suburb: '🏘️', neighbourhood: '📍',
    residential: '🏠', house: '🏠', restaurant: '🍽️', hospital: '🏥',
    school: '🏫', park: '🌳', hotel: '🏨', mosque: '🕌',
    administrative: '🏛️', boundary: '🏛️', state: '🏛️', country: '🌍',
  };

  return (
    <div className="location-search-container" ref={containerRef}>
      <div className="location-search-input-wrap">
        <span className="location-search-icon">🔍</span>
        <input
          type="text"
          className="location-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          autoComplete="off"
        />
        {loading && <span className="location-search-spinner">⏳</span>}
        {query && !loading && (
          <button className="location-search-clear" onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); if (onChange) onChange(''); }}>✕</button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="location-search-dropdown">
          {suggestions.map((item, i) => (
            <div
              key={i}
              className={`location-search-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectSuggestion(item)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="location-search-item-icon">
                {typeIcons[item.type] || '📍'}
              </span>
              <div className="location-search-item-text">
                <div className="location-search-item-name">{item.shortName}</div>
                <div className="location-search-item-full">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Click-to-pick-location component with auto address
// ─────────────────────────────────────────────────────────────
function LocationPicker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);
  const [addressText, setAddressText] = useState('');

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      reverseGeocode(lat, lng).then((name) => {
        setAddressText(name);
        if (onLocationSelect) onLocationSelect({ lat, lng, name });
      });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}>
      <Popup>
        📍 {addressText || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
      </Popup>
    </Marker>
  );
}

// ─────────────────────────────────────────────────────────────
// Map fly-to controller (moves map when search selects a place)
// ─────────────────────────────────────────────────────────────
function FlyToController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────
// Reusable Map Viewer — shows markers for given data points
// ─────────────────────────────────────────────────────────────
export function MapViewer({ markers = [], center = [23.8103, 90.4125], zoom = 12, height = '400px', onMarkerClick }) {
  return (
    <div className="map-wrapper" style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((m, i) => (
          <Marker
            key={m.id || i}
            position={m.position}
            icon={m.icon || defaultIcon}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m) } : undefined}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                {m.title && <strong style={{ display: 'block', marginBottom: 4 }}>{m.title}</strong>}
                {m.description && <span style={{ fontSize: 13, color: '#555' }}>{m.description}</span>}
                {m.price && <span style={{ display: 'block', marginTop: 4, fontWeight: 600, color: '#6366f1' }}>৳{m.price}</span>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable Map Picker — autocomplete search + click map to select
// ─────────────────────────────────────────────────────────────
export function MapPicker({ onLocationSelect, initialCenter = [23.8103, 90.4125], height = '300px' }) {
  const [flyTo, setFlyTo] = useState(null);

  const handleSearchSelect = ({ lat, lng, name }) => {
    setFlyTo([lat, lng]);
    if (onLocationSelect) onLocationSelect({ lat, lng, name });
  };

  return (
    <div>
      <LocationSearchInput
        placeholder="🔍 Search area, city or address..."
        onSelect={handleSearchSelect}
      />
      <div className="map-wrapper" style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', marginTop: 8 }}>
        <MapContainer center={initialCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationPicker onLocationSelect={onLocationSelect} />
          <FlyToController center={flyTo} />
        </MapContainer>
      </div>
    </div>
  );
}

export { createColoredIcon, lostIcon, foundIcon, listingIcons, defaultIcon, reverseGeocode };
export default MapViewer;
