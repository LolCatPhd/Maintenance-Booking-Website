import { useEffect, useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { adminAPI } from '../services/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface UserLocation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string | null;
  province: string | null;
  createdAt: string;
  _count: {
    bookings: number;
    solarSystems: number;
  };
}

interface LocationData {
  users: UserLocation[];
  statistics: {
    total: number;
    byProvince: Record<string, number>;
    byCity: Record<string, number>;
  };
}

export default function AdminMap() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [viewport, setViewport] = useState({
    latitude: -26.2041, // Johannesburg
    longitude: 28.0473,
    zoom: 5,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [bookingsFilter, setBookingsFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUserLocations();
  }, []);

  const loadUserLocations = async () => {
    try {
      const response = await adminAPI.getUserLocations();
      setLocationData(response.data);

      // Center map on first user if available
      if (response.data.users.length > 0) {
        const firstUser = response.data.users[0];
        setViewport({
          latitude: firstUser.latitude,
          longitude: firstUser.longitude,
          zoom: 6,
        });
      }
    } catch (error) {
      console.error('Failed to load user locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered users based on all filters
  const filteredUsers = useMemo(() => {
    if (!locationData) return [];

    return locationData.users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearch =
          fullName.includes(query) || user.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Province filter
      if (selectedProvince !== 'all' && user.province !== selectedProvince) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && user.city !== selectedCity) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const userDate = new Date(user.createdAt);
        const fromDate = new Date(dateFrom);
        if (userDate < fromDate) return false;
      }
      if (dateTo) {
        const userDate = new Date(user.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (userDate > toDate) return false;
      }

      // Bookings filter
      if (bookingsFilter === 'yes' && user._count.bookings === 0) {
        return false;
      }
      if (bookingsFilter === 'no' && user._count.bookings > 0) {
        return false;
      }

      return true;
    });
  }, [locationData, searchQuery, selectedProvince, selectedCity, dateFrom, dateTo, bookingsFilter]);

  // Get unique provinces and cities for filter dropdowns
  const provinces = useMemo(() => {
    if (!locationData) return [];
    return Array.from(new Set(locationData.users.map((u) => u.province).filter(Boolean))).sort();
  }, [locationData]);

  const cities = useMemo(() => {
    if (!locationData) return [];
    const cityList = locationData.users
      .filter((u) => selectedProvince === 'all' || u.province === selectedProvince)
      .map((u) => u.city)
      .filter(Boolean);
    return Array.from(new Set(cityList)).sort();
  }, [locationData, selectedProvince]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedCity('all');
    setDateFrom('');
    setDateTo('');
    setBookingsFilter('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">Loading map data...</div>
      </div>
    );
  }

  if (!locationData || locationData.users.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No User Locations</h3>
          <p className="mt-1 text-sm text-gray-500">
            No users have registered with location data yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-semibold mb-2">
            {filteredUsers.length === locationData.statistics.total
              ? 'Total Users with Locations'
              : 'Filtered Users'}
          </h3>
          <p className="text-3xl font-bold">{filteredUsers.length}</p>
          {filteredUsers.length !== locationData.statistics.total && (
            <p className="text-xs mt-1 opacity-90">
              of {locationData.statistics.total} total
            </p>
          )}
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-semibold mb-2">Provinces</h3>
          <p className="text-3xl font-bold">
            {Object.keys(locationData.statistics.byProvince).length}
          </p>
        </div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-semibold mb-2">Cities</h3>
          <p className="text-3xl font-bold">
            {Object.keys(locationData.statistics.byCity).length}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Filters</h3>
          <div className="flex space-x-2">
            {(searchQuery || selectedProvince !== 'all' || selectedCity !== 'all' || dateFrom || dateTo || bookingsFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-solar-blue hover:text-blue-700 font-semibold"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name or Email
              </label>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                value={selectedProvince || 'all'}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedCity('all'); // Reset city when province changes
                }}
                className="input-field"
              >
                <option value="all">All Provinces</option>
                {provinces.map((province) => (
                  <option key={province} value={province || ''}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={selectedCity || 'all'}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field"
                disabled={selectedProvince !== 'all' && cities.length === 0}
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city || ''}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registered From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registered To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Bookings Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Has Bookings
              </label>
              <select
                value={bookingsFilter}
                onChange={(e) => setBookingsFilter(e.target.value as 'all' | 'yes' | 'no')}
                className="input-field"
              >
                <option value="all">All Users</option>
                <option value="yes">With Bookings</option>
                <option value="no">Without Bookings</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <div className="h-[600px]">
          <Map
            {...viewport}
            onMove={(evt: any) => setViewport(evt.viewState)}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />

            {filteredUsers.map((user) => (
              <Marker
                key={user.id}
                latitude={user.latitude}
                longitude={user.longitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedUser(user);
                }}
              >
                <div className="cursor-pointer">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1e40af"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg hover:scale-110 transition-transform"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#3b82f6" />
                    <circle cx="12" cy="10" r="3" fill="white" />
                  </svg>
                </div>
              </Marker>
            ))}

            {selectedUser && (
              <Popup
                latitude={selectedUser.latitude}
                longitude={selectedUser.longitude}
                onClose={() => setSelectedUser(null)}
                closeOnClick={false}
                offset={15}
              >
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {selectedUser.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {selectedUser.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span>{' '}
                      {selectedUser.formattedAddress}
                    </p>
                    {selectedUser.city && (
                      <p className="text-gray-600">
                        <span className="font-medium">City:</span> {selectedUser.city}
                      </p>
                    )}
                    {selectedUser.province && (
                      <p className="text-gray-600">
                        <span className="font-medium">Province:</span> {selectedUser.province}
                      </p>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-gray-600">
                        <span className="font-medium">Bookings:</span>{' '}
                        {selectedUser._count.bookings}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Solar Systems:</span>{' '}
                        {selectedUser._count.solarSystems}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>

      {/* Province and City Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Users by Province</h3>
          <div className="space-y-2">
            {Object.entries(locationData.statistics.byProvince)
              .sort(([, a], [, b]) => b - a)
              .map(([province, count]) => (
                <div key={province} className="flex justify-between items-center">
                  <span className="text-gray-700">{province}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Users by City</h3>
          <div className="space-y-2">
            {Object.entries(locationData.statistics.byCity)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([city, count]) => (
                <div key={city} className="flex justify-between items-center">
                  <span className="text-gray-700">{city}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
