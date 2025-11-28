import axios from 'axios';

// Auto-detect environment and use appropriate API URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hrms-fullstack-1-lar5.onrender.com/api'  // Production
  : 'http://localhost:10000/api';  // Development

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const employeeAPI = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const teamAPI = {
  getAll: () => api.get('/teams'),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  assignEmployee: (teamId, employeeId) => api.post(`/teams/${teamId}/assign`, { employee_id: employeeId }),
  removeEmployee: (teamId, employeeId) => api.post(`/teams/${teamId}/remove`, { employee_id: employeeId }),
};

export const logAPI = {
  getAll: () => api.get('/logs'),
};

export default api;