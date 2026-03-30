import api from './axios';

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
};

export const tasksService = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const taskLevelsService = {
  getAll: () => api.get('/task-levels'),
  getById: (id: number) => api.get(`/task-levels/${id}`),
  create: (data: any) => api.post('/task-levels', data),
  update: (id: number, data: any) => api.patch(`/task-levels/${id}`, data),
  delete: (id: number) => api.delete(`/task-levels/${id}`),
};

export const usersService = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  assignRoles: (id: number, roleIds: number[]) => api.post(`/users/${id}/roles`, { roleIds }),
  delete: (id: number) => api.delete(`/users/${id}`),
};
