import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getStockLabel } from '../../utils/helpers'
import StarRating from '../common/StarRating'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  const { label: stockLabel, level: stockLevel } = getStockLabel(product.stock)
  const inWishlist = isInWishlist(product.id)
  const soldOut = product.stock === 0
  // Support both images[] array and legacy single image field
  const primaryImage = (product.images && product.images.length > 0) ? product.images[0] : product.image

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (soldOut) return
    setAddingToCart(true)
    addToCart(product, 1)
    addToast(`${product.title} added to cart`, 'success')
    setTimeout(() => setAddingToCart(false), 600)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (inWishlist) {
      await removeFromWishlist(product.id)
      addToast('Removed from wishlist', 'info')
    } else {
      await addToWishlist(product)
      addToast(`${product.title} added to wishlist`, 'success')
    }
  }

  const badgeColors = {
    'Bestseller': 'saffron',
    'Premium': 'navy',
    'New': 'green',
    'Trending': 'saffron',
    'Limited': 'red',
    'Sold Out': 'red',
    'Heritage': 'navy',
    'Must Have': 'green',
    'Handmade': 'navy',
    'Artisan': 'navy',
    'Popular': 'saffron',
    'Classic': 'navy',
    'Must Read': 'green',
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link" aria-label={`View ${product.title}`}>
        <div className="product-img-wrap">
          {!imgLoaded && <div className="product-img-skeleton skeleton" />}
          <img
            src={primaryImage}
            alt={product.title}
            className={`product-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80'; setImgLoaded(true) }}
            loading="lazy"
          />
          {soldOut && <div className="product-sold-out-overlay">Sold Out</div>}
          {product.badge && !soldOut && (
            <span className={`product-badge badge badge-${badgeColors[product.badge] || 'navy'}`}>
              {product.badge}
            </span>
          )}
          {soldOut && (
            <span className="product-badge badge badge-red">Sold Out</span>
          )}
        </div>
      </Link>

      <button
        className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
        onClick={handleWishlist}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={inWishlist}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? '#e53e3e' : 'none'} stroke={inWishlist ? '#e53e3e' : 'currentColor'} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      <div className="product-body">
        <Link to={`/products/${product.id}`} className="product-category">{product.category}</Link>
        <Link to={`/products/${product.id}`} className="product-title">{product.title}</Link>

        <div className="product-rating">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="product-original">{formatPrice(product.originalPrice)}</span>
              <span className="product-discount">{product.discount}% off</span>
            </>
          )}
        </div>

        <div className={`product-stock stock-${stockLevel}`}>
          <span className="stock-dot" />
          {stockLabel}
        </div>

        <button
          className={`btn product-add-btn ${soldOut ? 'btn-disabled' : addingToCart ? 'btn-adding' : 'btn-primary'}`}
          onClick={handleAddToCart}
          disabled={soldOut}
          aria-label={soldOut ? 'Out of stock' : `Add ${product.title} to cart`}
        >
          {soldOut ? (
            'Out of Stock'
          ) : addingToCart ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Added!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  )
}
