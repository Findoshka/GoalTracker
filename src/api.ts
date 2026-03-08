import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (refreshToken)
});

// ── Attach access token from memory ──────────────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}
export function getAccessToken() {
  return _accessToken;
}

api.interceptors.request.use(config => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = api.post<{ accessToken: string }>('/auth/refresh')
            .then(r => { setAccessToken(r.data.accessToken); return r.data.accessToken; })
            .finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export interface UserDTO { id: string; email: string; name: string | null; avatar: string | null }

const REFRESH_KEY = 'rt';

export function saveRefreshToken(token: string) { localStorage.setItem(REFRESH_KEY, token); }
export function loadRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
export function clearRefreshToken() { localStorage.removeItem(REFRESH_KEY); }

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: UserDTO }>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: UserDTO }>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: UserDTO }>('/auth/me'),
  refresh: () => api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken: loadRefreshToken() }),
};

// ─── Goals API ────────────────────────────────────────────────────────────────
export const goalsApi = {
  list: () => api.get('/api/goals'),
  create: (data: object) => api.post('/api/goals', data),
  update: (id: string, data: object) => api.patch(`/api/goals/${id}`, data),
  remove: (id: string) => api.delete(`/api/goals/${id}`),

  addStage: (goalId: string, data: object) => api.post(`/api/goals/${goalId}/stages`, data),
  updateStage: (goalId: string, stageId: string, data: object) => api.patch(`/api/goals/${goalId}/stages/${stageId}`, data),
  removeStage: (goalId: string, stageId: string) => api.delete(`/api/goals/${goalId}/stages/${stageId}`),

  addWeek: (goalId: string, stageId: string, data: object) => api.post(`/api/goals/${goalId}/stages/${stageId}/weeks`, data),
  updateWeek: (goalId: string, stageId: string, weekId: string, data: object) => api.patch(`/api/goals/${goalId}/stages/${stageId}/weeks/${weekId}`, data),
  removeWeek: (goalId: string, stageId: string, weekId: string) => api.delete(`/api/goals/${goalId}/stages/${stageId}/weeks/${weekId}`),

  addTask: (goalId: string, stageId: string, weekId: string, data: object) => api.post(`/api/goals/${goalId}/stages/${stageId}/weeks/${weekId}/tasks`, data),
  updateTask: (goalId: string, stageId: string, weekId: string, taskId: string, data: object) => api.patch(`/api/goals/${goalId}/stages/${stageId}/weeks/${weekId}/tasks/${taskId}`, data),
  removeTask: (goalId: string, stageId: string, weekId: string, taskId: string) => api.delete(`/api/goals/${goalId}/stages/${stageId}/weeks/${weekId}/tasks/${taskId}`),
  moveTask: (goalId: string, taskId: string, targetWeekId: string) => api.patch(`/api/goals/${goalId}/tasks/${taskId}/move`, { targetWeekId }),
};

// ─── Inbox API ────────────────────────────────────────────────────────────────
export const inboxApi = {
  list: () => api.get('/api/inbox'),
  create: (data: object) => api.post('/api/inbox', data),
  update: (id: string, data: object) => api.patch(`/api/inbox/${id}`, data),
  remove: (id: string) => api.delete(`/api/inbox/${id}`),
};

// ─── Habits API ───────────────────────────────────────────────────────────────
export const habitsApi = {
  list: () => api.get('/api/habits'),
  create: (data: object) => api.post('/api/habits', data),
  update: (id: string, data: object) => api.patch(`/api/habits/${id}`, data),
  remove: (id: string) => api.delete(`/api/habits/${id}`),
  toggle: (id: string, date: string) => api.post(`/api/habits/${id}/complete`, { date }),
};
