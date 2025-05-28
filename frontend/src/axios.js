import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // URL backend Laravel
  withCredentials: true, // Enable cookies for Sanctum
});

export default axiosInstance;