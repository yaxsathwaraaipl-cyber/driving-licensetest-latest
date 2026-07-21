// src/services/questionService.js
import api from '../api/axios';

// Warning: This is a stub – the backend may not have direct question endpoints.
// You may need to adapt this to your actual API or use questionBankService instead.
export const questionService = {
  // Fetch all questions (if your API supports it)
  getAll: async (filters = {}) => {
    console.warn('questionService.getAll() is not fully implemented. Using question banks fallback.');
    try {
      // Fallback: fetch all question banks and flatten questions
      const response = await api.get('/question-banks');
      const banks = response.data.data || [];
      let allQuestions = [];
      banks.forEach(bank => {
        if (bank.questions) {
          allQuestions = allQuestions.concat(bank.questions.map(q => ({ ...q, bankId: bank._id })));
        }
      });
      // Apply filters (basic)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        allQuestions = allQuestions.filter(q => q.questionText?.toLowerCase().includes(search));
      }
      if (filters.categoryId) {
        allQuestions = allQuestions.filter(q => q.categoryId === filters.categoryId);
      }
      if (filters.difficulty) {
        allQuestions = allQuestions.filter(q => q.difficulty === filters.difficulty);
      }
      return allQuestions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  getById: async (id) => {
    // Not implemented – you may need to search across banks
    console.warn('questionService.getById() not implemented.');
    return null;
  },

  create: async (data) => {
    // Requires a question bank ID; you may need to adjust the component
    console.warn('questionService.create() not implemented. Use questionBankService instead.');
    throw new Error('Direct question creation is not supported. Please use a question bank.');
  },

  update: async (id, data) => {
    console.warn('questionService.update() not implemented.');
    throw new Error('Direct question update is not supported.');
  },

  delete: async (id) => {
    console.warn('questionService.delete() not implemented.');
    throw new Error('Direct question deletion is not supported.');
  },
};