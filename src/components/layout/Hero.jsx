import { Link } from 'react-router-dom'
import './Hero.css'

// Inline waving flag SVG with CSS wave animation
function WavingFlagHero() {
  return (
    <div className="hero-flag-container" aria-hidden="true">
      <svg
        className="hero-flag-svg"
        viewBox="0 0 500 333"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="heroFabric">
            <feTurbulence type="turbulence" baseFrequency="0.015 0.08" numOctaves="3" result="noise" seed="2">
              <animate attributeName="baseFrequency" values="0.015 0.08;0.02 0.1;0.015 0.08" dur="4s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id="sheenHero" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="shadowLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="15%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>

        {/* Main flag bands with fabric filter */}
        <g filter="url(#heroFabric)" className="hero-flag-bands">
          <rect x="0" y="0" width="500" height="111" fill="#FF9933" />
          <rect x="0" y="111" width="500" height="111" fill="#FFFFFF" />
          <rect x="0" y="222" width="500" height="111" fill="#138808" />
        </g>

        {/* Chakra on top (no filter for clarity) */}
        <g className="hero-chakra" transform="translate(250, 166.5)">
          <circle cx="0" cy="0" r="48" fill="none" stroke="#000080" strokeWidth="3.5" />
          <circle cx="0" cy="0" r="8" fill="#000080" />
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15 * Math.PI) / 180
            return (
              <line
                key={i}
                x1={Math.sin(angle) * 8} y1={-Math.cos(angle) * 8}
                x2={Math.sin(angle) * 45} y2={-Math.cos(angle) * 45}
                stroke="#000080" strokeWidth="2.5"
              />
            )
          })}
        </g>

        {/* Sheen overlay */}
        <rect x="0" y="0" width="500" height="333" fill="url(#sheenHero)" className="hero-sheen" />

        {/* Left edge shadow */}
        <rect x="0" y="0" width="80" height="333" fill="url(#shadowLeft)" />

        {/* Fabric fold lines */}
        <line x1="125" y1="0" x2="118" y2="333" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
        <line x1="270" y1="0" x2="265" y2="333" stroke="rgba(0,0,0,0.03)" strokeWidth="6" />
        <line x1="400" y1="0" x2="396" y2="333" stroke="rgba(0,0,0,0.03)" strokeWidth="5" />
      </svg>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="hero" aria-label="Independence Day Hero">
      {/* Background decorative elements */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg-circle hero-bg-c1" />
        <div className="hero-bg-circle hero-bg-c2" />
        <div className="hero-bg-chakra">
          {/* Large decorative Ashoka Chakra */}
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
            <circle cx="100" cy="100" r="14" fill="rgba(255,255,255,0.04)" />
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i * 15 * Math.PI) / 180
              return (
                <line key={i}
                  x1={100 + Math.sin(a) * 14} y1={100 - Math.cos(a) * 14}
                  x2={100 + Math.sin(a) * 86} y2={100 - Math.cos(a) * 86}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"
                />
              )
            })}
          </svg>
        </div>
      </div>

      <div className="hero-inner container">
        <div className="hero-content">
          {/* Heritage tag */}
          <div className="hero-tag">
            <span className="hero-tag-dot saffron" />
            <span>79th Independence Day</span>
            <span className="hero-tag-dot green" />
          </div>

          {/* Brand with flag behind */}
          <div className="hero-brand">
            <WavingFlagHero />
            <div className="hero-brand-text">
              <h1 className="hero-title">
                <span className="hero-title-tri">TRICOLOR</span>
                <span className="hero-title-mart">MART</span>
              </h1>
            </div>
          </div>

          <p className="hero-tagline">Celebrate Freedom – Shop with Pride</p>

          <p className="hero-sub">
            Curated Independence Day collection — from heritage crafts and freedom fighter art<br className="desktop-only" /> to patriotic clothing and authentic Indian sweets.
          </p>

          <div className="hero-ctas">
            <Link to="/products" className="btn btn-primary hero-cta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Shop the Collection
            </Link>
            <Link to="/products?category=Freedom+Heroes" className="btn btn-outline-light hero-cta">
              Freedom Fighters
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">40+</span>
              <span className="hero-stat-label">Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">10</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">2</span>
              <span className="hero-stat-label">Freedom Coupons</span>
            </div>
          </div>
        </div>

        {/* Coupon teaser */}
        <div className="hero-coupon-strip" role="complementary" aria-label="Independence Day offers">
          <div className="coupon-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <code>FREEDOM25</code>
            <span>— 25% off above ₹199</span>
          </div>
          <div className="coupon-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <code>FREEDOM150</code>
            <span>— ₹150 off above ₹999</span>
          </div>
        </div>
      </div>
    </section>
  )
}
