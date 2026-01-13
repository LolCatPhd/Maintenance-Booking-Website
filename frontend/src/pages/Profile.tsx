import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import AddressSearchMap from '../components/AddressSearchMap';

interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showLocationEdit, setShowLocationEdit] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const data = response.data;
      setProfileData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
        formattedAddress: data.formattedAddress,
        streetAddress: data.streetAddress,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
      });

      // Set initial location data if exists
      if (data.latitude && data.longitude) {
        setLocationData({
          latitude: data.latitude,
          longitude: data.longitude,
          formattedAddress: data.formattedAddress || '',
          streetAddress: data.streetAddress || undefined,
          city: data.city || undefined,
          province: data.province || undefined,
          postalCode: data.postalCode || undefined,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      };

      // Include location data if available
      if (locationData) {
        updateData.latitude = locationData.latitude;
        updateData.longitude = locationData.longitude;
        updateData.formattedAddress = locationData.formattedAddress;
        updateData.streetAddress = locationData.streetAddress;
        updateData.city = locationData.city;
        updateData.province = locationData.province;
        updateData.postalCode = locationData.postalCode;
      }

      const response = await userAPI.updateProfile(updateData);

      // Update auth store with new user data
      setUser({
        ...user!,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setShowLocationEdit(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, firstName: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location Information Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Location</h2>
              <button
                type="button"
                onClick={() => setShowLocationEdit(!showLocationEdit)}
                className="text-solar-blue hover:text-blue-700 font-semibold"
              >
                {showLocationEdit ? 'Cancel' : 'Edit Location'}
              </button>
            </div>

            {profileData.formattedAddress && !showLocationEdit ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-solar-blue mt-1"
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
                  <div>
                    <p className="font-medium text-gray-900">
                      {profileData.formattedAddress}
                    </p>
                    {profileData.city && profileData.province && (
                      <p className="text-sm text-gray-600 mt-1">
                        {profileData.city}, {profileData.province}
                        {profileData.postalCode && ` ${profileData.postalCode}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : !showLocationEdit ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800">
                  No location set. Click "Edit Location" to add your address.
                </p>
              </div>
            ) : null}

            {showLocationEdit && (
              <div className="mt-4">
                <AddressSearchMap
                  onLocationSelect={setLocationData}
                  initialLocation={
                    profileData.latitude && profileData.longitude
                      ? {
                          latitude: profileData.latitude,
                          longitude: profileData.longitude,
                          formattedAddress: profileData.formattedAddress || '',
                        }
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
