import api from '../api/axios';

export const practiceTestService = {
    // ====== PRACTICE TEST CRUD ======

    // Get all practice tests
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/practice-tests', { params: filters });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching practice tests:', error);
            return [];
        }
    },

    // Get practice test by ID
    getById: async (id) => {
        const response = await api.get(`/practice-tests/${id}`);
        return response.data.data;
    },

    // Create practice test
    create: async (data) => {
        const response = await api.post('/practice-tests', data);
        return response.data;
    },

    // Update practice test
    update: async (id, data) => {
        const response = await api.put(`/practice-tests/${id}`, data);
        return response.data;
    },

    // Delete practice test
    delete: async (id) => {
        const response = await api.delete(`/practice-tests/${id}`);
        return response.data;
    },

    // ====== PRACTICE TEST ATTEMPTS ======

    // Start practice test
    startTest: async (id) => {
        const response = await api.get(`/practice-tests/${id}/start`);
        return response.data.data;
    },

    // Submit practice test
    submitTest: async (id, data) => {
        const response = await api.post(`/practice-tests/${id}/submit`, data);
        return response.data;
    },

    // Get practice test attempts
    getAttempts: async (id) => {
        const response = await api.get(`/practice-tests/${id}/attempts`);
        return response.data.data || [];
    },

    // Get specific practice test attempt
    getAttempt: async (practiceTestId, attemptId) => {
        const response = await api.get(`/practice-tests/${practiceTestId}/attempts/${attemptId}`);
        return response.data.data;
    },

    // Get practice test analytics (admin)
    getAnalytics: async (id) => {
        const response = await api.get(`/practice-tests/${id}/analytics`);
        return response.data.data;
    },
};