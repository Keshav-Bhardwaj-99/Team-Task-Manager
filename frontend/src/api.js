import axios from 'axios';

// Bhai ye hamara live backend ka link hai
const API_URL = 'https://team-task-manager-production-9f23.up.railway.app';

const api = axios.create({
    baseURL: API_URL
});

// Har request mein token apne aap chala jaye uske liye interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
