import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:  (data: { email: string; password: string }) => api.post('/auth/login', data),
  signup: (data: { name: string; email: string; password: string; mobile?: string }) =>
    api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export interface TaskFilters {
  startDate?: string;
  endDate?: string;
  taskLevelId?: number;
  status?: string;
}

export const tasksService = {
  getAll: (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.taskLevelId) params.set('taskLevelId', String(filters.taskLevelId));
    if (filters.status) params.set('status', filters.status);
    const qs = params.toString();
    return api.get(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getById:      (id: number) => api.get(`/tasks/${id}`),
  create:       (data: any)  => api.post('/tasks', data),
  updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  delete:       (id: number) => api.delete(`/tasks/${id}`),
  getAnalytics: (period: 'weekly' | 'monthly') => api.get(`/tasks/analytics/${period}`),
};

// ── Task Levels ───────────────────────────────────────────────────────────────
export const taskLevelsService = {
  getAll:  () => api.get('/task-levels'),
  getById: (id: number) => api.get(`/task-levels/${id}`),
  create:  (data: { title: string; timeMultiplier?: number }) => api.post('/task-levels', data),
  update:  (id: number, data: { title?: string; timeMultiplier?: number }) =>
    api.patch(`/task-levels/${id}`, data),
  delete:  (id: number) => api.delete(`/task-levels/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersService = {
  getAll:      () => api.get('/users'),
  getById:     (id: number) => api.get(`/users/${id}`),
  getMe:       () => api.get('/users/me'),
  update:      (id: number, data: { name?: string; email?: string }) =>
    api.patch(`/users/${id}`, data),
  assignRoles: (id: number, roleIds: number[]) =>
    api.post(`/users/${id}/roles`, { roleIds }),
  delete:      (id: number) => api.delete(`/users/${id}`),
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const rolesService = {
  getAll: () => api.get('/roles'),
};
