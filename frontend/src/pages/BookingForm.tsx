import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { bookingAPI } from '../services/api';

const serviceTypes = [
  { value: 'ROUTINE_INSPECTION', label: 'Routine Inspection', price: 150 },
  { value: 'PANEL_CLEANING', label: 'Panel Cleaning', price: 200 },
  { value: 'INVERTER_SERVICE', label: 'Inverter Service', price: 250 },
  { value: 'ELECTRICAL_CHECK', label: 'Electrical Check', price: 180 },
  { value: 'FULL_MAINTENANCE', label: 'Full Maintenance', price: 400 },
  { value: 'EMERGENCY_REPAIR', label: 'Emergency Repair', price: 350 },
];

export default function BookingForm() {
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [serviceType, setServiceType] = useState('ROUTINE_INSPECTION');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    try {
      const response = await bookingAPI.getAvailableSlots();
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Failed to load available slots', error);
    }
  };

  const getAvailableDates = () => {
    return availableSlots.map((slot) => new Date(slot.date).toDateString());
  };

  const tileClassName = ({ date }: any) => {
    const dateString = date.toDateString();
    if (getAvailableDates().includes(dateString)) {
      return 'bg-green-100 hover:bg-green-200';
    }
    return '';
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    const slot = availableSlots.find(
      (s) => new Date(s.date).toDateString() === date.toDateString()
    );
    if (slot) {
      setSelectedSlot(slot.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const response = await bookingAPI.createBooking({
        slotId: selectedSlot,
        serviceType,
        address,
        notes,
      });
      navigate(`/payment/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = serviceTypes.find((s) => s.value === serviceType);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Book Maintenance Service</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Select Service</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {serviceTypes.map((service) => (
                <label
                  key={service.value}
                  className={`card cursor-pointer border-2 transition ${
                    serviceType === service.value
                      ? 'border-solar-blue bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={service.value}
                    checked={serviceType === service.value}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{service.label}</span>
                    <span className="text-solar-blue font-bold">${service.price}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Select Date</h2>
            <div className="flex justify-center">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                tileClassName={tileClassName}
                tileDisabled={({ date }) =>
                  !getAvailableDates().includes(date.toDateString())
                }
              />
            </div>
            {selectedDate && (
              <div className="mt-4 text-center">
                <p className="text-lg">
                  Selected: <strong>{selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Service Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Any specific concerns or requests..."
                />
              </div>
            </div>
          </div>

          <div className="card bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total Amount:</span>
              <span className="text-3xl font-bold text-solar-blue">
                ${selectedService?.price}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating booking...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
