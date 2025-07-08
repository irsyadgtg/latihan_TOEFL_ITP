import axios from 'axios';

const api = axios.create({
    baseURL: 'https://lactoeflitp.my.id/api', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;