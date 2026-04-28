import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,   // 60s — covers Render free tier cold start of up to 50s
});

// Retry only GET requests — NEVER auto-retry writes
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) &&
    error.config?.method === 'get',
});

export const postExpense   = (payload)      => api.post('/expenses', payload);
export const fetchExpenses = (params)       => api.get('/expenses', { params });
export const checkHealth   = ()             => api.get('/health', { timeout: 5000 });
export const putExpense    = (id, payload)  => api.put(`/expenses/${id}`, payload);
export const removeExpense = (id)           => api.delete(`/expenses/${id}`);
