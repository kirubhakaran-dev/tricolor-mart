import { api } from './api'

export const wishlistService = {
  getWishlistByUser: (userId) => api.get(`/wishlists?userId=${userId}`),
  createWishlist: (data) => api.post('/wishlists', data),
  updateWishlist: (id, data) => api.patch(`/wishlists/${id}`, data)
}
