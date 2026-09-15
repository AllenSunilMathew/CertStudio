import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export const statsApi = {
  get: () => api.get('/stats'),
};

export const certTypesApi = {
  list: () => api.get('/certificate-types'),
  get: (id) => api.get(`/certificate-types/${id}`),
  create: (data) => api.post('/certificate-types', data),
  update: (id, data) => api.put(`/certificate-types/${id}`, data),
  delete: (id) => api.delete(`/certificate-types/${id}`),
  uploadTemplate: (id, file) => {
    const formData = new FormData();
    formData.append('template', file);
    return api.post(`/certificate-types/${id}/template`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const excelApi = {
  parse: (file) => {
    const formData = new FormData();
    formData.append('excel', file);
    return api.post('/excel/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  extractColumn: (file, columnIndex) => {
    const formData = new FormData();
    formData.append('excel', file);
    formData.append('columnIndex', columnIndex);
    return api.post('/excel/extract-column', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const generateApi = {
  generate: (certificateTypeId, names) =>
    api.post('/generate', { certificateTypeId, names }),
};

export const historyApi = {
  list: (params) => api.get('/history', { params }),
  get: (id) => api.get(`/history/${id}`),
};

export default api;
