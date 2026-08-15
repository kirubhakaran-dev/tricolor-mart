import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const DELIVERY_FEE = 40
const FREE_DELIVERY_THRESHOLD = 149
const CGST_RATE = 0.09
const SGST_RATE = 0.09

const COUPONS = {
  FREEDOM25: { type: 'percent', value: 25, minSubtotal: 199 },
  FREEDOM150: { type: 'flat', value: 150, minSubtotal: 999 }
}

export { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, COUPONS }

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tricolor_cart') || '[]')
    } catch { return [] }
  })
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  useEffect(() => {
    localStorage.setItem('tricolor_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        const newQty = existing.quantity + qty
        if (newQty > product.stock) return prev
        return prev.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      }
      return [...prev, { ...product, quantity: qty }]
    })
  }

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id, qty, stock) => {
    if (qty < 1) {
      removeFromCart(id)
      return
    }
    if (qty > stock) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setItems([])

  const clearPurchasedItems = (purchasedIds) => {
    setItems(prev => prev.filter(i => !purchasedIds.includes(i.id)))
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase()
    const coupon = COUPONS[normalized]
    if (!coupon) {
      setCouponError('Invalid coupon code.')
      setAppliedCoupon(null)
      return false
    }
    if (subtotal < coupon.minSubtotal) {
      setCouponError(`Minimum subtotal of ₹${coupon.minSubtotal} required for this coupon.`)
      setAppliedCoupon(null)
      return false
    }
    setCouponError('')
    setAppliedCoupon({ code: normalized, ...coupon })
    return true
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(subtotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0

  const taxableAmount = subtotal - discount
  const cgst = Math.round(taxableAmount * CGST_RATE * 100) / 100
  const sgst = Math.round(taxableAmount * SGST_RATE * 100) / 100
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = taxableAmount + cgst + sgst + deliveryFee

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, clearPurchasedItems,
      subtotal, discount, taxableAmount, cgst, sgst, deliveryFee, total, itemCount,
      couponCode, setCouponCode, couponError, appliedCoupon, applyCoupon, removeCoupon,
      DELIVERY_FEE, FREE_DELIVERY_THRESHOLD
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
