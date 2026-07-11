import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  uploadAvatar: (data) => api.post('/auth/avatar', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  logout: () => api.post('/auth/logout'),
  getAllUsers: (params) => api.get('/auth/users', { params }),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/auth/users/${id}/status`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};