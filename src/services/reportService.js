import api from '../api/axios';

export const reportService = {
    getDashboardStats: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    },

    getUserAnalytics: async () => {
        const response = await api.get('/reports/users');
        return response.data;
    },

    getQuestionAnalytics: async () => {
        const response = await api.get('/reports/questions');
        return response.data;
    },
};