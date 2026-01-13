import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { bookingAPI } from '../services/api';
import AddressSearchMap from '../components/AddressSearchMap';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const serviceTypes = [
  { value: 'ROUTINE_INSPECTION', label: 'Routine Inspection', price: 150 },
  { value: 'PANEL_CLEANING', label: 'Panel Cleaning', price: 200 },
  { value: 'INVERTER_SERVICE', label: 'Inverter Service', price: 250 },
  { value: 'ELECTRICAL_CHECK', label: 'Electrical Check', price: 180 },
  { value: 'FULL_MAINTENANCE', label: 'Full Maintenance', price: 400 },
  { value: 'EMERGENCY_REPAIR', label: 'Emergency Repair', price: 350 },
];

// Distance-based pricing calculation: R4.7 per km (matching backend logic)
const calculatePriceWithDistance = (basePrice: number, distanceKm: number): number => {
  const distanceCharge = distanceKm * 4.7;
  return Math.round((basePrice + distanceCharge) * 100) / 100;
};

interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export default function BookingForm() {
  const { token } = useAuthStore();
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [serviceType, setServiceType] = useState('ROUTINE_INSPECTION');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proximityWarning, setProximityWarning] = useState<string | null>(null);
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

  const handleLocationSelect = async (location: LocationData) => {
    setLocationData(location);
    setProximityWarning(null);

    // Calculate distance from base
    try {
      setCalculatingDistance(true);
      const response = await axios.post(
        `${API_URL}/api/bookings/calculate-distance`,
        {
          longitude: location.longitude,
          latitude: location.latitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const calculatedDistance = response.data.distance;
      setDistance(calculatedDistance);

      // Check proximity constraint if there's already a booking on the selected date
      if (selectedSlot) {
        const slot = availableSlots.find(s => s.id === selectedSlot);
        if (slot && slot.bookings && slot.bookings.length === 1) {
          const existingBooking = slot.bookings[0];
          if (existingBooking.latitude && existingBooking.longitude) {
            // Calculate distance between bookings (simple haversine)
            const distanceBetween = calculateDistanceBetweenPoints(
              existingBooking.longitude,
              existingBooking.latitude,
              location.longitude,
              location.latitude
            );

            if (distanceBetween > 20) {
              setProximityWarning(
                `Warning: Your location is ${distanceBetween.toFixed(2)}km from the existing booking. Bookings must be within 20km of each other on the same day.`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setError('Failed to calculate distance. Please try again.');
    } finally {
      setCalculatingDistance(false);
    }
  };

  const calculateDistanceBetweenPoints = (
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number
  ): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
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

    if (!locationData) {
      setError('Please select a service address');
      return;
    }

    if (distance === null) {
      setError('Distance calculation is in progress. Please wait.');
      return;
    }

    if (proximityWarning) {
      setError(proximityWarning);
      return;
    }

    setLoading(true);

    try {
      const response = await bookingAPI.createBooking({
        slotId: selectedSlot,
        serviceType,
        address: locationData.formattedAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        distanceFromBase: distance,
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
  const totalPrice = selectedService && distance !== null
    ? calculatePriceWithDistance(selectedService.price, distance)
    : selectedService?.price || 0;

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
                    <span className="text-solar-blue font-bold">From R{service.price}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Address
                </label>
                <AddressSearchMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={undefined}
                />
                {calculatingDistance && (
                  <p className="mt-2 text-sm text-blue-600">
                    📍 Calculating distance from base...
                  </p>
                )}
                {distance !== null && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm">
                      <strong>Selected:</strong> {locationData?.formattedAddress}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Distance from base:</strong> {distance.toFixed(2)} km
                    </p>
                    {distance > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Distance charge: R{(distance * 4.7).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                {proximityWarning && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ⚠️ {proximityWarning}
                  </div>
                )}
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
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span>Base Service Fee:</span>
                <span>R{selectedService?.price}</span>
              </div>
              {distance !== null && distance > 0 && (
                <div className="flex justify-between items-center text-sm text-blue-600">
                  <span>Distance Charge ({distance.toFixed(2)} km × R4.7):</span>
                  <span>R{(distance * 4.7).toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount:</span>
                <span className="text-3xl font-bold text-solar-blue">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mb-4">
              <p>Distance-based pricing: R4.7 per kilometer</p>
            </div>
            <button
              type="submit"
              disabled={loading || !selectedSlot || !locationData || distance === null || proximityWarning !== null}
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
