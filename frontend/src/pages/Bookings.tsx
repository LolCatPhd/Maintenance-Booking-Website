import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancelBooking(bookingId);
      loadBookings();
    } catch (error) {
      alert('Failed to cancel booking');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Bookings</h1>
          <Link to="/book" className="btn-primary">
            New Booking
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold">
                        {booking.serviceType.replace(/_/g, ' ')}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Date:</strong> {new Date(booking.slot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-600">
                      <strong>Address:</strong> {booking.address}
                    </p>
                    {booking.notes && (
                      <p className="text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                    {booking.maintenanceVisit && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Service Report</h4>
                        {booking.maintenanceVisit.technicianName && (
                          <p className="text-sm text-gray-600">
                            <strong>Technician:</strong> {booking.maintenanceVisit.technicianName}
                          </p>
                        )}
                        {booking.maintenanceVisit.findings && (
                          <p className="text-sm text-gray-600">
                            <strong>Findings:</strong> {booking.maintenanceVisit.findings}
                          </p>
                        )}
                        {booking.maintenanceVisit.workPerformed && (
                          <p className="text-sm text-gray-600">
                            <strong>Work Performed:</strong> {booking.maintenanceVisit.workPerformed}
                          </p>
                        )}
                        {booking.maintenanceVisit.recommendations && (
                          <p className="text-sm text-gray-600">
                            <strong>Recommendations:</strong> {booking.maintenanceVisit.recommendations}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-solar-blue mb-4">
                      ${booking.totalAmount}
                    </p>
                    {booking.payment?.paymentStatus === 'COMPLETED' ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Paid
                      </span>
                    ) : booking.status === 'PENDING' ? (
                      <button
                        onClick={() => navigate(`/payment/${booking.id}`)}
                        className="btn-primary text-sm mb-2"
                      >
                        Pay Now
                      </button>
                    ) : null}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="block w-full text-sm text-red-600 hover:text-red-800 mt-2"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No bookings yet</p>
            <Link to="/book" className="btn-primary">
              Book Your First Service
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
