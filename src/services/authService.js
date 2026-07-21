import api from '../api/axios';

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh-token');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    },

    getUsers: async (role = null) => {
        try {
            const params = role ? { role } : {};
            console.log('Fetching users with params:', params);
            const response = await api.get('/auth/users', { params });
            console.log('Auth users response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in getUsers:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        const response = await api.get(`/auth/users/${id}`);
        return response.data;
    },

    getUserTests: async (userId) => {
        const response = await api.get(`/auth/users/${userId}/tests`);
        return response.data;
    },

    updateUser: async (id, data) => {
        console.log('Updating user:', id, data);
        if (data instanceof FormData) {
            const response = await api.put(`/auth/users/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
        const response = await api.put(`/auth/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/auth/users/${id}`);
        return response.data;
    },

    toggleUserStatus: async (id) => {
        const response = await api.patch(`/auth/users/${id}/toggle-status`);
        return response.data;
    },
};