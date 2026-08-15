const BASE_URL = 'http://localhost:3001'

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`)
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`)
    return res.json()
  },
  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`)
    return res.json()
  },
  patch: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${res.status}`)
    return res.json()
  },
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`)
    return res.json()
  },
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`)
    return res.json()
  }
}
