import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="profile-page page-enter">
        <div className="container">
          <div className="profile-login-prompt">
            <h2>Please sign in to view your profile</h2>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Sign In</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    addToast('You have been signed out', 'info')
    navigate('/')
  }

  const menuItems = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      label: 'My Orders',
      desc: 'Track and view your orders',
      to: '/orders',
      color: 'saffron'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
      label: 'My Wishlist',
      desc: 'Products you\'ve saved',
      to: '/wishlist',
      color: 'red'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: 'My Address',
      desc: 'Manage delivery addresses',
      to: '/address',
      color: 'green'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: 'Contact Us',
      desc: 'Get help and support',
      to: '/contact',
      color: 'navy'
    }
  ]

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div className="profile-hero">
          <div className="profile-avatar-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <span className="profile-member-tag">Tricolor Mart Member</span>
          </div>
        </div>

        <div className="profile-menu">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} className={`profile-menu-item color-${item.color}`}>
              <div className="profile-menu-icon">{item.icon}</div>
              <div className="profile-menu-text">
                <span className="pmi-label">{item.label}</span>
                <span className="pmi-desc">{item.desc}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pmi-arrow">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>

        <button className="btn profile-logout-btn" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
