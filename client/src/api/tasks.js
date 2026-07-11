import api from './axios';

export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getByStatus: () => api.get('/tasks/board'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  // ✅ Correct API call for position - using the specific route
  updatePosition: (data) => api.put('/tasks/position', data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  uploadAttachment: (id, data) => api.post(`/tasks/${id}/attachments`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  assign: (id, assignedTo) => api.put(`/tasks/${id}/assign`, { assignedTo }),
};