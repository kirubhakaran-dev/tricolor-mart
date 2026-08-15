import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { formatPrice, formatDate } from '../utils/helpers'
import './OrderConfirmationPage.css'

// SVG Indian Flag - no emoji
function ConfirmationFlag() {
  return (
    <svg width="80" height="54" viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg" aria-label="Indian National Flag" role="img">
      <rect x="0" y="0" width="420" height="93.3" fill="#FF9933" />
      <rect x="0" y="93.3" width="420" height="93.4" fill="#FFFFFF" />
      <rect x="0" y="186.7" width="420" height="93.3" fill="#138808" />
      <g transform="translate(210, 140)">
        <circle cx="0" cy="0" r="38" fill="none" stroke="#000080" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="6" fill="#000080" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180
          return <line key={i} x1={Math.sin(a)*6} y1={-Math.cos(a)*6} x2={Math.sin(a)*36} y2={-Math.cos(a)*36} stroke="#000080" strokeWidth="1.5" />
        })}
      </g>
    </svg>
  )
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadOrder = useCallback(async () => {
    try {
      const data = await orderService.getOrderById(orderId)
      setOrder(data)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="confirmation-card">
            <div className="skeleton" style={{ height: 80, width: 80, borderRadius: '50%', margin: '0 auto 24px' }} />
            <div className="skeleton" style={{ height: 32, width: '60%', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: 20, width: '40%', margin: '0 auto' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="confirmation-card">
            <h2>Order not found</h2>
            <Link to="/orders" className="btn btn-primary" style={{ marginTop: 24 }}>View My Orders</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="confirmation-page page-enter">
      <div className="container">
        <div className="confirmation-card">
          {/* Success indicator */}
          <div className="confirm-icon-wrap">
            <div className="confirm-check">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h1 className="confirm-title">Order Confirmed!</h1>
          <p className="confirm-subtitle">
            Thank you for your order. Your Independence Day collection is on its way!
          </p>

          {/* Flag */}
          <div className="confirm-flag">
            <ConfirmationFlag />
            <p className="confirm-jai">Jai Hind</p>
          </div>

          {/* Order meta */}
          <div className="confirm-meta">
            <div className="confirm-meta-item">
              <span className="meta-label">Order Number</span>
              <span className="meta-value">#{order.orderNumber}</span>
            </div>
            <div className="confirm-meta-item">
              <span className="meta-label">Date</span>
              <span className="meta-value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="confirm-meta-item">
              <span className="meta-label">Status</span>
              <span className="meta-value status-placed">{order.status}</span>
            </div>
            <div className="confirm-meta-item">
              <span className="meta-label">Total</span>
              <span className="meta-value total-value">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="confirm-items">
            <h3>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div key={i} className="confirm-item">
                <img
                  src={item.image || (item.images && item.images[0]) || ''}
                  alt={item.title}
                  className="confirm-item-img"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=120&q=60' }}
                />
                <div className="confirm-item-info">
                  <p className="confirm-item-title">{item.title}</p>
                  <p className="confirm-item-cat">{item.category}</p>
                </div>
                <div className="confirm-item-right">
                  <span>×{item.quantity}</span>
                  <span className="confirm-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="confirm-address">
            <h3>Delivery To</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>
              {order.shippingAddress.house}, {order.shippingAddress.street}
              {order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* CTAs */}
          <div className="confirm-ctas">
            <Link to={`/orders`} className="btn btn-navy">View My Orders</Link>
            <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
