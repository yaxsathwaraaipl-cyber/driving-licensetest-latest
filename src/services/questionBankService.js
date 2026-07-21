import api from '../api/axios';

export const questionBankService = {
    // ====== QUESTION BANK CRUD ======

    // Get all question banks
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/question-banks', { params: filters });
            if (response.data?.data) return response.data.data;
            if (Array.isArray(response.data)) return response.data;
            if (response.data?.success && response.data?.data) return response.data.data;
            return response.data || [];
        } catch (error) {
            console.error('Error fetching question banks:', error);
            return [];
        }
    },

    // Get question bank by ID with questions
    getById: async (id) => {
        const response = await api.get(`/question-banks/${id}`);
        return response.data.data;
    },

    // Get questions by category (for users - hides correct answers)
    getQuestionsByCategory: async (categoryId) => {
        const response = await api.get(`/question-banks/category/${categoryId}/questions`);
        return response.data.data;
    },

    // Create question bank
    create: async (data) => {
        const response = await api.post('/question-banks', data);
        return response.data;
    },

    // Update question bank
    update: async (id, data) => {
        const response = await api.put(`/question-banks/${id}`, data);
        return response.data;
    },

    // Delete question bank
    delete: async (id) => {
        const response = await api.delete(`/question-banks/${id}`);
        return response.data;
    },

    // ====== QUESTION CRUD ======

    addQuestions: async (bankId, questionsData) => {
        try {
            const { questions, questionImages = [], explanationImages = [] } = questionsData;

            console.log('📤 addQuestions called with:', {
                bankId,
                questionsCount: questions.length,
                questionImagesCount: questionImages.length,
                explanationImagesCount: explanationImages.length
            });

            // Validate data
            if (!questions || questions.length === 0) {
                throw new Error('No questions to add');
            }

            // Check total file size before sending
            let totalSize = 0;
            questionImages.forEach(img => { if (img) totalSize += img.size || 0; });
            explanationImages.forEach(img => { if (img) totalSize += img.size || 0; });

            console.log('📤 Total image size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

            // If total size is too large (> 5MB), warn
            if (totalSize > 5 * 1024 * 1024) {
                console.warn('⚠️ Large file size detected:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
            }

            // If there are no images, send as JSON
            if (questionImages.length === 0 && explanationImages.length === 0) {
                console.log('📤 Sending as JSON (no images)');
                const response = await api.post(`/question-banks/${bankId}/questions`, {
                    questions: questions
                }, {
                    timeout: 30000 // 30 seconds timeout
                });
                return response.data;
            }

            // If there are images, send as FormData with proper timeout
            console.log('📤 Sending as FormData (with images)');
            const formData = new FormData();

            // ✅ Send questions as JSON string
            formData.append('questions', JSON.stringify(questions));

            // Append question images with unique names
            questionImages.forEach((image, index) => {
                if (image && image instanceof File) {
                    // Create a unique filename to avoid conflicts
                    const uniqueName = `question_${Date.now()}_${index}_${image.name}`;
                    formData.append('questionImages', image, uniqueName);
                    console.log(`📤 Adding question image ${index + 1}:`, image.name, `(${(image.size / 1024).toFixed(1)} KB)`);
                }
            });

            // Append explanation images with unique names
            explanationImages.forEach((image, index) => {
                if (image && image instanceof File) {
                    const uniqueName = `explanation_${Date.now()}_${index}_${image.name}`;
                    formData.append('explanationImages', image, uniqueName);
                    console.log(`📤 Adding explanation image ${index + 1}:`, image.name, `(${(image.size / 1024).toFixed(1)} KB)`);
                }
            });

            // Log FormData contents for debugging (but not the full JSON if too large)
            console.log('📤 FormData entries:');
            for (let pair of formData.entries()) {
                const value = pair[1] instanceof File ? `File: ${pair[1].name} (${(pair[1].size / 1024).toFixed(1)} KB)` : pair[1].substring(0, 100) + '...';
                console.log(pair[0] + ': ' + value);
            }

            const response = await api.post(`/question-banks/${bankId}/questions`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 120000, // 2 minutes timeout for large file uploads
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            console.log('📥 Add questions response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error in addQuestions:', error);

            // Handle specific error types
            if (error.code === 'ECONNABORTED') {
                console.error('❌ Request timeout - the server took too long to respond');
                throw new Error('Request timeout. Please try again with fewer questions or smaller images.');
            }

            if (error.response) {
                console.error('❌ Error response:', error.response.data);
                throw new Error(error.response.data?.message || 'Server error occurred');
            } else if (error.request) {
                console.error('❌ No response received from server');
                throw new Error('No response from server. Please check your network connection.');
            } else {
                console.error('❌ Error setting up request:', error.message);
                throw error;
            }
        }
    },


    // Update question
    // Update question
    updateQuestion: async (bankId, questionId, data) => {
        try {
            console.log('📤 updateQuestion called with:', {
                bankId,
                questionId,
                dataKeys: Object.keys(data),
                hasQuestionImage: !!data.questionImage,
                hasExplanationImage: !!data.explanationImage
            });

            const formData = new FormData();

            // Add text fields
            if (data.questionText) formData.append('questionText', data.questionText);
            if (data.explanation) formData.append('explanation', data.explanation);
            if (data.marks !== undefined) formData.append('marks', String(data.marks));
            if (data.options) formData.append('options', JSON.stringify(data.options));

            // Add images if present
            if (data.questionImage && data.questionImage instanceof File) {
                formData.append('questionImage', data.questionImage);
                console.log('📤 Adding question image:', data.questionImage.name);
            }
            if (data.explanationImage && data.explanationImage instanceof File) {
                formData.append('explanationImage', data.explanationImage);
                console.log('📤 Adding explanation image:', data.explanationImage.name);
            }

            // If no files, send as JSON
            if (!data.questionImage && !data.explanationImage) {
                console.log('📤 Sending as JSON (no images)');
                const response = await api.put(`/question-banks/${bankId}/questions/${questionId}`, {
                    questionText: data.questionText,
                    options: data.options,
                    explanation: data.explanation,
                    marks: data.marks
                });
                return response.data;
            }

            // With files, send as FormData
            console.log('📤 Sending as FormData (with images)');
            const response = await api.put(`/question-banks/${bankId}/questions/${questionId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('📥 Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating question:', error);
            if (error.response) {
                console.error('❌ Error response data:', error.response.data);
                console.error('❌ Error response status:', error.response.status);
            }
            throw error;
        }
    },

    // Update question without images (JSON)
    updateQuestionJson: async (bankId, questionId, data) => {
        const response = await api.put(`/question-banks/${bankId}/questions/${questionId}`, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    },

    // Delete question from bank
    deleteQuestion: async (bankId, questionId) => {
        const response = await api.delete(`/question-banks/${bankId}/questions/${questionId}`);
        return response.data;
    },
};