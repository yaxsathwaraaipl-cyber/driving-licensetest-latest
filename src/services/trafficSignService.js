import api from '../api/axios';

export const trafficSignService = {
    // Get all traffic signs
    getAll: async (filters = {}) => {
        try {
            console.log('Fetching traffic signs with filters:', filters);
            const response = await api.get('/traffic-sign/all', { params: filters });
            console.log('Traffic signs response:', response.data);

            if (response.data?.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching traffic signs:', error);
            return [];
        }
    },

    // Get traffic signs by province
    getByProvince: async (provinceId) => {
        try {
            const response = await api.get(`/traffic-sign/province/${provinceId}`);
            console.log('Traffic signs by province response:', response.data);

            if (response.data?.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching traffic signs by province:', error);
            return [];
        }
    },

    // Get traffic sign by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/traffic-sign/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching traffic sign:', error);
            throw error;
        }
    },

    // Create traffic sign
    create: async (data) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('categoryId', data.categoryId);

            // Send provinceIds as JSON array string
            const provinceIds = Array.isArray(data.provinceIds) ? data.provinceIds : [];
            const validProvinceIds = provinceIds.filter(id => id && id.trim() !== '');
            formData.append('provinceIds', JSON.stringify(validProvinceIds));

            if (data.image) {
                formData.append('image', data.image);
            }

            console.log('Sending FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.post('/traffic-sign/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating traffic sign:', error);
            throw error;
        }
    },

    // Update traffic sign
    update: async (id, data) => {
        try {
            const formData = new FormData();
            if (data.title) formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            if (data.categoryId) formData.append('categoryId', data.categoryId);

            if (data.provinceIds) {
                const provinceIds = Array.isArray(data.provinceIds) ? data.provinceIds : [];
                const validProvinceIds = provinceIds.filter(id => id && id.trim() !== '');
                formData.append('provinceIds', JSON.stringify(validProvinceIds));
            }

            if (data.image) formData.append('image', data.image);

            console.log('Updating with FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.put(`/traffic-sign/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating traffic sign:', error);
            throw error;
        }
    },

    // Delete traffic sign
    delete: async (id) => {
        try {
            const response = await api.delete(`/traffic-sign/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting traffic sign:', error);
            throw error;
        }
    },

    // Toggle active status
    toggleStatus: async (id) => {
        try {
            const response = await api.patch(`/traffic-sign/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling traffic sign status:', error);
            throw error;
        }
    },
};