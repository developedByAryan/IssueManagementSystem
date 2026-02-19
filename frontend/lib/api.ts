import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants';
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        try {
            if ((error.response.status === 401) && !originalRequest._retry) {
                originalRequest._retry = true

                const refreshToken = localStorage.getItem(REFRESH_TOKEN)
                const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/refresh?token=${refreshToken}`)
                const { access_token } = response.data
                localStorage.setItem(ACCESS_TOKEN, access_token)
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`
                return api(originalRequest)
            }
        } catch (refreshError) {
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            window.location.href = '/'
            return Promise.reject(refreshError)
        }

        return Promise.reject(error)
    },
);

export default api