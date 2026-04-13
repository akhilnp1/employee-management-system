import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          Cookies.set('access_token', data.access, { expires: 1 });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  register: (data: Record<string, string>) =>
    api.post('/auth/register/', data),
  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: FormData | Record<string, unknown>) =>
    api.patch('/auth/profile/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  changePassword: (data: Record<string, string>) =>
    api.post('/auth/change-password/', data),
};

// Employee Forms API
export const formsApi = {
  list: () => api.get('/forms/'),
  active: () => api.get('/forms/active/'),
  get: (id: number) => api.get(`/forms/${id}/`),
  getWithFields: (id: number) => api.get(`/forms/${id}/with_fields/`),
  create: (data: Record<string, unknown>) => api.post('/forms/', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/forms/${id}/`, data),
  delete: (id: number) => api.delete(`/forms/${id}/`),
};

// Employees API
export const employeesApi = {
  list: (params?: Record<string, unknown>) => api.get('/employees/', { params }),
  get: (id: number) => api.get(`/employees/${id}/`),
  create: (data: FormData | Record<string, unknown>) =>
    api.post('/employees/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  update: (id: number, data: FormData | Record<string, unknown>) =>
    api.patch(`/employees/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  delete: (id: number) => api.delete(`/employees/${id}/`),
  stats: () => api.get('/employees/stats/'),
};
