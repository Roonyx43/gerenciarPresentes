import axios from 'axios'

// Ajuste o BASE_URL se o backend rodar em outro host ou porta
export const api = axios.create({
  baseURL: 'http://localhost:4000/api'
})

// === Contributions ===
export const listContributions = () =>
  api.get('/contributions').then(r => r.data)

export const toggleContributionPaid = (id) =>
  api.patch(`/contributions/${id}/toggle-paid`).then(r => r.data)

export const deleteContribution = (id) =>
  api.delete(`/contributions/${id}`).then(r => r.data)

// === Gifts ===
export const listGifts = () =>
  api.get('/gifts').then(r => r.data)

export const createGift = (payload) =>
  api.post('/gifts', payload).then(r => r.data)

export const updateGift = (id, payload) =>
  api.patch(`/gifts/${id}`, payload).then(r => r.data)

export const deleteGift = (id) =>
  api.delete(`/gifts/${id}`).then(r => r.data)

// === Stats / Ranking ===
export const getTopContributors = ({ giftId = null, limit = 10 } = {}) => {
  const params = new URLSearchParams()
  if (giftId) params.set('gift_id', giftId)
  if (limit) params.set('limit', limit)

  return api
    .get(`/stats/contributors/top?${params.toString()}`)
    .then(r => r.data)
}
