import { api } from './api'

export const productService = {
  getAllProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  updateStock: (id, newStock) => api.patch(`/products/${id}`, { stock: newStock }),
  searchProducts: async (query) => {
    const all = await api.get('/products')
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    )
  }
}
