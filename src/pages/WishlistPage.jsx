import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, getStockLabel } from '../utils/helpers'
import StarRating from '../components/common/StarRating'
import './WishlistPage.css'

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()

  if (!user) {
    return (
      <div className="wishlist-page page-enter">
        <div className="container">
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <h3>Sign in to see your wishlist</h3>
            <p>Save your favourite Independence Day products for later.</p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="wishlist-page page-enter">
        <div className="container">
          <h1 className="wishlist-title">My Wishlist</h1>
          <div className="wishlist-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page page-enter">
        <div className="container">
          <h1 className="wishlist-title">My Wishlist</h1>
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Add products you love to your wishlist and come back to them anytime.</p>
            <Link to="/products" className="btn btn-primary">Explore Products</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleMoveToCart = (product) => {
    if (product.stock === 0) {
      addToast('This product is currently out of stock', 'warning')
      return
    }
    addToCart(product, 1)
    addToast(`${product.title} added to cart`, 'success')
  }

  const handleRemove = async (product) => {
    await removeFromWishlist(product.id)
    addToast('Removed from wishlist', 'info')
  }

  return (
    <div className="wishlist-page page-enter">
      <div className="container">
        <h1 className="wishlist-title">My Wishlist <span className="wishlist-count">({wishlistItems.length})</span></h1>

        <div className="wishlist-grid">
          {wishlistItems.map(product => {
            const { label: stockLabel, level } = getStockLabel(product.stock)
            return (
              <div key={product.id} className="wishlist-card">
                <Link to={`/products/${product.id}`} className="wishlist-img-wrap">
                  <img
                    src={(product.images && product.images[0]) || product.image}
                    alt={product.title}
                    className="wishlist-img"
                    loading="lazy"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&q=60' }}
                  />
                  {product.stock === 0 && <div className="wishlist-sold-out">Sold Out</div>}
                </Link>
                <button
                  className="wishlist-remove-btn"
                  onClick={() => handleRemove(product)}
                  aria-label={`Remove ${product.title} from wishlist`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="wishlist-body">
                  <Link to={`/products/${product.id}`} className="wl-category">{product.category}</Link>
                  <Link to={`/products/${product.id}`} className="wl-title">{product.title}</Link>
                  <div className="wl-rating">
                    <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                  </div>
                  <div className="wl-price-row">
                    <span className="wl-price">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="wl-original">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className={`wl-stock stock-${level}`}>
                    <span className="stock-dot" />{stockLabel}
                  </div>
                  <button
                    className={`btn wl-cart-btn ${product.stock === 0 ? 'btn-disabled' : 'btn-primary'}`}
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
