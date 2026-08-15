import React from 'react'
import './SkeletonCard.css'

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-title short" />
        <div className="skeleton skeleton-stars" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
