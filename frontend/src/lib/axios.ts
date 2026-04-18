import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request: attach access token ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: unwrap envelope + silent refresh on 401 ─────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Auto-unwrap the { success, status_code, data, ... } envelope produced by
    // TransformInterceptor so all callers see response.data = the actual payload.
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      response.data.success === true
    ) {
      response.data = response.data.data ?? response.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) return redirectToLogin();

    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );

      // data may be the raw envelope or already unwrapped depending on call order
      const payload = data?.data ?? data;
      const newAccess: string = payload?.access_token;
      const newRefresh: string = payload?.refresh_token;

      Cookies.set('access_token', newAccess, { expires: 1 / 96 });
      Cookies.set('refresh_token', newRefresh, { expires: 7 });
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      original.headers.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      return api(original);
    } catch (err) {
      processQueue(err, null);
      return redirectToLogin();
    } finally {
      isRefreshing = false;
    }
  },
);

function redirectToLogin() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user');
  if (typeof window !== 'undefined') window.location.href = '/login';
  return Promise.reject(new Error('Session expired'));
}

export default api;
