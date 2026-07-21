import api from '../api/axios';
import { authService } from './authService';

export const adminService = {
    // Get all admins (filter by role 'admin')
    getAll: async (filters = {}) => {
        try {
            console.log('Fetching admins directly...');
            // Try without role filter first to see all users
            const response = await api.get('/auth/users');
            console.log('All users response:', response.data);

            let allUsers = [];
            if (response.data?.data) {
                allUsers = response.data.data;
            } else if (Array.isArray(response.data)) {
                allUsers = response.data;
            } else if (response.data?.success && response.data?.data) {
                allUsers = response.data.data;
            }

            // Filter by role 'admin'
            const admins = allUsers.filter(user => user.role === 'admin' || user.role === 'admin');
            console.log('Filtered admins:', admins);
            return admins;
        } catch (error) {
            console.error('Error fetching admins:', error);
            return [];
        }
    },

    getById: async (id) => {
        const response = await authService.getUserById(id);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/auth/signup', {
            ...data,
            role: 'admin'
        });
        return response.data;
    },

    update: async (id, data) => {
        const response = await authService.updateUser(id, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await authService.deleteUser(id);
        return response.data;
    },

    toggleStatus: async (id) => {
        const response = await authService.toggleUserStatus(id);
        return response.data;
    },
};