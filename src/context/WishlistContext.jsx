import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { wishlistService } from '../services/wishlistService'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistId, setWishlistId] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const lists = await wishlistService.getWishlistByUser(user.id)
      if (lists && lists.length > 0) {
        setWishlistItems(lists[0].items || [])
        setWishlistId(lists[0].id)
      } else {
        const created = await wishlistService.createWishlist({ userId: user.id, items: [] })
        setWishlistItems([])
        setWishlistId(created.id)
      }
    } catch (e) {
      console.error('Wishlist fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlistItems([])
      setWishlistId(null)
    }
  }, [user, fetchWishlist])

  const saveWishlist = async (newItems) => {
    if (!user || !wishlistId) return
    try {
      await wishlistService.updateWishlist(wishlistId, { items: newItems })
    } catch (e) {
      console.error('Wishlist save error', e)
    }
  }

  const addToWishlist = async (product) => {
    if (wishlistItems.find(i => i.id === product.id)) return
    const newItems = [...wishlistItems, product]
    setWishlistItems(newItems)
    await saveWishlist(newItems)
  }

  const removeFromWishlist = async (productId) => {
    const newItems = wishlistItems.filter(i => i.id !== productId)
    setWishlistItems(newItems)
    await saveWishlist(newItems)
  }

  const isInWishlist = (productId) => wishlistItems.some(i => i.id === productId)

  return (
    <WishlistContext.Provider value={{
      wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, loading, fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
