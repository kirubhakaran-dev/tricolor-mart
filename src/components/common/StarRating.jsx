const StarFull = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
)

const StarHalf = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#d1d5db" />
      </linearGradient>
    </defs>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#half)" />
  </svg>
)

const StarEmpty = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#d1d5db" aria-hidden="true">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
)

export default function StarRating({ rating, reviewCount, size = 'sm' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const starSize = size === 'lg' ? '18' : '13'

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
      aria-label={`${rating} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <span style={{ display: 'flex', gap: '1px' }}>
        {Array.from({ length: full }, (_, i) => <StarFull key={`f${i}`} size={starSize} />)}
        {half && <StarHalf size={starSize} />}
        {Array.from({ length: empty }, (_, i) => <StarEmpty key={`e${i}`} size={starSize} />)}
      </span>
      {reviewCount !== undefined && (
        <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '4px' }}>
          ({reviewCount})
        </span>
      )}
    </span>
  )
}
