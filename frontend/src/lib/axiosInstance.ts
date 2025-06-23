// src/lib/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // GANTI DENGAN URL BACKEND LARAVEL ANDA
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    console.log('Unauthorized request. Clearing token and redirecting to login.');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  }
  return Promise.reject(error);
});

export default axiosInstance;