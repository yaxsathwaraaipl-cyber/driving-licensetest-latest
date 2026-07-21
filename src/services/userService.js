import api from '../api/axios';

export const userService = {
    // Get all users
    getAll: async (filters = {}) => {
        try {
            console.log('Fetching users...');
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

            const users = allUsers.filter(user => user.role === 'user');
            console.log('Filtered users:', users);
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    // Get user by ID
    getById: async (id) => {
        const response = await api.get(`/auth/users/${id}`);
        return response.data.data;
    },

    // Get user test results
    getTestResults: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/tests`);
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Error fetching user tests:', error);
            return [];
        }
    },

    // ✅ Create new user
    create: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },

    // Update user
    update: async (id, userData) => {
        const response = await api.put(`/auth/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    delete: async (id) => {
        const response = await api.delete(`/auth/users/${id}`);
        return response.data;
    },

    // Toggle user status
    toggleStatus: async (id) => {
        const response = await api.patch(`/auth/users/${id}/toggle-status`);
        return response.data;
    },

    // Get user stats
    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    },

    // Get recent activity
    getRecentActivity: async () => {
        const response = await api.get('/users/recent-activity');
        return response.data;
    },

    // Get recommended tests
    getRecommendedTests: async () => {
        const response = await api.get('/users/recommended-tests');
        return response.data;
    },
};