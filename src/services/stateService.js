import api from '../api/axios';

export const stateService = {
    getAll: async () => {
        const response = await api.get('/states');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/states/${id}`);
        return response.data;
    },

    create: async (stateData) => {
        const response = await api.post('/states', stateData);
        return response.data;
    },

    update: async (id, stateData) => {
        const response = await api.put(`/states/${id}`, stateData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/states/${id}`);
        return response.data;
    },
};