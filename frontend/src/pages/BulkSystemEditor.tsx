import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import AddressSearchMap from '../components/AddressSearchMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface SystemComponent {
  id?: string;
  componentType: string;
  manufacturer: string;
  model: string;
  serialNumber?: string | null;
  installDate?: string;
  warrantyExpiry?: string | null;
  notes?: string | null;
}

interface SolarSystem {
  id: string;
  systemName: string;
  installationDate: string;
  address: string;
  inverterModel: string | null;
  batteryModel: string | null;
  batteryQuantity: number | null;
  solarPanelWattage: string | null;
  solarPanelQuantity: number | null;
  monitoringPlatformUrl: string | null;
  components?: SystemComponent[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string | null;
  province: string | null;
  streetAddress: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
  solarSystems: SolarSystem[];
  _count: {
    bookings: number;
  };
}

interface ComponentTableData {
  inverter: {
    brand: string;
    rating: string;
    quantity: number;
    serialNumbers: string[];
  };
  batteries: {
    brand: string;
    rating: string;
    quantity: number;
    serialNumbers: string[];
  };
  solarPanels: {
    brand: string;
    rating: string;
    quantity: number;
  };
}

interface BulkResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function BulkSystemEditor() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [hasSystemFilter, setHasSystemFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<BulkResponse['pagination'] | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [editingSystem, setEditingSystem] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SolarSystem>>({});
  const [componentTableData, setComponentTableData] = useState<ComponentTableData>({
    inverter: { brand: '', rating: '', quantity: 0, serialNumbers: [] },
    batteries: { brand: '', rating: '', quantity: 0, serialNumbers: [] },
    solarPanels: { brand: '', rating: '', quantity: 0 },
  });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<User>>({});
  const [userLocationData, setUserLocationData] = useState<LocationData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(provinceFilter !== 'all' && { province: provinceFilter }),
        ...(cityFilter !== 'all' && { city: cityFilter }),
        ...(hasSystemFilter !== 'all' && { hasSystem: hasSystemFilter }),
      });

      const response = await axios.get<BulkResponse>(`${API_URL}/api/bulk-systems?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, provinceFilter, cityFilter, hasSystemFilter]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const startEditingSystem = (system: SolarSystem) => {
    setEditingSystem(system.id);
    setEditFormData(system);
    loadComponentsIntoTable(system);
  };

  const cancelEditing = () => {
    setEditingSystem(null);
    setEditFormData({});
  };

  const deleteSystem = async (systemId: string) => {
    if (!confirm('Are you sure you want to delete this system?')) return;

    try {
      await axios.delete(`${API_URL}/api/bulk-systems/system/${systemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMessage('success', 'System deleted successfully');
      fetchUsers();
    } catch (error: any) {
      showMessage('error', 'Failed to delete system');
    }
  };

  const addSystem = async (userId: string) => {
    const systemName = prompt('Enter system name:');
    if (!systemName) return;

    try {
      await axios.post(
        `${API_URL}/api/bulk-systems/system`,
        {
          userId,
          systemName,
          installationDate: new Date().toISOString(),
          address: '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'System created successfully');
      fetchUsers();
      // Auto-expand the user
      setExpandedUsers(prev => new Set(prev).add(userId));
    } catch (error: any) {
      showMessage('error', 'Failed to create system');
    }
  };

  // Load components into component table for editing
  const loadComponentsIntoTable = (system: SolarSystem) => {
    const components = system.components || [];
    const inverter = components.find(c => c.componentType === 'INVERTER');
    const batteries = components.filter(c => c.componentType === 'BATTERY');
    const solarPanels = components.filter(c => c.componentType === 'SOLAR_PANEL');

    setComponentTableData({
      inverter: {
        brand: inverter?.manufacturer || '',
        rating: inverter?.model || '',
        quantity: inverter ? 1 : 0,
        serialNumbers: inverter?.serialNumber ? [inverter.serialNumber] : [''],
      },
      batteries: {
        brand: batteries[0]?.manufacturer || '',
        rating: batteries[0]?.model || '',
        quantity: batteries.length,
        serialNumbers: batteries.length > 0
          ? batteries.map(b => b.serialNumber || '')
          : [''],
      },
      solarPanels: {
        brand: solarPanels[0]?.manufacturer || '',
        rating: solarPanels[0]?.model || '',
        quantity: solarPanels.length,
      },
    });
  };

  // Update serial number array when quantity changes
  const updateSerialNumbersForQuantity = (type: 'inverter' | 'batteries', quantity: number) => {
    setComponentTableData(prev => {
      const current = prev[type];
      const newSerialNumbers = Array.from({ length: quantity }, (_, i) =>
        current.serialNumbers[i] || ''
      );
      return {
        ...prev,
        [type]: {
          ...current,
          quantity,
          serialNumbers: newSerialNumbers,
        },
      };
    });
  };

  // Save component table to system
  const saveComponentTable = async () => {
    if (!editingSystem) return;

    try {
      // Build components array from table data
      const components: SystemComponent[] = [];

      // Add inverter if quantity > 0
      if (componentTableData.inverter.quantity > 0) {
        components.push({
          componentType: 'INVERTER',
          manufacturer: componentTableData.inverter.brand,
          model: componentTableData.inverter.rating,
          serialNumber: componentTableData.inverter.serialNumbers[0] || null,
          installDate: new Date().toISOString(),
        });
      }

      // Add batteries based on quantity
      for (let i = 0; i < componentTableData.batteries.quantity; i++) {
        components.push({
          componentType: 'BATTERY',
          manufacturer: componentTableData.batteries.brand,
          model: componentTableData.batteries.rating,
          serialNumber: componentTableData.batteries.serialNumbers[i] || null,
          installDate: new Date().toISOString(),
        });
      }

      // Add solar panels based on quantity (no serial numbers)
      for (let i = 0; i < componentTableData.solarPanels.quantity; i++) {
        components.push({
          componentType: 'SOLAR_PANEL',
          manufacturer: componentTableData.solarPanels.brand,
          model: componentTableData.solarPanels.rating,
          installDate: new Date().toISOString(),
        });
      }

      // Save components to backend
      await axios.put(
        `${API_URL}/api/bulk-systems/system/${editingSystem}/components`,
        { components },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'System components updated successfully');
      setEditingSystem(null);
      fetchUsers();
    } catch (error: any) {
      showMessage('error', 'Failed to update system components');
    }
  };

  // Start editing user
  const startEditingUser = (user: User) => {
    setEditingUser(user.id);
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      streetAddress: user.streetAddress || '',
      city: user.city || '',
      province: user.province || '',
      postalCode: user.postalCode || '',
    });

    // Set initial location data if available
    if (user.latitude && user.longitude) {
      setUserLocationData({
        latitude: user.latitude,
        longitude: user.longitude,
        formattedAddress: user.formattedAddress || '',
        streetAddress: user.streetAddress || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
      });
    } else {
      setUserLocationData(null);
    }
  };

  // Cancel user editing
  const cancelUserEditing = () => {
    setEditingUser(null);
    setEditUserData({});
    setUserLocationData(null);
  };

  // Save user changes
  const saveUser = async () => {
    if (!editingUser) return;

    try {
      const updateData = {
        ...editUserData,
        ...(userLocationData && {
          latitude: userLocationData.latitude,
          longitude: userLocationData.longitude,
          formattedAddress: userLocationData.formattedAddress,
          streetAddress: userLocationData.streetAddress,
          city: userLocationData.city,
          province: userLocationData.province,
          postalCode: userLocationData.postalCode,
        }),
      };

      await axios.put(
        `${API_URL}/api/bulk-systems/user/${editingUser}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'User updated successfully');
      setEditingUser(null);
      setEditUserData({});
      setUserLocationData(null);
      fetchUsers();
    } catch (error: any) {
      showMessage('error', 'Failed to update user');
    }
  };

  const uniqueProvinces = Array.from(new Set(users.map(u => u.province).filter((p): p is string => Boolean(p)))).sort();
  const uniqueCities = Array.from(new Set(users.map(u => u.city).filter((c): c is string => Boolean(c)))).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bulk System Editor</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2"
            />

            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Provinces</option>
              {uniqueProvinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={hasSystemFilter}
              onChange={(e) => setHasSystemFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="true">With Systems</option>
              <option value="false">Without Systems</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Systems</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Bookings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleUserExpanded(user.id)}
                            className="text-left hover:text-blue-600"
                          >
                            <span className="mr-2">{expandedUsers.has(user.id) ? '▼' : '▶'}</span>
                            {user.firstName} {user.lastName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{user.email}</div>
                          <div className="text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.city}, {user.province}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${user.solarSystems.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.solarSystems.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{user._count.bookings}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingUser(user)}
                              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                            >
                              Edit User
                            </button>
                            <button
                              onClick={() => addSystem(user.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              + Add System
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* User Edit Form */}
                      {editingUser === user.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 bg-purple-50">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-purple-900 mb-4">Edit User Account</h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">First Name</label>
                                  <input
                                    type="text"
                                    value={editUserData.firstName || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
                                    className="border rounded px-3 py-2 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Last Name</label>
                                  <input
                                    type="text"
                                    value={editUserData.lastName || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                                    className="border rounded px-3 py-2 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Email</label>
                                  <input
                                    type="email"
                                    value={editUserData.email || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                                    className="border rounded px-3 py-2 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Phone</label>
                                  <input
                                    type="tel"
                                    value={editUserData.phone || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                                    className="border rounded px-3 py-2 w-full"
                                  />
                                </div>
                              </div>

                              <div className="mt-4">
                                <h4 className="text-md font-medium mb-2">Address</h4>
                                <AddressSearchMap
                                  onLocationSelect={setUserLocationData}
                                  initialLocation={userLocationData || undefined}
                                />
                              </div>

                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={saveUser}
                                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                  Save User
                                </button>
                                <button
                                  onClick={cancelUserEditing}
                                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {expandedUsers.has(user.id) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-gray-50">
                            {user.solarSystems.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">No systems found. Click "Add System" to create one.</p>
                            ) : (
                              <div className="space-y-4">
                                {user.solarSystems.map((system) => (
                                  <div key={system.id} className="bg-white p-4 rounded border">
                                    {editingSystem === system.id ? (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Edit System: {system.systemName}</h3>

                                        {/* Component Table */}
                                        <div className="overflow-x-auto">
                                          <table className="w-full border-collapse border border-gray-300">
                                            <thead>
                                              <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Component</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Inverter</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Batteries</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Solar Panels</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {/* Brand + Rating Row */}
                                              <tr>
                                                <td className="border border-gray-300 px-4 py-2 font-medium">Brand + Rating</td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="text"
                                                    placeholder="e.g. Deye 8kW"
                                                    value={componentTableData.inverter.brand + (componentTableData.inverter.rating ? ' ' + componentTableData.inverter.rating : '')}
                                                    onChange={(e) => {
                                                      const parts = e.target.value.split(' ');
                                                      setComponentTableData({
                                                        ...componentTableData,
                                                        inverter: {
                                                          ...componentTableData.inverter,
                                                          brand: parts[0] || '',
                                                          rating: parts.slice(1).join(' ') || '',
                                                        },
                                                      });
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="text"
                                                    placeholder="e.g. Hubble 5.5kWh"
                                                    value={componentTableData.batteries.brand + (componentTableData.batteries.rating ? ' ' + componentTableData.batteries.rating : '')}
                                                    onChange={(e) => {
                                                      const parts = e.target.value.split(' ');
                                                      setComponentTableData({
                                                        ...componentTableData,
                                                        batteries: {
                                                          ...componentTableData.batteries,
                                                          brand: parts[0] || '',
                                                          rating: parts.slice(1).join(' ') || '',
                                                        },
                                                      });
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="text"
                                                    placeholder="e.g. JA Solar 450W"
                                                    value={componentTableData.solarPanels.brand + (componentTableData.solarPanels.rating ? ' ' + componentTableData.solarPanels.rating : '')}
                                                    onChange={(e) => {
                                                      const parts = e.target.value.split(' ');
                                                      setComponentTableData({
                                                        ...componentTableData,
                                                        solarPanels: {
                                                          ...componentTableData.solarPanels,
                                                          brand: parts[0] || '',
                                                          rating: parts.slice(1).join(' ') || '',
                                                        },
                                                      });
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                              </tr>

                                              {/* Quantity Row */}
                                              <tr>
                                                <td className="border border-gray-300 px-4 py-2 font-medium">Quantity</td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    max="1"
                                                    value={componentTableData.inverter.quantity}
                                                    onChange={(e) => {
                                                      const qty = Math.min(1, Math.max(0, parseInt(e.target.value) || 0));
                                                      updateSerialNumbersForQuantity('inverter', qty);
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    value={componentTableData.batteries.quantity}
                                                    onChange={(e) => {
                                                      const qty = Math.max(0, parseInt(e.target.value) || 0);
                                                      updateSerialNumbersForQuantity('batteries', qty);
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    value={componentTableData.solarPanels.quantity}
                                                    onChange={(e) => {
                                                      const qty = Math.max(0, parseInt(e.target.value) || 0);
                                                      setComponentTableData({
                                                        ...componentTableData,
                                                        solarPanels: {
                                                          ...componentTableData.solarPanels,
                                                          quantity: qty,
                                                        },
                                                      });
                                                    }}
                                                    className="border rounded px-2 py-1 w-full text-sm"
                                                  />
                                                </td>
                                              </tr>

                                              {/* Serial Number Rows */}
                                              {Math.max(
                                                componentTableData.inverter.quantity,
                                                componentTableData.batteries.quantity
                                              ) > 0 && (
                                                <>
                                                  {Array.from({
                                                    length: Math.max(
                                                      componentTableData.inverter.quantity,
                                                      componentTableData.batteries.quantity
                                                    ),
                                                  }).map((_, index) => (
                                                    <tr key={index}>
                                                      <td className="border border-gray-300 px-4 py-2 font-medium">
                                                        Serial Number {index + 1}
                                                      </td>
                                                      <td className="border border-gray-300 px-2 py-2">
                                                        {index < componentTableData.inverter.quantity && (
                                                          <input
                                                            type="text"
                                                            placeholder="Serial number"
                                                            value={componentTableData.inverter.serialNumbers[index] || ''}
                                                            onChange={(e) => {
                                                              const newSerialNumbers = [...componentTableData.inverter.serialNumbers];
                                                              newSerialNumbers[index] = e.target.value;
                                                              setComponentTableData({
                                                                ...componentTableData,
                                                                inverter: {
                                                                  ...componentTableData.inverter,
                                                                  serialNumbers: newSerialNumbers,
                                                                },
                                                              });
                                                            }}
                                                            className="border rounded px-2 py-1 w-full text-sm"
                                                          />
                                                        )}
                                                      </td>
                                                      <td className="border border-gray-300 px-2 py-2">
                                                        {index < componentTableData.batteries.quantity && (
                                                          <input
                                                            type="text"
                                                            placeholder="Serial number"
                                                            value={componentTableData.batteries.serialNumbers[index] || ''}
                                                            onChange={(e) => {
                                                              const newSerialNumbers = [...componentTableData.batteries.serialNumbers];
                                                              newSerialNumbers[index] = e.target.value;
                                                              setComponentTableData({
                                                                ...componentTableData,
                                                                batteries: {
                                                                  ...componentTableData.batteries,
                                                                  serialNumbers: newSerialNumbers,
                                                                },
                                                              });
                                                            }}
                                                            className="border rounded px-2 py-1 w-full text-sm"
                                                          />
                                                        )}
                                                      </td>
                                                      <td className="border border-gray-300 px-2 py-2 bg-gray-50 text-center text-sm text-gray-500">
                                                        N/A
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                          <button
                                            onClick={saveComponentTable}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                          >
                                            Save Components
                                          </button>
                                          <button
                                            onClick={cancelEditing}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <h3 className="font-semibold text-lg">{system.systemName}</h3>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => startEditingSystem(system)}
                                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => deleteSystem(system.id)}
                                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </div>

                                        {/* Display Components */}
                                        {system.components && system.components.length > 0 ? (
                                          <div className="mt-3">
                                            <h4 className="font-medium text-sm mb-2">Components:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              {/* Inverter */}
                                              {system.components.filter(c => c.componentType === 'INVERTER').map((comp, idx) => (
                                                <div key={idx} className="bg-blue-50 p-2 rounded border border-blue-200">
                                                  <div className="font-medium text-sm text-blue-900">Inverter</div>
                                                  <div className="text-xs text-blue-700">{comp.manufacturer} {comp.model}</div>
                                                  {comp.serialNumber && (
                                                    <div className="text-xs text-gray-600 mt-1">SN: {comp.serialNumber}</div>
                                                  )}
                                                </div>
                                              ))}

                                              {/* Batteries */}
                                              {system.components.filter(c => c.componentType === 'BATTERY').length > 0 && (
                                                <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                                  <div className="font-medium text-sm text-yellow-900">
                                                    Batteries ({system.components.filter(c => c.componentType === 'BATTERY').length}x)
                                                  </div>
                                                  <div className="text-xs text-yellow-700">
                                                    {system.components.find(c => c.componentType === 'BATTERY')?.manufacturer}{' '}
                                                    {system.components.find(c => c.componentType === 'BATTERY')?.model}
                                                  </div>
                                                  <div className="text-xs text-gray-600 mt-1">
                                                    {system.components.filter(c => c.componentType === 'BATTERY').map((b, i) => (
                                                      <div key={i}>
                                                        {b.serialNumber && `SN ${i + 1}: ${b.serialNumber}`}
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Solar Panels */}
                                              {system.components.filter(c => c.componentType === 'SOLAR_PANEL').length > 0 && (
                                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                                  <div className="font-medium text-sm text-green-900">
                                                    Solar Panels ({system.components.filter(c => c.componentType === 'SOLAR_PANEL').length}x)
                                                  </div>
                                                  <div className="text-xs text-green-700">
                                                    {system.components.find(c => c.componentType === 'SOLAR_PANEL')?.manufacturer}{' '}
                                                    {system.components.find(c => c.componentType === 'SOLAR_PANEL')?.model}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-sm text-gray-500 mt-2">
                                            No components configured. Click "Edit" to add components.
                                          </div>
                                        )}

                                        {system.monitoringPlatformUrl && (
                                          <div className="mt-3 text-sm">
                                            <span className="font-medium">Monitoring:</span>{' '}
                                            <a href={system.monitoringPlatformUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                              {system.monitoringPlatformUrl}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
