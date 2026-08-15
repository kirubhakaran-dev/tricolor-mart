import React, { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../services/userService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tricolor_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('tricolor_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const users = await userService.getUserByEmail(email)
    if (!users || users.length === 0) {
      throw new Error('No account found with this email.')
    }
    const found = users[0]
    if (found.password !== password) {
      throw new Error('Incorrect password. Please try again.')
    }
    const { password: _, ...safeUser } = found
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
    const { password: _, ...safeUser } = newUser
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
