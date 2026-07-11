import api from './axios';

export const boardAPI = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  addMember: (id, userId, role) => api.post(`/boards/${id}/members`, { userId, role }),
  removeMember: (id, userId) => api.delete(`/boards/${id}/members/${userId}`),
  getTasks: (id) => api.get(`/boards/${id}/tasks`),
};