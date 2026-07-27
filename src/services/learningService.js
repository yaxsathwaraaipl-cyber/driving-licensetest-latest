// services/learningService.js
import api from '../api/axios';

export const learningService = {
    // Get learning questions by province ID
    getLearningQuestions: async (provinceId) => {
        try {
            const response = await api.get(`/question-banks/learning/province/${provinceId}`);
            console.log('Learning Questions Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching learning questions:', error);
            throw error;
        }
    },

    // Get specific question bank details
    getBankDetails: async (bankId) => {
        try {
            const response = await api.get(`/question-banks/${bankId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bank details:', error);
            throw error;
        }
    },

    // Get questions by category
    getQuestionsByCategory: async (categoryId) => {
        try {
            const response = await api.get(`/question-banks/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching questions by category:', error);
            throw error;
        }
    }
};