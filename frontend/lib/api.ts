import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
})


//Request interceptor, attaches the token to the request header if it exists
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

//Response Interceptor, if we get 400 error, it is going to try and refresh the token and resend the original request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        try {
            if ((error.response.status === 401) && !originalRequest._retry) {
                originalRequest._retry = true

                const refreshToken = localStorage.getItem(REFRESH_TOKEN)
                const response = await axios.put(`http://localhost:8000/api/v1/refresh?token=${refreshToken}`)
                const { access_token } = response.data
                localStorage.setItem(ACCESS_TOKEN, access_token)
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`
                return api(originalRequest)
            }
        } catch (refreshError) {
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            window.location.href = '/login'
            return Promise.reject(refreshError)
        }

        return Promise.reject(error)
    },
);

export default api