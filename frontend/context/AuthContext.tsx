"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/constants';

interface User {
    id: number;
    email: string;
    is_active: boolean;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (fullname: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN)

            if (token) {
                try {
                    const { data } = await api.get('/api/v1/users/me');
                    setUser(data)
                } catch (error) {
                    console.log("Err fetching the user data", error)
                    localStorage.removeItem(ACCESS_TOKEN)
                }
            }
            setIsLoading(false)
        }
        loadUser()
    }, [])

    const login = async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        const { data } = await axios.post('http://localhost:8000/api/v1/auth/login',
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        toast.success("User was successfully logged in!")
        localStorage.setItem(ACCESS_TOKEN, data.access_token);
        localStorage.setItem(REFRESH_TOKEN, data.refresh_token);

        const userResponse = await api.get('/api/v1/users/me');
        setUser(userResponse.data);

        router.push('/dashboard');
    };

    //  The Smart Register Function
    const register = async (full_name: string, email: string, password: string) => {
        // Step 1: Create the account
        const res = await axios.post('http://localhost:8000/api/v1/auth/register', { email, password, full_name });
        const { id } = res.data
        if (id) {
            // Step 2: Auto-Login (The Combo Move)
            // We reuse the login function so we don't rewrite code
            await login(email, password);
        } else {
            toast.error("User could not be registered!")
        }
    };
    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        setUser(null)
        router.push('/dashboard')
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}