import api from '../api/axios';

export const testService = {
    // ====== TEST CRUD ======

    // Create test
    create: async (data) => {
        try {
            console.log('📤 Creating test with data:', JSON.stringify(data, null, 2));
            const response = await api.post('/tests', data);
            console.log('📥 Create test response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating test:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    // Get all tests
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/tests', { params: filters });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching tests:', error);
            return [];
        }
    },

    // Get test by ID
    getById: async (id) => {
        const response = await api.get(`/tests/${id}`);
        return response.data.data;
    },

    // Create test
    create: async (data) => {
        const response = await api.post('/tests', data);
        return response.data;
    },

    // Update test
    update: async (id, data) => {
        const response = await api.put(`/tests/${id}`, data);
        return response.data;
    },

    // Delete test
    delete: async (id) => {
        const response = await api.delete(`/tests/${id}`);
        return response.data;
    },

    // ====== TEST ATTEMPTS ======

    // Start test (get questions)
    startTest: async (id) => {
        const response = await api.get(`/tests/${id}/start`);
        return response.data.data;
    },

    // Submit test
    submitTest: async (id, data) => {
        const response = await api.post(`/tests/${id}/submit`, data);
        return response.data;
    },

    // Get test attempt results
    getAttemptResults: async (testId, attemptId) => {
        const response = await api.get(`/tests/${testId}/attempts/${attemptId}`);
        return response.data.data;
    },

    // Get test analytics (admin)
    getAnalytics: async (id) => {
        const response = await api.get(`/tests/${id}/analytics`);
        return response.data.data;
    },
};