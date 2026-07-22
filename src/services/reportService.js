// import api from '../api/axios';

// export const reportService = {
//     getDashboardStats: async () => {
//         const response = await api.get('/reports/dashboard');
//         return response.data;
//     },

//     getUserAnalytics: async () => {
//         const response = await api.get('/reports/users');
//         return response.data;
//     },

//     getQuestionAnalytics: async () => {
//         const response = await api.get('/reports/questions');
//         return response.data;
//     },
// };


// src/services/reportService.js
import api from '../api/axios';

export const reportService = {
    getDashboardStats: async () => {
        try {
            const response = await api.get('/reports/dashboard');
            return response.data;
        } catch (error) {
            console.warn('Dashboard stats endpoint not available, using fallback');
            // Return empty data structure
            return {
                totalUsers: 0,
                totalQuestions: 0,
                totalCategories: 0,
                recentUsers: [],
                recentQuestions: [],
                testStats: { averageScore: 0, passed: 0 }
            };
        }
    },

    getUserAnalytics: async () => {
        try {
            const response = await api.get('/reports/users');
            return response.data;
        } catch (error) {
            console.warn('User analytics endpoint not available');
            return { byRole: [] };
        }
    },

    getQuestionAnalytics: async () => {
        try {
            const response = await api.get('/reports/questions');
            return response.data;
        } catch (error) {
            console.warn('Question analytics endpoint not available');
            return { byCategory: [] };
        }
    },
};