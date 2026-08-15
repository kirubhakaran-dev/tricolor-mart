import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '5rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 800,
          color: 'var(--navy)',
          lineHeight: 1
        }}>404</div>
        <h2 style={{ marginTop: 16, marginBottom: 12, color: 'var(--text-primary)' }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          This page doesn't exist. Let's get you back to the Independence Day collection.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}
