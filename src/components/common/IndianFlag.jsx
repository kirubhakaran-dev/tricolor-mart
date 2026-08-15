import React from 'react'
import './IndianFlag.css'

// SVG Indian Flag - no emoji, proper tricolour with Ashoka Chakra
export default function IndianFlag({ size = 'md', className = '', animate = false }) {
  const sizes = {
    xs: { width: 36, height: 24 },
    sm: { width: 60, height: 40 },
    md: { width: 90, height: 60 },
    lg: { width: 150, height: 100 },
    xl: { width: 240, height: 160 },
    hero: { width: 420, height: 280 }
  }
  const { width, height } = sizes[size] || sizes.md

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 420 280"
      xmlns="http://www.w3.org/2000/svg"
      className={`indian-flag ${animate ? 'flag-wave' : ''} ${className}`}
      role="img"
      aria-label="Indian National Flag"
    >
      {/* Saffron band */}
      <rect x="0" y="0" width="420" height="93.3" fill="#FF9933" />
      {/* White band */}
      <rect x="0" y="93.3" width="420" height="93.4" fill="#FFFFFF" />
      {/* Green band */}
      <rect x="0" y="186.7" width="420" height="93.3" fill="#138808" />

      {/* Ashoka Chakra */}
      <g transform="translate(210, 140)">
        {/* Outer circle */}
        <circle cx="0" cy="0" r="38" fill="none" stroke="#000080" strokeWidth="2.5" />
        {/* Inner circle */}
        <circle cx="0" cy="0" r="6" fill="#000080" />
        {/* 24 spokes */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const x1 = Math.sin(angle) * 6
          const y1 = -Math.cos(angle) * 6
          const x2 = Math.sin(angle) * 36
          const y2 = -Math.cos(angle) * 36
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="#000080"
              strokeWidth="1.5"
            />
          )
        })}
      </g>
    </svg>
  )
}

// Waving flag for hero section using CSS clip-path animation
export function WavingFlag({ className = '' }) {
  return (
    <div className={`waving-flag-container ${className}`} aria-label="Indian National Flag waving">
      <svg
        viewBox="0 0 500 333"
        xmlns="http://www.w3.org/2000/svg"
        className="waving-flag-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="flagClip">
            <rect x="0" y="0" width="500" height="333" />
          </clipPath>
          <filter id="fabricShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        {/* Flag body with fabric-like wave effect via CSS */}
        <g className="flag-fabric" clipPath="url(#flagClip)" filter="url(#fabricShadow)">
          {/* Saffron */}
          <rect x="0" y="0" width="500" height="111" fill="#FF9933" />
          {/* White */}
          <rect x="0" y="111" width="500" height="111" fill="#FFFFFF" />
          {/* Green */}
          <rect x="0" y="222" width="500" height="111" fill="#138808" />
        </g>

        {/* Ashoka Chakra */}
        <g className="chakra-group" transform="translate(250, 166.5)">
          <circle cx="0" cy="0" r="44" fill="none" stroke="#000080" strokeWidth="3" />
          <circle cx="0" cy="0" r="7" fill="#000080" />
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15 * Math.PI) / 180
            const x1 = Math.sin(angle) * 7
            const y1 = -Math.cos(angle) * 7
            const x2 = Math.sin(angle) * 42
            const y2 = -Math.cos(angle) * 42
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="2" />
            )
          })}
        </g>

        {/* Fabric fold overlays for depth */}
        <g className="flag-folds" opacity="0.08">
          <rect x="80" y="0" width="15" height="333" fill="#000" />
          <rect x="200" y="0" width="10" height="333" fill="#000" />
          <rect x="330" y="0" width="12" height="333" fill="#000" />
          <rect x="440" y="0" width="8" height="333" fill="#000" />
        </g>

        {/* Fabric sheen */}
        <g className="flag-sheen" opacity="0.06">
          <rect x="0" y="0" width="500" height="333" fill="url(#sheenGrad)" />
        </g>
        <defs>
          <linearGradient id="sheenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Compact flag for navbar logo
export function FlagIcon({ className = '' }) {
  return (
    <svg
      width="32"
      height="22"
      viewBox="0 0 90 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Indian flag"
      role="img"
    >
      <rect x="0" y="0" width="90" height="20" fill="#FF9933" />
      <rect x="0" y="20" width="90" height="20" fill="#FFFFFF" />
      <rect x="0" y="40" width="90" height="20" fill="#138808" />
      <g transform="translate(45, 30)">
        <circle cx="0" cy="0" r="7" fill="none" stroke="#000080" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="1.5" fill="#000080" />
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          return (
            <line
              key={i}
              x1={Math.sin(angle) * 1.5} y1={-Math.cos(angle) * 1.5}
              x2={Math.sin(angle) * 6.5} y2={-Math.cos(angle) * 6.5}
              stroke="#000080" strokeWidth="0.8"
            />
          )
        })}
      </g>
    </svg>
  )
}
