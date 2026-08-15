import { api } from './api'

export const userService = {
  getUserByEmail: (email) => api.get(`/users?email=${encodeURIComponent(email)}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data)
}
