// store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            error: null,
            isLoading: false,
            isAuthenticated: false,

            login: async (loginData) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await api.post('/auth/login', loginData);
                    const { success, token, data } = response.data;

                    if (success && token && data) {
                        const userData = {
                            ...data,
                            role: data.role === 'superadmin' ? 'super_admin' : data.role
                        };

                        console.log('Login user data:', userData);

                        set({
                            user: userData,
                            token: token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });

                        localStorage.setItem('token', token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                        return userData;
                    } else {
                        throw new Error('Login failed: Invalid response');
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            signup: async (userData) => {
                try {
                    set({ isLoading: true, error: null });

                    console.log('Signup data being sent to API:', userData);

                    const response = await api.post('/auth/signup', userData);
                    const { success, message, data } = response.data;

                    console.log('Signup response:', response.data);

                    if (success) {
                        set({
                            isLoading: false,
                            error: null,
                        });

                        return { success, message, data };
                    } else {
                        throw new Error(message || 'Registration failed');
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            updateUser: (updatedUser) => {
                console.log('updateUser called with:', updatedUser);
                const currentUser = get().user;

                const userData = {
                    ...updatedUser,
                    role: updatedUser.role === 'superadmin' ? 'super_admin' : updatedUser.role
                };

                if (JSON.stringify(currentUser) !== JSON.stringify(userData)) {
                    set({
                        user: userData,
                        isAuthenticated: true,
                    });
                }
                return userData;
            },

            logout: () => {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);