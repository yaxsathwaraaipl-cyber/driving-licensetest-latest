import api from '../api/axios';

export const testCategoryService = {
    // Get all test categories
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/test-categories', { params: filters });
            console.log('Test categories response:', response.data);

            if (response.data?.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching test categories:', error);
            return [];
        }
    },

    // Get test category by ID
    getById: async (id) => {
        const response = await api.get(`/test-categories/${id}`);
        return response.data.data;
    },

    // Create test category
    create: async (data) => {
        const response = await api.post('/test-categories', data);
        return response.data;
    },

    // Update test category
    update: async (id, data) => {
        const response = await api.put(`/test-categories/${id}`, data);
        return response.data;
    },

    // Delete test category
    delete: async (id) => {
        const response = await api.delete(`/test-categories/${id}`);
        return response.data;
    },
};