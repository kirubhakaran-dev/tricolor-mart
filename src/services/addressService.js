import { api } from './api'

export const addressService = {
  getAddressByUser: (userId) => api.get(`/addresses?userId=${userId}`),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`)
}
