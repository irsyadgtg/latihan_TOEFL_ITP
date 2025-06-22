// src/axios.ts

import axios from 'axios';

// Buat instance Axios dengan konfigurasi dasar
const axiosInstance = axios.create({
  // Ganti dengan URL base API Laravel Anda
  baseURL: 'http://127.0.0.1:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Penting jika Anda menggunakan session/cookie (misal: Laravel Sanctum)
});

export default axiosInstance;