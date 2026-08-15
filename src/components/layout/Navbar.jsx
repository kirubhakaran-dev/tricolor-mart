import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { productService } from '../../services/productService'
import { FlagIcon } from '../common/IndianFlag'
import { formatPrice, debounce } from '../../utils/helpers'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const searchRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = debounce(async (q) => {
    if (!q.trim()) { setSuggestions([]); return }
    setSearchLoading(true)
    try {
      const results = await productService.searchProducts(q)
      setSuggestions(results.slice(0, 6))
    } catch { setSuggestions([]) }
    finally { setSearchLoading(false) }
  }, 300)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    fetchSuggestions(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`)
    setSearchQuery('')
    setSuggestions([])
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="banner">
        <div className="tricolour-line" />
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Tricolor Mart - Home">
            <FlagIcon />
            <div className="logo-text">
              <span className="logo-name">TRICOLOR MART</span>
              <span className="logo-tagline">Celebrate Freedom – Shop with Pride</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar-links desktop-only" aria-label="Main navigation">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}>Products</Link>
          </nav>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <div className="search-wrapper desktop-only" ref={searchRef}>
              <button
                className="nav-icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search products"
                aria-expanded={searchOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              {searchOpen && (
                <div className="search-dropdown" role="search">
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search products, categories..."
                      autoFocus
                      className="search-input"
                      aria-label="Search"
                    />
                    {searchQuery && (
                      <button type="button" className="search-clear" onClick={() => { setSearchQuery(''); setSuggestions([]) }} aria-label="Clear search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </form>
                  {searchLoading && <div className="search-loading">Searching...</div>}
                  {!searchLoading && suggestions.length > 0 && (
                    <ul className="search-suggestions" role="listbox">
                      {suggestions.map(p => (
                        <li key={p.id} role="option">
                          <button className="suggestion-item" onClick={() => handleSuggestionClick(p)}>
                            <img src={p.image} alt={p.title} className="suggestion-img" />
                            <div className="suggestion-info">
                              <span className="suggestion-title">{p.title}</span>
                              <span className="suggestion-category">{p.category}</span>
                            </div>
                            <span className="suggestion-price">{formatPrice(p.price)}</span>
                          </button>
                        </li>
                      ))}
                      <li className="suggestion-all">
                        <button onClick={handleSearchSubmit}>
                          View all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  )}
                  {!searchLoading && searchQuery && suggestions.length === 0 && (
                    <div className="search-empty">No products found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="nav-icon-btn" aria-label={`Wishlist (${wishlistItems.length} items)`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="badge-count" aria-label={`${wishlistItems.length} items in wishlist`}>{wishlistItems.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-icon-btn" aria-label={`Cart (${itemCount} items)`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="badge-count cart-badge" aria-label={`${itemCount} items in cart`}>{itemCount}</span>
              )}
            </Link>

            {/* Profile */}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="nav-icon-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {user ? (
                  <div className="user-avatar" aria-hidden="true">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </button>

              {profileOpen && (
                <div className="profile-dropdown" role="menu">
                  {user ? (
                    <>
                      <div className="profile-header">
                        <div className="profile-avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="profile-name">{user.name}</p>
                          <p className="profile-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                        Wishlist
                      </Link>
                      <Link to="/address" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        My Address
                      </Link>
                      <Link to="/contact" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        Contact Us
                      </Link>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item logout-item" onClick={handleLogout} role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        Login
                      </Link>
                      <Link to="/register" className="dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                        Register / Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="mobile-menu-btn mobile-only"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay mobile-only" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-menu">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="mobile-search-input"
                aria-label="Search products"
              />
            </form>

            <nav aria-label="Mobile navigation">
              <Link to="/" className="mobile-nav-item">Home</Link>
              <Link to="/products" className="mobile-nav-item">Products</Link>
              <Link to="/cart" className="mobile-nav-item">
                Cart {itemCount > 0 && <span className="mobile-badge">{itemCount}</span>}
              </Link>
              <Link to="/wishlist" className="mobile-nav-item">
                Wishlist {wishlistItems.length > 0 && <span className="mobile-badge">{wishlistItems.length}</span>}
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="mobile-nav-item">My Profile</Link>
                  <Link to="/orders" className="mobile-nav-item">My Orders</Link>
                  <Link to="/address" className="mobile-nav-item">My Address</Link>
                  <Link to="/contact" className="mobile-nav-item">Contact Us</Link>
                  <button className="mobile-nav-item mobile-logout" onClick={handleLogout}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-item">Login</Link>
                  <Link to="/register" className="mobile-nav-item">Register / Create Account</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
