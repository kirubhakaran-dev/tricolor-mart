export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const getStockLabel = (stock) => {
  if (stock === 0) return { label: 'Sold Out', level: 'out' }
  if (stock === 1) return { label: 'Only 1 left', level: 'critical' }
  if (stock === 2) return { label: 'Only 2 left', level: 'critical' }
  if (stock === 3) return { label: 'Only 3 left', level: 'low' }
  if (stock <= 5) return { label: `Only ${stock} left`, level: 'low' }
  return { label: 'In Stock', level: 'good' }
}

export const generateOrderNumber = () => {
  const ts = Date.now().toString().slice(-6)
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `TM${ts}${rand}`
}

export const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export const getRatingStars = (rating) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}

export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
