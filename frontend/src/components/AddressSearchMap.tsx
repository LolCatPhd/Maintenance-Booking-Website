import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface AddressSearchMapProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export default function AddressSearchMap({ onLocationSelect, initialLocation }: AddressSearchMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.latitude || -26.2041, // Johannesburg
    longitude: initialLocation?.longitude || 28.0473,
    zoom: initialLocation ? 14 : 10,
  });
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search for addresses using Mapbox Geocoding API
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=ZA&` + // South Africa
        `types=address,place&` +
        `limit=5`
      );

      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching address:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (feature: any) => {
    const [longitude, latitude] = feature.center;
    const location: LocationData = {
      latitude,
      longitude,
      formattedAddress: feature.place_name,
      streetAddress: feature.text || '',
      city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
      province: feature.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
      postalCode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
    };

    setSelectedLocation(location);
    setSearchQuery(feature.place_name);
    setShowSuggestions(false);
    setViewport({ latitude, longitude, zoom: 14 });
    onLocationSelect(location);
  };

  // Handle marker drag
  const handleMarkerDragEnd = useCallback(async (event: any) => {
    const { lngLat } = event;
    const latitude = lngLat.lat;
    const longitude = lngLat.lng;

    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `types=address`
      );

      const data = await response.json();
      const feature = data.features[0];

      if (feature) {
        const location: LocationData = {
          latitude,
          longitude,
          formattedAddress: feature.place_name,
          streetAddress: feature.text || '',
          city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
          province: feature.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
          postalCode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
        };

        setSelectedLocation(location);
        setSearchQuery(feature.place_name);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  }, [onLocationSelect]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search for your address
        </label>
        <div className="relative">
          <input
            id="address-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter your address..."
            className="input-field w-full pr-10"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-200">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                <div className="text-xs text-gray-500">{suggestion.place_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
        <Map
          {...viewport}
          onMove={(evt: any) => setViewport(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {selectedLocation && (
            <Marker
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="relative">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-lg"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#3b82f6" />
                  <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Selected Address Display */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Selected Location</h4>
              <p className="text-sm text-blue-700 mt-1">{selectedLocation.formattedAddress}</p>
              <p className="text-xs text-blue-600 mt-1">
                You can drag the pin to adjust the exact location
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
