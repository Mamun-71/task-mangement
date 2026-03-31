import api from './axios';

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
};

export interface TaskFilters {
  startDate?: string;
  endDate?: string;
  taskLevelId?: number;
  status?: string;
}

export const tasksService = {
  getAll: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.taskLevelId) params.append('taskLevelId', filters.taskLevelId.toString());
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get(`/tasks${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  getAnalytics: (period: 'weekly' | 'monthly') => api.get(`/tasks/analytics/${period}`),
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
