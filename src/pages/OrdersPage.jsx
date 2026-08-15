import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { formatPrice, formatDate } from '../utils/helpers'
import './OrdersPage.css'
const STATUS_STEPS = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

function OrderTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="order-cancelled-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        Cancelled
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.indexOf(status)

  return (
    <div className="order-timeline" role="list" aria-label="Order status">
      {STATUS_STEPS.map((step, i) => (
        <div
          key={step}
          className={`timeline-step ${i <= currentIndex ? 'completed' : ''} ${i === currentIndex ? 'current' : ''}`}
          role="listitem"
          aria-current={i === currentIndex ? 'step' : undefined}
        >
          <div className="timeline-dot">
            {i <= currentIndex ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`timeline-line ${i < currentIndex ? 'filled' : ''}`} />
          )}
          <span className="timeline-label">{step}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getOrdersByUser(user.id)
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(sorted)
    } catch {
      setError('We\'re having trouble loading your orders.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    fetchOrders()
  }, [user, authLoading, navigate, fetchOrders])

  if (authLoading) return null   // still rehydrating — don't redirect yet
  if (!user) return null

  if (loading) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <h1 className="orders-title">My Orders</h1>
          {[1, 2].map(i => (
            <div key={i} className="skeleton order-skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <h1 className="orders-title">My Orders</h1>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchOrders}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <h1 className="orders-title">My Orders</h1>
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. Start shopping to celebrate Independence Day!</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page page-enter">
      <div className="container">
        <h1 className="orders-title">My Orders <span className="orders-count">({orders.length})</span></h1>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              {/* Order header */}
              <div className="order-header">
                <div className="order-meta">
                  <span className="order-number">#{order.orderNumber}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-header-right">
                  <span className={`order-status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className="order-total">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="order-timeline-wrap">
                <OrderTimeline status={order.status} />
              </div>

              {/* Items preview */}
              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, i) => (
                  <Link key={i} to={`/products/${item.id}`} className="order-preview-item">
                    <img src={item.image} alt={item.title} className="order-preview-img" />
                    <div className="order-preview-info">
                      <p className="order-preview-title">{item.title}</p>
                      <p className="order-preview-qty">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </Link>
                ))}
                {order.items.length > 3 && (
                  <p className="order-more-items">+{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}</p>
                )}
              </div>

              {/* Bill summary */}
              <div className="order-bill-summary">
                <div className="obs-item">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="obs-item discount">
                    <span>Discount ({order.couponCode})</span>
                    <span>– {formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="obs-item">
                  <span>CGST (9%)</span>
                  <span>{formatPrice(order.cgst)}</span>
                </div>
                <div className="obs-item">
                  <span>SGST (9%)</span>
                  <span>{formatPrice(order.sgst)}</span>
                </div>
                <div className="obs-item">
                  <span>Delivery</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="obs-divider" />
                <div className="obs-item obs-total">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Delivery address */}
              {order.shippingAddress && (
                <div className="order-address">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    Delivering to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
