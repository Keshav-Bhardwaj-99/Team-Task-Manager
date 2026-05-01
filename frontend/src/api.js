import axios from 'axios';

// Bhai jab deploy karoge, toh ye URL live wale backend se replace kar dena
const API_URL = 'http://127.0.0.1:8000';

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
