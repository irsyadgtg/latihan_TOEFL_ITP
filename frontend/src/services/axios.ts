// src/services/axios.ts (revisi)
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('AuthToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    console.error('AXIOS INTERCEPTOR - REQUEST Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AXIOS INTERCEPTOR - RESPONSE Error details:', error.response); 

    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.warn('AXIOS INTERCEPTOR - RESPONSE: 401 Unauthorized detected. Starting redirect logic.');
      
      const currentPath = window.location.pathname;
      let redirectTo = '/login'; // Default ke login umum/student

      const userDataString = localStorage.getItem('userData');
      let userRoleFromLocalStorage = ''; // Variabel untuk menyimpan role dari localStorage
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userRoleFromLocalStorage = userData.role; // Dapatkan role
          console.log('AXIOS INTERCEPTOR - User role from localStorage:', userRoleFromLocalStorage);
        } catch (e) {
          console.error("Failed to parse user data from localStorage in interceptor:", e);
        }
      }

      // Prioritas 1: Role dari localStorage
      if (userRoleFromLocalStorage === 'admin') {
        redirectTo = '/admin/login';
      } else if (userRoleFromLocalStorage === 'instructor') {
        redirectTo = '/instructor/login';
      } else if (userRoleFromLocalStorage === 'peserta') {
        redirectTo = '/login';
      } 
      // Prioritas 2: Path saat ini (jika role tidak ditemukan di localStorage)
      else if (currentPath.startsWith('/admin')) {
        redirectTo = '/admin/login';
      } else if (currentPath.startsWith('/instructor')) {
        redirectTo = '/instructor/login';
      }
      
      console.log('AXIOS INTERCEPTOR - Calculated redirect path:', redirectTo);
      console.log('AXIOS INTERCEPTOR - Current path:', window.location.pathname);

      // Hapus token dan data pengguna sebelum redirect
      localStorage.removeItem('AuthToken'); 
      localStorage.removeItem('userData');

      // Hanya redirect jika belum di halaman yang dituju
      if (window.location.pathname !== redirectTo) {
        window.location.href = redirectTo;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;