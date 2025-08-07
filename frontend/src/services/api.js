import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const assetAPI = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`)
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`)
};

export const portfolioAPI = {
  getSummary: () => api.get('/portfolio/summary'),
  getDistribution: () => api.get('/portfolio/distribution'),
  getRealTimeMetrics: () => api.get('/portfolio/metrics')
};

export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  updateProgress: (id, data) => api.put(`/goals/${id}/progress`, data),
  delete: (id) => api.delete(`/goals/${id}`)
};

export const predefinedAssetAPI = {
  search: (query) => api.get(`/predefined-assets/search?query=${encodeURIComponent(query)}`),
  getBySymbol: (symbol) => api.get(`/predefined-assets/${symbol}`),
  updatePrice: (symbol, price) => api.put(`/predefined-assets/${symbol}/price`, { price })
};

export const marketAPI = {
  getData: () => api.get('/market/data'),
  getSectors: () => api.get('/market/sectors'),
  getNews: () => api.get('/market/news')
};