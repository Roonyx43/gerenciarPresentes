import axios from 'axios';

// ajuste o BASE_URL se rodar backend noutro host
export const api = axios.create({
  baseURL: 'https://gerenciarpresentes-production.up.railway.app/api'
});

export const listContributions = () => api.get('/contributions').then(r => r.data);
export const toggleContributionPaid = (id) => api.patch(`/contributions/${id}/toggle-paid`).then(r => r.data);
export const deleteContribution = (id) => api.delete(`/contributions/${id}`).then(r => r.data);

export const listGifts = () => api.get('/gifts').then(r => r.data);
export const createGift = (payload) => api.post('/gifts', payload).then(r => r.data);
export const updateGift = (id, payload) => api.patch(`/gifts/${id}`, payload).then(r => r.data);
export const deleteGift = (id) => api.delete(`/gifts/${id}`).then(r => r.data);
