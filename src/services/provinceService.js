import api from '../api/axios';

export const provinceService = {
    // Get all provinces
    getAll: async () => {
        try {
            const response = await api.get('/province/all');
            console.log('Province API Response:', response.data);

            if (response.data?.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching provinces:', error);
            return [];
        }
    },

    // Get province by ID
    getById: async (id) => {
        const response = await api.get(`/province/${id}`);
        return response.data.data;
    },

    // Get provinces by country
    getByCountry: async (countryId) => {
        try {
            const response = await api.get(`/province/country/${countryId}`);
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Error fetching provinces by country:', error);
            return [];
        }
    },

    // ✅ Create new province - uses country_id (snake_case)
    create: async (data) => {
        console.log('📤 provinceService.create received:', data);

        // If data is FormData, send as is
        if (data instanceof FormData) {
            console.log('📤 Sending as FormData');
            const response = await api.post('/province/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        // If data is plain object, convert to use country_id
        const submitData = {
            name: data.name,
            description: data.description || '',
            country_id: data.country_id || data.countryId, // Use country_id
        };

        // Add image if present
        if (data.image) {
            // If there's an image, we should use FormData
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('country_id', data.country_id || data.countryId);
            formData.append('image', data.image);

            console.log('📤 Sending as FormData with country_id:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.post('/province/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        console.log('📤 Sending as JSON with country_id:', submitData);
        const response = await api.post('/province/create', submitData);
        return response.data;
    },

    // ✅ Update province - uses country_id (snake_case)
    update: async (id, data) => {
        console.log('📤 provinceService.update received:', { id, data });

        // If data is FormData, send as is
        if (data instanceof FormData) {
            console.log('📤 Sending as FormData');
            const response = await api.put(`/province/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        // If data is plain object, convert to use country_id
        const submitData = {
            name: data.name,
            description: data.description || '',
            country_id: data.country_id || data.countryId, // Use country_id
        };

        // Add image if present
        if (data.image) {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('country_id', data.country_id || data.countryId);
            formData.append('image', data.image);

            console.log('📤 Sending as FormData with country_id:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.put(`/province/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        console.log('📤 Sending as JSON with country_id:', submitData);
        const response = await api.put(`/province/${id}`, submitData);
        return response.data;
    },

    // Delete province
    delete: async (id) => {
        const response = await api.delete(`/province/${id}`);
        return response.data;
    },
};