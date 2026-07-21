import api from '../api/axios';

export const categoryService = {
    // Get all traffic categories
    getAll: async () => {
        try {
            const response = await api.get('/categories/all');
            console.log('Category API Response:', response.data);

            // Handle different response structures
            if (response.data?.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // Get category by ID
    getById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data.data;
    },

    // Create new category
    create: async (data) => {
        const response = await api.post('/categories/create', data);
        return response.data;
    },

    // Update category
    update: async (id, data) => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },

    // Delete category
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};