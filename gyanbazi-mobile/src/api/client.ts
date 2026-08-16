import axios from 'axios';
import { auth } from '../config/firebase';

// Use live URL by default, or your local machine IP if testing on a real device
// e.g., 'http://192.168.1.100/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/backend/api/'
export const API_BASE_URL = 'https://nextgeninnovations.com.np/learn/backend/api/'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach Firebase ID Token
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
