import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import Hero from '../components/layout/Hero'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/common/SkeletonCard'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getStockLabel } from '../utils/helpers'
import './HomePage.css'

const CATEGORIES = [
  {
    name: 'Flags & Tricolour',
    image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=500&q=80',
    desc: 'Proud display of the tricolour'
  },
  {
    name: 'Indian Sweets',
    image: 'https://i.pinimg.com/1200x/a7/5a/eb/a75aeb8f7e164a652c9fd34201647c02.jpg',
    desc: 'Mithai, sweets & festive treats'
  },
  {
    name: 'Freedom Heroes',
    image: 'https://i.pinimg.com/736x/36/af/89/36af8939e1c94f0e67d9b6ea87e69ecb.jpg',
    desc: 'Tribute art & heritage prints'
  },
  {
    name: 'Freedom & History',
    image: 'https://i.pinimg.com/1200x/0c/1a/b5/0c1ab5ac7ea344064ca634f0fe038276.jpg',
    desc: 'Books, posters & history'
  },
  {
    name: 'Indian Art & Crafts',
    image: 'https://i.pinimg.com/736x/9d/3b/a8/9d3ba813f09513730933da51df89fd01.jpg',
    desc: 'Madhubani, Warli & more'
  },
  {
    name: 'Patriotic Clothing',
    image: 'https://i.pinimg.com/736x/70/d3/75/70d375bb2711b0de0c3cc67cc03626e7.jpg',
    desc: 'Kurtas, t-shirts & festive wear'
  },
  {
    name: 'Independence Day Decor',
    image: 'https://i.pinimg.com/736x/9b/b2/62/9bb26285a1f84bd8939e4749099c31ad.jpg',
    desc: 'Buntings, balloons & banners'
  },
  {
    name: 'Patriotic Gifts & Accessories',
    image: 'https://i.pinimg.com/1200x/8b/d7/f7/8bd7f75bf54559fbcdb1ad6848fb9beb.jpg',
    desc: 'Hampers, badges & keychains'
  }
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch {
      setError('We\'re having trouble loading the collection.')
    } finally {
      setLoading(false)
    }
  }

  const featuredProducts = products.filter(p => p.featured).slice(0, 8)
  const limitedStockProducts = products.filter(p => p.stock > 0 && p.stock <= 3).slice(0, 6)

  if (error) {
    return (
      <div className="error-state">
        <div className="container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>We're having trouble loading the collection.</h2>
          <p>Please ensure JSON Server is running on port 3001.</p>
          <button className="btn btn-primary" onClick={loadProducts}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <Hero />

      {/* Shop by Category */}
      <section className="section categories-section chakra-bg" aria-label="Shop by category">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our curated Independence Day collections across every category</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
                aria-label={`Browse ${cat.name}`}
              >
                <div className="category-img-wrap">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="category-overlay" />
                </div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section" aria-label="Featured products">
        <div className="container">
          <div className="section-header">
            <h2>Independence Day Collection</h2>
            <p>Handpicked products to celebrate 79 years of independence</p>
          </div>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            <>
              <div className="products-grid">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="section-cta">
                <Link to="/products" className="btn btn-navy">
                  View All Products
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Limited Stock Section */}
      {!loading && limitedStockProducts.length > 0 && (
        <section className="section limited-section" aria-label="Limited stock products">
          <div className="container">
            <div className="limited-header">
              <div className="limited-badge">
                <span className="limited-pulse" aria-hidden="true" />
                Almost Gone
              </div>
              <h2>Limited Stock – Act Fast</h2>
              <p>These products are nearly sold out. Don't miss your chance.</p>
            </div>
            <div className="limited-grid">
              {limitedStockProducts.map(product => (
                <LimitedStockCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Independence Day Offers Banner */}
      <section className="offers-section" aria-label="Independence Day offers">
        <div className="container">
          <div className="offers-grid">
            <div className="offer-card offer-saffron">
              <div className="offer-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <code className="offer-code">FREEDOM25</code>
                <p className="offer-desc">25% off on orders above ₹199</p>
                <p className="offer-fine">Independence Day Special</p>
              </div>
            </div>
            <div className="offer-card offer-green">
              <div className="offer-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <code className="offer-code">FREEDOM150</code>
                <p className="offer-desc">Flat ₹150 off on orders above ₹999</p>
                <p className="offer-fine">Independence Day Premium</p>
              </div>
            </div>
            <div className="offer-card offer-navy">
              <div className="offer-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="offer-code" style={{fontSize:'1rem'}}>FREE Delivery</p>
                <p className="offer-desc">On all orders above ₹149</p>
                <p className="offer-fine">No minimum for flag products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="heritage-section section" aria-label="Indian heritage">
        <div className="container">
          <div className="heritage-inner">
            <div className="heritage-content">
              <span className="heritage-tag">Our Heritage</span>
              <h2>Honouring India's Journey to Freedom</h2>
              <p>
                Every product in our Freedom Fighters collection is created with historical reverence.
                From portrait art prints to heritage framed artwork — each piece honours the courage
                of those who shaped our nation.
              </p>
              <p>
                Our Indian Art & Crafts category supports artisans from Mithila, Odisha and Maharashtra,
                keeping India's rich artistic traditions alive.
              </p>
              <Link to="/products?category=Freedom+Heroes" className="btn btn-primary">
                Explore Freedom Heroes
              </Link>
            </div>
            <div className="heritage-visual" aria-hidden="true">
              <div className="heritage-chakra">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,153,51,0.2)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(255,153,51,0.15)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="12" fill="rgba(255,153,51,0.3)" />
                  {Array.from({ length: 24 }, (_, i) => {
                    const a = (i * 15 * Math.PI) / 180
                    return (
                      <line key={i}
                        x1={100 + Math.sin(a) * 12} y1={100 - Math.cos(a) * 12}
                        x2={100 + Math.sin(a) * 82} y2={100 - Math.cos(a) * 82}
                        stroke="rgba(255,153,51,0.2)" strokeWidth="1.5"
                      />
                    )
                  })}
                </svg>
              </div>
              <div className="heritage-numbers">
                <div className="hn-item">
                  <span className="hn-num">1947</span>
                  <span className="hn-lbl">Year of Independence</span>
                </div>
                <div className="hn-item">
                  <span className="hn-num">79</span>
                  <span className="hn-lbl">Years of Independence</span>
                </div>
                <div className="hn-item">
                  <span className="hn-num">24</span>
                  <span className="hn-lbl">Ashoka Chakra Spokes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta section" aria-label="Call to action">
        <div className="container">
          <div className="final-cta-inner">
            <h2>Ready to Celebrate?</h2>
            <p>Join thousands of Indians honouring independence with pride. Shop our full collection today.</p>
            <div className="final-cta-btns">
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
              {!user && (
                <Link to="/register" className="btn btn-outline">Create Account</Link>
              )}
              {user && (
                <Link to="/orders" className="btn btn-outline">My Orders</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function LimitedStockCard({ product }) {
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const { label } = getStockLabel(product.stock)

  const handleAdd = () => {
    addToCart(product, 1)
    addToast(`${product.title} added to cart`, 'success')
  }

  return (
    <div className="limited-card">
      <div className="limited-card-img" onClick={() => navigate(`/products/${product.id}`)}>
        <img src={(product.images && product.images[0]) || product.image} alt={product.title} loading="lazy" />
        <div className="limited-card-stock">
          <span className="limited-stock-pulse" aria-hidden="true" />
          {label}
        </div>
      </div>
      <div className="limited-card-info">
        <p className="limited-card-cat">{product.category}</p>
        <h3 className="limited-card-title" onClick={() => navigate(`/products/${product.id}`)}>
          {product.title}
        </h3>
        <div className="limited-card-price-row">
          <span className="limited-price">{formatPrice(product.price)}</span>
          <span className="limited-original">{formatPrice(product.originalPrice)}</span>
          <span className="limited-discount">{product.discount}% off</span>
        </div>
        <button className="btn btn-primary limited-btn" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  )
}
