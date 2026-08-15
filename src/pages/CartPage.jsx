import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { productService } from '../services/productService'
import { formatPrice } from '../utils/helpers'
import './CartPage.css'

export default function CartPage() {
  const {
    items, removeFromCart, updateQuantity, subtotal, discount, taxableAmount,
    cgst, sgst, deliveryFee, total, itemCount,
    couponCode, setCouponCode, couponError, appliedCoupon, applyCoupon, removeCoupon,
    DELIVERY_FEE, FREE_DELIVERY_THRESHOLD
  } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '')
  const [productStocks, setProductStocks] = useState({})

  // Fetch latest stock data
  useEffect(() => {
    if (items.length > 0) {
      items.forEach(async (item) => {
        try {
          const p = await productService.getProductById(item.id)
          setProductStocks(prev => ({ ...prev, [item.id]: p.stock }))
        } catch {}
      })
    }
  }, [])

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponInput)
    if (success) {
      addToast(`Coupon ${couponInput.trim().toUpperCase()} applied!`, 'success')
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponInput('')
    addToast('Coupon removed', 'info')
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  const handleQtyChange = (item, newQty) => {
    const currentStock = productStocks[item.id] ?? item.stock
    if (newQty > currentStock) {
      addToast(`Only ${currentStock} items are currently available.`, 'warning')
      return
    }
    updateQuantity(item.id, newQty, currentStock)
  }

  const freeDeliveryRemaining = FREE_DELIVERY_THRESHOLD - subtotal

  if (items.length === 0) {
    return (
      <div className="cart-page page-enter">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some Independence Day products to celebrate with pride.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <h1 className="cart-title">Shopping Cart <span className="cart-count">({itemCount} items)</span></h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-section">
            {/* Free delivery progress */}
            {freeDeliveryRemaining > 0 ? (
              <div className="delivery-progress-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Add <strong>{formatPrice(freeDeliveryRemaining)}</strong> more to unlock FREE delivery</span>
              </div>
            ) : (
              <div className="delivery-progress-bar unlocked">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>FREE delivery unlocked!</strong></span>
              </div>
            )}

            {items.map(item => {
              const currentStock = productStocks[item.id] ?? item.stock
              return (
                <div key={item.id} className="cart-item">
                  <Link to={`/products/${item.id}`} className="cart-item-img-wrap">
                    <img
                    src={(item.images && item.images[0]) || item.image}
                    alt={item.title}
                    className="cart-item-img"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=200&q=60' }}
                  />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${item.id}`} className="cart-item-category">{item.category}</Link>
                    <Link to={`/products/${item.id}`} className="cart-item-title">{item.title}</Link>
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">{formatPrice(item.price)}</span>
                      {item.originalPrice > item.price && (
                        <span className="cart-item-original">{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty-controls">
                      <button
                        onClick={() => handleQtyChange(item, item.quantity - 1)}
                        className="cart-qty-btn"
                        aria-label="Decrease quantity"
                      >–</button>
                      <span className="cart-qty-display">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, item.quantity + 1)}
                        className="cart-qty-btn"
                        disabled={item.quantity >= currentStock}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    <span className="cart-item-total">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Billing Summary */}
          <div className="cart-summary">
            {/* Coupon */}
            <div className="coupon-section">
              <h3 className="summary-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Coupon Code
              </h3>
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <div className="coupon-applied-info">
                    <code>{appliedCoupon.code}</code>
                    <span>– {formatPrice(discount)} off</span>
                  </div>
                  <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className={`coupon-input ${couponError ? 'error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    aria-label="Coupon code"
                  />
                  <button
                    className="btn btn-navy coupon-apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}

              {/* Coupon suggestion cards */}
              {!appliedCoupon && (
                <div className="coupon-hints">
                  {[
                    { code: 'FREEDOM25', label: '25% Independence Day discount', minSubtotal: 199 },
                    { code: 'FREEDOM150', label: '₹150 flat discount',             minSubtotal: 999 }
                  ].map(cpn => {
                    const eligible = subtotal >= cpn.minSubtotal
                    const needed   = cpn.minSubtotal - subtotal
                    return (
                      <div key={cpn.code} className="coupon-hint-row">
                        <div className="coupon-hint-info">
                          <code>{cpn.code}</code>
                          <span>{cpn.label} · Min ₹{cpn.minSubtotal}</span>
                        </div>
                        {eligible ? (
                          <button
                            className="btn btn-primary coupon-hint-apply-btn"
                            onClick={() => {
                              const success = applyCoupon(cpn.code)
                              if (success) {
                                setCouponInput(cpn.code)
                                addToast(`Coupon ${cpn.code} applied!`, 'success')
                              }
                            }}
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="coupon-hint-locked">Add {formatPrice(needed)} more</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="summary-divider" />

            {/* Bill breakdown */}
            <div className="bill-section">
              <h3 className="summary-heading">Order Summary</h3>
              <div className="bill-row">
                <span>Product Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="bill-row discount-row">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>– {formatPrice(discount)}</span>
                </div>
              )}
              <div className="bill-row">
                <span>Taxable Amount</span>
                <span>{formatPrice(taxableAmount)}</span>
              </div>
              <div className="bill-row tax-row">
                <span>CGST (9%)</span>
                <span>{formatPrice(cgst)}</span>
              </div>
              <div className="bill-row tax-row">
                <span>SGST (9%)</span>
                <span>{formatPrice(sgst)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'free-delivery-text' : ''}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="bill-divider" />
              <div className="bill-row total-row">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <Link to="/products" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
