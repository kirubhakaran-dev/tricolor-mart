import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../services/productService'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/common/SkeletonCard'
import './ProductsPage.css'

const CATEGORIES = [
  'Flags & Tricolour',
  'Indian Sweets',
  'Freedom Heroes',
  'Freedom & History',
  'Indian Art & Crafts',
  'Patriotic Clothing',
  'Independence Day Decor',
  'Patriotic Gifts & Accessories'
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' }
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const cat = searchParams.get('category') || ''
    const q = searchParams.get('search') || ''
    setSelectedCategory(cat)
    setSearch(q)
  }, [searchParams])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getAllProducts()
      setAllProducts(data)
    } catch {
      setError('We\'re having trouble loading the collection.')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useCallback(() => {
    let result = [...allProducts]

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      )
    }

    // Category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Price
    if (minPrice !== '') result = result.filter(p => p.price >= Number(minPrice))
    if (maxPrice !== '') result = result.filter(p => p.price <= Number(maxPrice))

    // Rating
    if (minRating !== '') result = result.filter(p => p.rating >= Number(minRating))

    // Stock
    if (inStockOnly) result = result.filter(p => p.stock > 0)

    // Sort
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
      case 'name_asc': result.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'name_desc': result.sort((a, b) => b.title.localeCompare(a.title)); break
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }

    return result
  }, [allProducts, search, selectedCategory, minPrice, maxPrice, minRating, inStockOnly, sortBy])

  const results = filteredProducts()

  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice || minRating || inStockOnly

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
    setMinRating('')
    setInStockOnly(false)
    setSortBy('recommended')
    setSearchParams({})
  }

  const handleCategoryClick = (cat) => {
    const next = selectedCategory === cat ? '' : cat
    setSelectedCategory(next)
    if (next) setSearchParams({ category: next })
    else setSearchParams({})
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>We're having trouble loading the collection.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Please ensure JSON Server is running on port 3001.</p>
          <button className="btn btn-primary" onClick={loadProducts}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page page-enter">
      {/* Page header */}
      <div className="products-hero">
        <div className="container">
          <h1>Independence Day Collection</h1>
          <p>Celebrate freedom with our curated selection of patriotic products</p>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`} aria-label="Product filters">
            <div className="filters-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Search in sidebar */}
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="filter-search-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="filter-search-input"
                  aria-label="Search products"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="filter-clear-x" aria-label="Clear search">×</button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="category-filters">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="price-input"
                  min="0"
                  aria-label="Minimum price"
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="price-input"
                  min="0"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="filter-group">
              <label className="filter-label">Minimum Rating</label>
              <div className="rating-filters">
                {[
                  { value: '', label: 'All' },
                  { value: '3', label: '3★ & above' },
                  { value: '4', label: '4★ & above' },
                  { value: '4.5', label: '4.5★ & above' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`rating-filter-btn ${minRating === opt.value ? 'active' : ''}`}
                    onClick={() => setMinRating(opt.value)}
                    aria-pressed={minRating === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="filter-group">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  aria-label="Show in-stock items only"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Main content */}
          <main className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                <button
                  className="mobile-filter-btn mobile-only"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  aria-expanded={filtersOpen}
                  aria-controls="filters-sidebar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
                  </svg>
                  Filters {hasActiveFilters && <span className="filter-active-dot" />}
                </button>
                <span className="result-count">
                  {loading ? 'Loading...' : `${results.length} product${results.length !== 1 ? 's' : ''}`}
                </span>
                {hasActiveFilters && (
                  <button className="clear-filters-inline" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
              <div className="toolbar-right">
                <label className="sort-label" htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="sort-select"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="active-filters">
                {selectedCategory && (
                  <span className="filter-chip">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} aria-label={`Remove ${selectedCategory} filter`}>×</button>
                  </span>
                )}
                {search && (
                  <span className="filter-chip">
                    "{search}"
                    <button onClick={() => setSearch('')} aria-label="Remove search filter">×</button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="filter-chip">
                    ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                    <button onClick={() => { setMinPrice(''); setMaxPrice('') }} aria-label="Remove price filter">×</button>
                  </span>
                )}
                {minRating && (
                  <span className="filter-chip">
                    {minRating}★+
                    <button onClick={() => setMinRating('')} aria-label="Remove rating filter">×</button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="filter-chip">
                    In Stock
                    <button onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <SkeletonGrid count={8} />
            ) : results.length === 0 ? (
              <div className="products-empty">
                <div className="empty-icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {results.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
