import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
