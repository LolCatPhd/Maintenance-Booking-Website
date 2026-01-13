import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  solarSystems: SolarSystem[];
  _count: {
    bookings: number;
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
  };

  const cancelEditing = () => {
    setEditingSystem(null);
    setEditFormData({});
  };

  const saveSystem = async () => {
    if (!editingSystem) return;

    try {
      await axios.put(
        `${API_URL}/api/bulk-systems/system/${editingSystem}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'System updated successfully');
      setEditingSystem(null);
      setEditFormData({});
      fetchUsers();
    } catch (error: any) {
      showMessage('error', 'Failed to update system');
    }
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
                          <button
                            onClick={() => addSystem(user.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            + Add System
                          </button>
                        </td>
                      </tr>

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
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                          <input
                                            type="text"
                                            placeholder="System Name"
                                            value={editFormData.systemName || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, systemName: e.target.value })}
                                            className="border rounded px-3 py-2"
                                          />
                                          <input
                                            type="text"
                                            placeholder="Inverter Model"
                                            value={editFormData.inverterModel || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, inverterModel: e.target.value })}
                                            className="border rounded px-3 py-2"
                                          />
                                          <input
                                            type="text"
                                            placeholder="Battery Model"
                                            value={editFormData.batteryModel || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, batteryModel: e.target.value })}
                                            className="border rounded px-3 py-2"
                                          />
                                          <input
                                            type="number"
                                            placeholder="Battery Qty"
                                            value={editFormData.batteryQuantity || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, batteryQuantity: parseInt(e.target.value) || null })}
                                            className="border rounded px-3 py-2"
                                          />
                                          <input
                                            type="text"
                                            placeholder="Solar Panel Wattage"
                                            value={editFormData.solarPanelWattage || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, solarPanelWattage: e.target.value })}
                                            className="border rounded px-3 py-2"
                                          />
                                          <input
                                            type="number"
                                            placeholder="Solar Panel Qty"
                                            value={editFormData.solarPanelQuantity || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, solarPanelQuantity: parseInt(e.target.value) || null })}
                                            className="border rounded px-3 py-2"
                                          />
                                        </div>
                                        <input
                                          type="url"
                                          placeholder="Monitoring Platform URL"
                                          value={editFormData.monitoringPlatformUrl || ''}
                                          onChange={(e) => setEditFormData({ ...editFormData, monitoringPlatformUrl: e.target.value })}
                                          className="border rounded px-3 py-2 w-full"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={saveSystem}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                          >
                                            Save
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
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium">Inverter:</span> {system.inverterModel || 'N/A'}
                                          </div>
                                          <div>
                                            <span className="font-medium">Battery:</span> {system.batteryModel || 'N/A'} {system.batteryQuantity ? `(${system.batteryQuantity}x)` : ''}
                                          </div>
                                          <div>
                                            <span className="font-medium">Solar Panels:</span> {system.solarPanelWattage || 'N/A'} {system.solarPanelQuantity ? `(${system.solarPanelQuantity}x)` : ''}
                                          </div>
                                        </div>
                                        {system.monitoringPlatformUrl && (
                                          <div className="mt-2 text-sm">
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
