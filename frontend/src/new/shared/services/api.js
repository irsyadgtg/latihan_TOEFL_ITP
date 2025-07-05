import axios from 'axios';

// Create axios instance dengan base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// Request interceptor - attach token jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error(' Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors properly
api.interceptors.response.use(
  (response) => {
    console.log(` API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(' API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    });

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // CRITICAL: Jangan redirect otomatis untuk error apapun
      // Biarkan komponen yang handle error sendiri
      
      switch (status) {
        case 401:
          // Unauthorized - hanya clear token, jangan redirect
          console.warn('🔓 Unauthorized - clearing stored auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('pengguna');
          localStorage.removeItem('role');
          localStorage.removeItem('idPengguna');
          localStorage.removeItem('name');
          break;
          
        case 403:
          console.warn(' Forbidden - insufficient permissions');
          break;
          
        case 404:
          console.warn(' Resource not found');
          break;
          
        case 422:
          console.warn(' Validation failed:', data.errors);
          break;
          
        case 500:
          console.error(' Server error');
          break;
          
        default:
          console.warn(` HTTP ${status} error:`, data.message);
      }
    } else if (error.request) {
      // Network error
      console.error(' Network error - no response received:', error.message);
    } else {
      // Request setup error
      console.error(' Request setup error:', error.message);
    }

    // PENTING: Return rejected promise agar komponen bisa handle error
    return Promise.reject(error);
  }
);

export default api;