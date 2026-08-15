import { createContext, useContext, useState } from 'react'
import { userService } from '../services/userService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tricolor_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('tricolor_user')
      return null
    }
  })
  // loading is always false — user is rehydrated synchronously from localStorage
  const loading = false

  const login = async (email, password) => {
    const users = await userService.getUserByEmail(email)
    if (!users || users.length === 0) {
      throw new Error('No account found with this email.')
    }
    const found = users[0]
    if (found.password !== password) {
      throw new Error('Incorrect password. Please try again.')
    }
    // eslint-disable-next-line no-unused-vars
    const { password: _pw1, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem('tricolor_user', JSON.stringify(safeUser))
    return safeUser
  }

  const register = async (name, email, password) => {
    const existing = await userService.getUserByEmail(email)
    if (existing && existing.length > 0) {
      throw new Error('An account with this email already exists.')
    }
    const newUser = await userService.createUser({ name, email, password, createdAt: new Date().toISOString() })
    // eslint-disable-next-line no-unused-vars
    const { password: _pw2, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem('tricolor_user', JSON.stringify(safeUser))
    return safeUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tricolor_user')
  }

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData }
    setUser(updated)
    localStorage.setItem('tricolor_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
