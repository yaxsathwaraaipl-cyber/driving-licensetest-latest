// // src/services/stateService.js
// import api from '../api/axios';

// // This service now proxies to the province endpoints.
// export const stateService = {
//   // GET /province/all
//   getAll: async () => {
//     try {
//       const response = await api.get('/province/all');
//       let provinces = response.data?.data || response.data || [];
//       // Map province to the shape expected by StatesPage
//       return provinces.map(p => ({
//         id: p._id || p.id,
//         name: p.name || 'Unnamed',
//         code: p.code || p.name?.substring(0, 2).toUpperCase() || '--',
//         questionsCount: p.questionsCount || 0,
//         // Include countryId if available (from province's country_id)
//         countryId: p.country_id?._id || p.country_id?.id || p.countryId || '',
//         // Keep original data if needed
//         ...p
//       }));
//     } catch (error) {
//       console.error('Error fetching provinces:', error);
//       return [];
//     }
//   },

//   // GET /province/:id
//   getById: async (id) => {
//     const response = await api.get(`/province/${id}`);
//     const province = response.data?.data || response.data;
//     return {
//       id: province._id || province.id,
//       name: province.name,
//       code: province.code || province.name?.substring(0, 2).toUpperCase(),
//       questionsCount: province.questionsCount || 0,
//       countryId: province.country_id?._id || province.country_id?.id || province.countryId || '',
//       ...province
//     };
//   },

//   // POST /province/create
//   create: async (data) => {
//     const payload = {
//       name: data.name,
//       description: data.description || '',
//       country_id: data.countryId, // Maps to backend field
//     };
//     const response = await api.post('/province/create', payload);
//     return response.data;
//   },

//   // PUT /province/:id
//   update: async (id, data) => {
//     const payload = {
//       name: data.name,
//       description: data.description || '',
//       country_id: data.countryId,
//     };
//     const response = await api.put(`/province/${id}`, payload);
//     return response.data;
//   },

//   // DELETE /province/:id
//   delete: async (id) => {
//     const response = await api.delete(`/province/${id}`);
//     return response.data;
//   },
// };
// // import api from '../api/axios';

// // export const stateService = {
// //     getAll: async () => {
// //         const response = await api.get('/states');
// //         return response.data;
// //     },

// //     getById: async (id) => {
// //         const response = await api.get(`/states/${id}`);
// //         return response.data;
// //     },

// //     create: async (stateData) => {
// //         const response = await api.post('/states', stateData);
// //         return response.data;
// //     },

// //     update: async (id, stateData) => {
// //         const response = await api.put(`/states/${id}`, stateData);
// //         return response.data;
// //     },

// //     delete: async (id) => {
// //         const response = await api.delete(`/states/${id}`);
// //         return response.data;
// //     },
// // };



// src/services/stateService.js
import api from '../api/axios';

export const stateService = {
    getAll: async () => {
        try {
            const response = await api.get('/province/all');
            const provinces = response.data?.data || response.data || [];
            return provinces.map(p => ({
                id: p._id || p.id,
                name: p.name || 'Unnamed',
                code: p.code || p.name?.substring(0, 2).toUpperCase() || '--',
                questionsCount: p.questionsCount || 0,
                countryId: p.country_id?._id || p.country_id?.id || p.countryId || '',
                ...p,
            }));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            return [];
        }
    },

    getById: async (id) => {
        const response = await api.get(`/province/${id}`);
        const province = response.data?.data || response.data;
        return {
            id: province._id || province.id,
            name: province.name,
            code: province.code || province.name?.substring(0, 2).toUpperCase(),
            questionsCount: province.questionsCount || 0,
            countryId: province.country_id?._id || province.country_id?.id || province.countryId || '',
            ...province,
        };
    },

    create: async (data) => {
        const payload = {
            name: data.name,
            description: data.description || '',
            country_id: data.countryId,
        };
        const response = await api.post('/province/create', payload);
        return response.data;
    },

    update: async (id, data) => {
        const payload = {
            name: data.name,
            description: data.description || '',
            country_id: data.countryId,
        };
        const response = await api.put(`/province/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/province/${id}`);
        return response.data;
    },
};