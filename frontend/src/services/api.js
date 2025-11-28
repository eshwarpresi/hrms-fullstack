import axios from 'axios';

// Use environment variable for API URL, fallback to deployed backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hrms-fullstack-gd0z.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('organisation');
      window.location.href = '/login';
    }
    
    if (error.code === 'ECONNABORTED') {
      alert('Request timeout - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const teamAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  assignEmployee: (teamId, employeeId) => api.post(`/teams/${teamId}/assign`, { employee_id: employeeId }),
  removeEmployee: (teamId, employeeId) => api.post(`/teams/${teamId}/remove`, { employee_id: employeeId }),
};

export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
};

export default api;