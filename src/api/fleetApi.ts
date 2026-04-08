/**
 * Axios instance for Pyolliv Fleet API.
 * Handles JWT auth, automatic token refresh, and role-based base paths.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://travel-frontend-zpov.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access_token');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// ── Response interceptor: handle 401 → refresh token ─────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
};

// ── Admin: Vehicles ───────────────────────────────────────────────────────────
export const vehicleApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/vehicles/', { params }),
  dropdown: () => api.get('/admin/vehicles/dropdown/'),
  create: (data: FormData | Record<string, any>) => api.post('/admin/vehicles/', data, { headers: { 'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json' } }),
  get: (id: string) => api.get(`/admin/vehicles/${id}/`),
  update: (id: string, data: FormData | Record<string, any>) => api.patch(`/admin/vehicles/${id}/`, data, { headers: { 'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json' } }),
  delete: (id: string) => api.delete(`/admin/vehicles/${id}/`),
};

// ── Admin: Drivers ────────────────────────────────────────────────────────────
export const driverApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/drivers/', { params }),
  available: () => api.get('/admin/drivers/available/'),
  create: (data: FormData | Record<string, any>) => api.post('/admin/drivers/', data, { headers: { 'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json' } }),
  get: (id: string) => api.get(`/admin/drivers/${id}/`),
  update: (id: string, data: unknown) => api.patch(`/admin/drivers/${id}/`, data),
  delete: (id: string) => api.delete(`/admin/drivers/${id}/`),
  logs: (params?: Record<string, unknown>) => api.get('/admin/driver-logs/', { params }),
  toggleAttendance: (id: string, is_logged_in: boolean) => api.patch(`/admin/drivers/${id}/attendance/`, { is_logged_in }),
};

// ── Admin: Customers ──────────────────────────────────────────────────────────
export const customerApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/customers/', { params }),
  create: (data: unknown) => api.post('/admin/customers/', data),
  get: (id: string) => api.get(`/admin/customers/${id}/`),
  autofill: (customerId: string) => api.get(`/admin/customers/autofill/${customerId}/`),
  update: (id: string, data: unknown) => api.patch(`/admin/customers/${id}/`, data),
};

// ── Admin: Bookings ───────────────────────────────────────────────────────────
export interface AdminBookingListResponse {
  count: number;
  results: any[];
}
export const bookingApi = {
  list: (params?: Record<string, unknown>) => api.get<AdminBookingListResponse>('/admin/bookings/', { params }),
  pending: () => api.get('/admin/bookings/pending/'),
  create: (data: unknown) => api.post('/admin/bookings/', data),
  get: (id: string) => api.get(`/admin/bookings/${id}/`),
  assign: (id: string, data: unknown) => api.patch(`/admin/bookings/${id}/assign/`, data),
  update: (id: string, data: unknown) => api.patch(`/admin/bookings/${id}/`, data),
};

// ── Admin: Commissions ────────────────────────────────────────────────────────
export const commissionApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/commissions/', { params }),
  defaults: () => api.get('/admin/commissions/defaults/'),
  updateDefaults: (data: unknown) => api.patch('/admin/commissions/defaults/', data),
};

// ── Admin: Trips ──────────────────────────────────────────────────────────────
export const tripAdminApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/trips/', { params }),
};

// ── Admin: Analytics ──────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/admin/analytics/dashboard/'),
  monthly: (year?: number) => api.get('/admin/analytics/monthly/', { params: year ? { year } : {} }),
  yearly: () => api.get('/admin/analytics/yearly/'),
};

// ── Car Panel ─────────────────────────────────────────────────────────────────
export const carPanelApi = {
  profile: () => api.get('/car/profile/'),
  trips: () => api.get('/car/trips/'),
  updateKm: (tripId: string, data: { start_km?: number; end_km?: number }) =>
    api.patch(`/car/trips/${tripId}/km/`, data),
  commissions: () => api.get('/car/commissions/'),
};

// ── Driver Panel ──────────────────────────────────────────────────────────────
export const driverPanelApi = {
  profile: () => api.get('/driver/profile/'),
  tasks: () => api.get('/driver/tasks/'),
  startTrip: (tripId: string, start_km: string, photo?: File) => {
    const formData = new FormData();
    formData.append('start_km', start_km);
    if (photo) formData.append('start_photo', photo);
    return api.patch(`/driver/tasks/${tripId}/start/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  endTrip: (tripId: string, end_km: string) =>
    api.patch(`/driver/tasks/${tripId}/end/`, { end_km }),
  commissions: () => api.get('/driver/commissions/'),
};

// Aliases for unified imports used in pages
export const adminApi = {
  listDrivers: driverApi.list,
  listVehicles: vehicleApi.list,
  listBookings: bookingApi.list,
  assignBooking: bookingApi.assign,
  createBooking: bookingApi.create,
};
export const carApi = carPanelApi;
export const driverApiEndpoints = driverPanelApi;
