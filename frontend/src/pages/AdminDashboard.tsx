import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import AdminMap from '../components/AdminMap';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'slots' | 'locations'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlots, setShowAddSlots] = useState(false);
  const [bulkSlotForm, setBulkSlotForm] = useState({
    startDate: '',
    endDate: '',
    maxBookings: 4,
    excludeWeekends: true,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } else if (activeTab === 'bookings') {
        const response = await adminAPI.getBookings();
        setBookings(response.data);
      } else if (activeTab === 'slots') {
        const response = await adminAPI.getSlots();
        setSlots(response.data);
      } else if (activeTab === 'locations') {
        // AdminMap component handles its own data loading
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, status);
      loadData();
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const handleCreateBulkSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createBulkSlots(bulkSlotForm);
      setBulkSlotForm({
        startDate: '',
        endDate: '',
        maxBookings: 4,
        excludeWeekends: true,
      });
      setShowAddSlots(false);
      loadData();
      alert('Slots created successfully');
    } catch (error) {
      alert('Failed to create slots');
    }
  };

  const handleToggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      await adminAPI.updateSlot(slotId, { isAvailable: !isAvailable });
      loadData();
    } catch (error) {
      alert('Failed to update slot');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'overview'
                ? 'bg-solar-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'bookings'
                ? 'bg-solar-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'slots'
                ? 'bg-solar-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'locations'
                ? 'bg-solar-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            User Locations
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <h3 className="text-sm font-semibold mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold">{stats.totalBookings}</p>
                  </div>
                  <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <h3 className="text-sm font-semibold mb-2">Pending</h3>
                    <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                  </div>
                  <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <h3 className="text-sm font-semibold mb-2">Completed</h3>
                    <p className="text-3xl font-bold">{stats.completedBookings}</p>
                  </div>
                  <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <h3 className="text-sm font-semibold mb-2">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <h3 className="text-sm font-semibold mb-2">Revenue</h3>
                    <p className="text-3xl font-bold">${stats.totalRevenue}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-semibold">
                          {booking.user.firstName} {booking.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{booking.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-semibold">
                          {booking.serviceType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.slot.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleUpdateBookingStatus(booking.id, e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-solar-blue focus:ring focus:ring-solar-blue"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-2xl font-bold text-solar-blue">
                          ${booking.totalAmount}
                        </p>
                        {booking.payment && (
                          <span className="text-xs text-green-600">
                            {booking.payment.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'slots' && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddSlots(!showAddSlots)}
                    className="btn-primary"
                  >
                    {showAddSlots ? 'Cancel' : 'Add Availability Slots'}
                  </button>
                </div>

                {showAddSlots && (
                  <div className="card mb-6">
                    <h3 className="text-xl font-bold mb-4">Create Bulk Slots</h3>
                    <form onSubmit={handleCreateBulkSlots} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            required
                            value={bulkSlotForm.startDate}
                            onChange={(e) =>
                              setBulkSlotForm({
                                ...bulkSlotForm,
                                startDate: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            required
                            value={bulkSlotForm.endDate}
                            onChange={(e) =>
                              setBulkSlotForm({
                                ...bulkSlotForm,
                                endDate: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Bookings Per Day
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          required
                          value={bulkSlotForm.maxBookings}
                          onChange={(e) =>
                            setBulkSlotForm({
                              ...bulkSlotForm,
                              maxBookings: parseInt(e.target.value),
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bulkSlotForm.excludeWeekends}
                          onChange={(e) =>
                            setBulkSlotForm({
                              ...bulkSlotForm,
                              excludeWeekends: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span>Exclude Weekends</span>
                      </label>
                      <button type="submit" className="btn-primary">
                        Create Slots
                      </button>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  {slots.slice(0, 50).map((slot) => (
                    <div
                      key={slot.id}
                      className={`card ${
                        slot.isAvailable ? 'border-green-300' : 'border-red-300'
                      } border-2`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">
                            {new Date(slot.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {slot.bookings.length} / {slot.maxBookings} booked
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleSlotAvailability(slot.id, slot.isAvailable)
                          }
                          className={`text-xs px-3 py-1 rounded-full ${
                            slot.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {slot.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'locations' && <AdminMap />}
          </>
        )}
      </div>
    </div>
  );
}
