import axios from 'axios';

/**
 * Xác định API Base URL:
 * 1. Đọc từ biến môi trường VITE_API_BASE_URL.
 * 2. Nếu trang web được mở từ thiết bị khác trong cùng mạng LAN (window.location.hostname khác localhost/127.0.0.1)
 *    và URL đang trỏ tới localhost/127.0.0.1, tự động thay thế bằng hostname của máy host để thiết bị đó gọi được API backend.
 * 3. Fallback mặc định theo host hiện tại hoặc localhost: http://<hostname>:5000/api
 */
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const currentHost = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

  if (envUrl) {
    if (
      currentHost !== 'localhost' &&
      currentHost !== '127.0.0.1' &&
      (envUrl.includes('://localhost') || envUrl.includes('://127.0.0.1'))
    ) {
      return envUrl
        .replace('://localhost', `://${currentHost}`)
        .replace('://127.0.0.1', `://${currentHost}`);
    }
    return envUrl;
  }

  return `http://${currentHost}:5000/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected endpoint, clear stale token
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
