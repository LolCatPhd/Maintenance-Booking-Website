import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

interface Booking {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  serviceType: string;
  address: string;
  distanceFromBase?: number;
  status: string;
}

interface Slot {
  id: string;
  date: string;
  isAvailable: boolean;
  maxBookings: number;
  bookings: Booking[];
}

export default function AdminCalendar() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    loadSlots();
  }, [currentDate]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSlots();
      setSlots(response.data);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getSlotForDate = (day: number): Slot | null => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return slots.find(s => s.date.startsWith(dateStr)) || null;
  };

  const getDayColor = (slot: Slot | null) => {
    if (!slot) return 'bg-gray-50 text-gray-400';
    if (!slot.isAvailable) return 'bg-gray-200 text-gray-500';

    const activeBookings = slot.bookings.filter(b => b.status !== 'CANCELLED').length;

    if (activeBookings === 0) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (activeBookings === 1) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    if (activeBookings >= 2) return 'bg-red-100 text-red-800';

    return 'bg-white';
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const slot = getSlotForDate(day);
      const activeBookings = slot?.bookings.filter(b => b.status !== 'CANCELLED') || [];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => slot && setSelectedSlot(slot)}
          className={`p-2 border border-gray-200 min-h-[80px] cursor-pointer transition-colors ${getDayColor(slot)} ${
            isToday ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          {slot && (
            <div className="text-xs space-y-1">
              <div className="font-medium">
                {activeBookings.length}/{slot.maxBookings} booked
              </div>
              {activeBookings.slice(0, 2).map((booking) => (
                <div key={booking.id} className="truncate text-xs bg-white bg-opacity-50 px-1 rounded">
                  {booking.user.firstName} {booking.user.lastName.charAt(0)}.
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Previous
          </button>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200"></div>
          <span>Available (0/2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200"></div>
          <span>Partial (1/2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200"></div>
          <span>Full (2/2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading calendar...</div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-sm">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Slot Details Modal */}
          {selectedSlot && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setSelectedSlot(null)}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">
                    {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`px-3 py-1 rounded text-sm ${
                      selectedSlot.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedSlot.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-sm">
                      {selectedSlot.bookings.filter(b => b.status !== 'CANCELLED').length}/{selectedSlot.maxBookings} slots booked
                    </span>
                  </div>

                  {selectedSlot.bookings.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-2">Bookings:</h4>
                      <div className="space-y-3">
                        {selectedSlot.bookings.map((booking) => (
                          <div key={booking.id} className="p-4 border rounded bg-gray-50">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Client:</span> {booking.user.firstName} {booking.user.lastName}
                              </div>
                              <div>
                                <span className="font-medium">Service:</span> {booking.serviceType.replace(/_/g, ' ')}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Address:</span> {booking.address}
                              </div>
                              {booking.distanceFromBase && (
                                <div>
                                  <span className="font-medium">Distance:</span> {booking.distanceFromBase.toFixed(2)} km
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Status:</span>{' '}
                                <span className={`px-2 py-1 rounded text-xs ${
                                  booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No bookings for this day</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
