import React from 'react'
import { Link } from 'react-router-dom'
import { FlagIcon } from '../common/IndianFlag'
import { useAuth } from '../../context/AuthContext'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const { user } = useAuth()

  return (
    <footer className="footer" role="contentinfo">
      <div className="tricolour-line" />
      <div className="footer-main container">
        <div className="footer-brand">
          <div className="footer-logo">
            <FlagIcon />
            <div>
              <span className="footer-logo-name">TRICOLOR MART</span>
              <span className="footer-tagline">Celebrate Freedom – Shop with Pride</span>
            </div>
          </div>
          <p className="footer-desc">
            India's premier Independence Day shopping destination. Celebrating 79 years of independence with authentic, curated products that honour our heritage.
          </p>
          <div className="footer-badges">
            <span className="footer-badge saffron">79th Independence Day</span>
            <span className="footer-badge green">Jai Hind</span>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Indian+Flags+%26+Tricolour">Indian Flags & Tricolour</Link>
            <Link to="/products?category=Indian+Sweets+%26+Treats">Indian Sweets & Treats</Link>
            <Link to="/products?category=Patriotic+Clothing">Patriotic Clothing</Link>
            <Link to="/products?category=Independence+Day+Gifts">Independence Day Gifts</Link>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <Link to="/products?category=Indian+Freedom+Heroes">Indian Freedom Heroes</Link>
            <Link to="/products?category=Freedom+Movement+%26+History">Freedom Movement & History</Link>
            <Link to="/products?category=Indian+Art+%26+Handicrafts">Indian Art & Handicrafts</Link>
            <Link to="/products?category=Indian+Heritage+%26+Culture">Indian Heritage & Culture</Link>
            <Link to="/products?category=Patriotic+Accessories">Patriotic Accessories</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            {user ? (
              /* Logged-in links */
              <>
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/address">Delivery Address</Link>
              </>
            ) : (
              /* Logged-out links */
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Create Account</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/address">Delivery Address</Link>
              </>
            )}
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact Us</Link>
            <span className="footer-info">Independence Day Coupons</span>
            <span className="footer-coupon-hint">FREEDOM25 — 25% off above ₹199</span>
            <span className="footer-coupon-hint">FREEDOM150 — ₹150 off above ₹999</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {year} Tricolor Mart. Made with pride in India.</p>
        <div className="footer-flag-small">
          <FlagIcon />
          <span>Vande Mataram</span>
        </div>
      </div>
    </footer>
  )
}
