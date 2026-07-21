import api from '../api/axios';

export const countryService = {
    // Get all countries
    getAll: async () => {
        try {
            const response = await api.get('/country/all');
            console.log('Country API Response:', response.data);

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
            console.error('Error fetching countries:', error);
            return [];
        }
    },

    // Get country by ID
    getById: async (id) => {
        const response = await api.get(`/country/${id}`);
        return response.data.data;
    },

    // Create new country
    create: async (data) => {
        const response = await api.post('/country/create', data);
        return response.data;
    },

    // Update country
    update: async (id, data) => {
        const response = await api.put(`/country/${id}`, data);
        return response.data;
    },

    // Delete country
    delete: async (id) => {
        const response = await api.delete(`/country/${id}`);
        return response.data;
    },
};