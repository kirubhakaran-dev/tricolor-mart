import { api } from './api'

export const orderService = {
  // json-server v1 uses _sort=-field for descending (NOT _sort=field&_order=desc)
  getOrdersByUser: (userId) => api.get(`/orders?userId=${userId}&_sort=-createdAt`),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}`, { status })
}
