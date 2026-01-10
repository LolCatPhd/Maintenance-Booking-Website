import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, solarSystemAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, systemsRes] = await Promise.all([
        bookingAPI.getBookings(),
        solarSystemAPI.getSystems(),
      ]);
      setBookings(bookingsRes.data.slice(0, 5));
      setSystems(systemsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your solar systems and maintenance bookings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Systems</h3>
            <p className="text-4xl font-bold">{systems.length}</p>
          </div>
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
            <p className="text-4xl font-bold">
              {bookings.filter((b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED').length}
            </p>
          </div>
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Completed Services</h3>
            <p className="text-4xl font-bold">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
              <Link to="/bookings" className="text-solar-blue hover:underline">
                View All
              </Link>
            </div>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.serviceType.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(booking.slot.date).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-solar-blue">
                          ${booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-600 mb-4">No bookings yet</p>
                <Link to="/book" className="btn-primary">
                  Book Your First Service
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Solar Systems</h2>
              <Link to="/solar-systems" className="text-solar-blue hover:underline">
                Manage
              </Link>
            </div>
            {systems.length > 0 ? (
              <div className="space-y-4">
                {systems.map((system) => (
                  <div key={system.id} className="card">
                    <h3 className="font-semibold text-lg">{system.systemName}</h3>
                    <p className="text-gray-600 text-sm">{system.address}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        {system.components.length} components
                      </span>
                      <span className="text-gray-600">
                        {system.maintenanceVisits.length} visits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-600 mb-4">No systems registered</p>
                <Link to="/solar-systems" className="btn-primary">
                  Add Solar System
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 card bg-gradient-to-r from-solar-blue to-blue-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready for Maintenance?</h3>
              <p>Schedule your next service appointment today</p>
            </div>
            <Link
              to="/book"
              className="bg-solar-yellow text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
