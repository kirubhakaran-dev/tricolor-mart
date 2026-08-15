import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, getStockLabel } from '../utils/helpers'
import StarRating from '../components/common/StarRating'
import ProductCard from '../components/product/ProductCard'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    setQty(1)
    setActiveImageIndex(0)
    setImgLoaded(false)
    try {
      const p = await productService.getProductById(id)
      setProduct(p)
      const all = await productService.getAllProducts()
      setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4))
    } catch {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-skeleton">
            <div className="pd-skeleton-gallery">
              <div className="skeleton pd-img-skeleton" />
              <div className="pd-thumbs-skeleton">
                {[0,1,2].map(i => <div key={i} className="skeleton pd-thumb-skeleton" />)}
              </div>
            </div>
            <div className="pd-info-skeleton">
              <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 40, width: '90%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 24 }} />
              <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: 24 }} />
              <div className="skeleton" style={{ height: 48, width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Back to Products</Link>
        </div>
      </div>
    )
  }

  // Support images[] array and legacy single image field
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.image ? [product.image] : []
  const activeImage = images[activeImageIndex] || images[0]

  const { label: stockLabel, level: stockLevel } = getStockLabel(product.stock)
  const inWishlist = isInWishlist(product.id)
  const soldOut = product.stock === 0
  const maxQty = Math.min(product.stock, 10)

  const handleAddToCart = () => {
    if (soldOut) return
    if (qty > product.stock) {
      addToast(`Only ${product.stock} items are currently available.`, 'warning')
      return
    }
    setAddingToCart(true)
    addToCart(product, qty)
    addToast(`${product.title} added to cart`, 'success')
    setTimeout(() => setAddingToCart(false), 800)
  }

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return }
    if (soldOut) return
    if (qty > product.stock) {
      addToast(`Only ${product.stock} items are currently available.`, 'warning')
      return
    }
    addToCart(product, qty)
    navigate('/checkout')
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    if (inWishlist) {
      await removeFromWishlist(product.id)
      addToast('Removed from wishlist', 'info')
    } else {
      await addToWishlist(product)
      addToast(`${product.title} added to wishlist`, 'success')
    }
  }

  const handleQtyChange = (val) => {
    const n = Math.max(1, Math.min(val, maxQty))
    setQty(n)
  }

  const handlePrevImage = () => {
    setImgLoaded(false)
    setActiveImageIndex(i => (i - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    setImgLoaded(false)
    setActiveImageIndex(i => (i + 1) % images.length)
  }

  return (
    <div className="product-detail-page page-enter">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> / </span>
            <Link to="/products">Products</Link>
            <span aria-hidden="true"> / </span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="product-detail-layout">
          {/* Gallery */}
          <div className="pd-image-section">
            {/* Main image */}
            <div className="pd-main-image-wrap" role="img" aria-label={`${product.title} - image ${activeImageIndex + 1} of ${images.length}`}>
              {!imgLoaded && <div className="skeleton pd-img-placeholder" />}
              <img
                src={activeImage}
                alt={`${product.title} view ${activeImageIndex + 1}`}
                className={`pd-image ${imgLoaded ? 'loaded' : 'loading'}`}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&q=80'
                  setImgLoaded(true)
                }}
              />
              {soldOut && <div className="pd-sold-out-overlay">Sold Out</div>}
              {product.badge && !soldOut && (
                <span className="pd-badge">{product.badge}</span>
              )}
              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    className="pd-gallery-arrow pd-gallery-prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="pd-gallery-arrow pd-gallery-next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pd-thumbnails" role="list" aria-label="Product image thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${i === activeImageIndex ? 'active' : ''}`}
                    onClick={() => { setImgLoaded(false); setActiveImageIndex(i) }}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === activeImageIndex}
                    role="listitem"
                  >
                    <img
                      src={img}
                      alt={`${product.title} thumbnail ${i + 1}`}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=120&q=60' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="pd-category">
              {product.category}
            </Link>
            <h1 className="pd-title">{product.title}</h1>

            <div className="pd-rating-row">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="lg" />
              <span className="pd-rating-num">{product.rating}</span>
            </div>

            <div className="pd-price-section">
              <span className="pd-price">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="pd-original">{formatPrice(product.originalPrice)}</span>
                  <span className="pd-discount-tag">{product.discount}% off</span>
                </>
              )}
            </div>

            <div className={`pd-stock-status stock-${stockLevel}`}>
              <span className="stock-dot" />
              {stockLabel}
            </div>

            <div className="pd-divider" />

            <p className="pd-description">{product.description}</p>

            <div className="pd-divider" />

            {/* Quantity */}
            {!soldOut && (
              <div className="pd-qty-section">
                <label className="pd-qty-label">Quantity:</label>
                <div className="pd-qty-controls">
                  <button
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    className="qty-btn"
                  >–</button>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => handleQtyChange(Number(e.target.value))}
                    min="1"
                    max={maxQty}
                    className="qty-input"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={qty >= maxQty}
                    aria-label="Increase quantity"
                    className="qty-btn"
                  >+</button>
                </div>
                {product.stock <= 5 && (
                  <span className="qty-warning">Max {product.stock} available</span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="pd-actions">
              <button
                className={`btn pd-add-btn ${soldOut ? 'btn-disabled' : 'btn-navy'}`}
                onClick={handleAddToCart}
                disabled={soldOut}
                aria-label={soldOut ? 'Out of stock' : 'Add to cart'}
              >
                {addingToCart ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Added!
                  </>
                ) : soldOut ? 'Out of Stock' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                    Add to Cart
                  </>
                )}
              </button>
              {!soldOut && (
                <button
                  className="btn btn-primary pd-buy-btn"
                  onClick={handleBuyNow}
                  aria-label="Buy now"
                >
                  Buy Now
                </button>
              )}
              <button
                className={`pd-wishlist-btn ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={inWishlist}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? '#e53e3e' : 'none'} stroke={inWishlist ? '#e53e3e' : 'currentColor'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* Delivery info */}
            <div className="pd-delivery">
              <div className="pd-delivery-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--india-green)" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <strong>Free Delivery</strong>
                  <span> on orders above ₹149</span>
                </div>
              </div>
              <div className="pd-delivery-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <div>
                  <strong>Independence Day Special</strong>
                  <span> — Use FREEDOM25 or FREEDOM150</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section" aria-label="Related products">
            <div className="section-header">
              <h2>You May Also Like</h2>
            </div>
            <div className="related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
