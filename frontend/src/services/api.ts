import axios from 'axios';

// Ensure baseURL always includes /api path
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;

  // If no env URL, default to /api for local development
  if (!envURL) {
    console.log('[API] No VITE_API_URL set, using default: /api');
    return '/api';
  }

  // If env URL already ends with /api, use as-is
  if (envURL.endsWith('/api')) {
    console.log('[API] VITE_API_URL already ends with /api:', envURL);
    return envURL;
  }

  // If env URL is a full URL without /api, append it
  if (envURL.startsWith('http://') || envURL.startsWith('https://')) {
    const baseURL = `${envURL}/api`;
    console.log('[API] Appending /api to URL:', envURL, '→', baseURL);
    return baseURL;
  }

  // Otherwise use as-is (covers cases like '/api' or relative paths)
  console.log('[API] Using VITE_API_URL as-is:', envURL);
  return envURL;
};

const baseURL = getBaseURL();
console.log('[API] Final baseURL configured:', baseURL);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export const bookingAPI = {
  getAvailableSlots: () => api.get('/bookings/available-slots'),
  getBookings: () => api.get('/bookings'),
  createBooking: (data: any) => api.post('/bookings', data),
  getBooking: (id: string) => api.get(`/bookings/${id}`),
  cancelBooking: (id: string) => api.patch(`/bookings/${id}/cancel`),
};

export const solarSystemAPI = {
  getSystems: () => api.get('/solar-systems'),
  createSystem: (data: any) => api.post('/solar-systems', data),
  getSystem: (id: string) => api.get(`/solar-systems/${id}`),
  addComponent: (systemId: string, data: any) =>
    api.post(`/solar-systems/${systemId}/components`, data),
};

export const paymentAPI = {
  createPayment: (bookingId: string, paymentMethod: string) =>
    api.post('/payments/create-payment', { bookingId, paymentMethod }),
  confirmPayment: (bookingId: string, transactionRef?: string) =>
    api.post('/payments/confirm', { bookingId, transactionRef }),
  checkPaymentStatus: (paymentId: string) =>
    api.get(`/payments/check-status/${paymentId}`),
  getPaymentHistory: () => api.get('/payments/history'),
};

export const adminAPI = {
  getBookings: () => api.get('/admin/bookings'),
  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/admin/bookings/${id}/status`, { status }),
  getSlots: () => api.get('/admin/slots'),
  createSlot: (data: any) => api.post('/admin/slots', data),
  createBulkSlots: (data: any) => api.post('/admin/slots/bulk', data),
  updateSlot: (id: string, data: any) => api.patch(`/admin/slots/${id}`, data),
  deleteSlot: (id: string) => api.delete(`/admin/slots/${id}`),
  updateMaintenance: (bookingId: string, data: any) =>
    api.post(`/admin/bookings/${bookingId}/maintenance`, data),
  getStats: () => api.get('/admin/stats'),
};

export default api;
