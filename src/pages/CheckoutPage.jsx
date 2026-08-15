import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { orderService } from '../services/orderService'
import { addressService } from '../services/addressService'
import { productService } from '../services/productService'
import { formatPrice, generateOrderNumber } from '../utils/helpers'
import './CheckoutPage.css'

/* ─── India States + UTs ─── */
const INDIA_STATES_UTS = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
]

/* ─── Pincode lookup status ─── */
const PIN_IDLE    = 'idle'
const PIN_LOADING = 'loading'
const PIN_SUCCESS = 'success'
const PIN_ERROR   = 'error'

/* ─── Coupon definitions (mirrors CartContext) ─── */
const COUPON_DEFS = [
  { code: 'FREEDOM25', label: '25% Independence Day discount', type: 'percent', value: 25, minSubtotal: 199 },
  { code: 'FREEDOM150', label: '₹150 flat discount', type: 'flat', value: 150, minSubtotal: 999 }
]

const EMPTY_FORM = {
  fullName: '', phone: '', pincode: '', state: '', district: '',
  city: '', house: '', street: '', area: '',
  latitude: null, longitude: null
}

/* ─── Location button states ─── */
const LOC_IDLE    = 'idle'
const LOC_LOADING = 'loading'
const LOC_SUCCESS = 'success'
const LOC_ERROR   = 'error'

export default function CheckoutPage() {
  const {
    items, clearPurchasedItems, subtotal, discount, taxableAmount,
    cgst, sgst, deliveryFee, total, appliedCoupon,
    couponError, applyCoupon, removeCoupon,
    FREE_DELIVERY_THRESHOLD
  } = useCart()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [addressLoading, setAddressLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const orderPlacedRef = useRef(false)

  const [addrForm, setAddrForm] = useState({ ...EMPTY_FORM })
  const [addrErrors, setAddrErrors] = useState({})
  const [locationStatus, setLocationStatus] = useState(LOC_IDLE)
  const [locationMsg, setLocationMsg] = useState('')
  const [detectedCoords, setDetectedCoords] = useState(null)
  const [pinStatus, setPinStatus] = useState(PIN_IDLE)
  const [pinMsg, setPinMsg] = useState('')

  const fetchAddresses = useCallback(async () => {
    setAddressLoading(true)
    try {
      const addresses = await addressService.getAddressByUser(user.id)
      if (addresses && addresses.length > 0) {
        setSavedAddresses(addresses)
        setSelectedAddressId(addresses[0].id)
        setShowNewForm(false)
      } else {
        setSavedAddresses([])
        setShowNewForm(true)
      }
    } catch {
      setShowNewForm(true)
    } finally {
      setAddressLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    if (items.length === 0 && !orderPlacedRef.current) { navigate('/cart'); return }
    if (items.length > 0) fetchAddresses()
  }, [user, authLoading, navigate, items.length, fetchAddresses])

  /* ─── Form field handlers ─── */
  const setField = (field, value) => {
    setAddrForm(prev => ({ ...prev, [field]: value }))
    if (addrErrors[field]) setAddrErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setField('phone', val)
  }

  /* ─── Pincode → API lookup ─── */
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setAddrForm(prev => ({ ...prev, pincode: val }))
    if (addrErrors.pincode) setAddrErrors(prev => ({ ...prev, pincode: '' }))

    if (val.length === 6) {
      setPinStatus(PIN_LOADING)
      setPinMsg('')
      fetch(`https://api.postalpincode.in/pincode/${val}`)
        .then(r => r.json())
        .then(data => {
          const record = data?.[0]
          if (record?.Status === 'Success' && record.PostOffice?.length > 0) {
            const po = record.PostOffice[0]
            const apiState    = po.State    || ''
            const apiDistrict = po.District || ''
            const apiCity     = po.Name     || ''

            // Match API state string to our list (case-insensitive)
            const matched = INDIA_STATES_UTS.find(
              s => s.toLowerCase() === apiState.toLowerCase()
            ) || apiState

            setAddrForm(prev => ({
              ...prev,
              state:    matched,
              district: apiDistrict,
              city:     apiCity,
            }))
            setAddrErrors(prev => ({ ...prev, state: '', district: '', city: '', pincode: '' }))
            setPinStatus(PIN_SUCCESS)
            setPinMsg('✓ Address found')
          } else {
            setPinStatus(PIN_ERROR)
            setPinMsg('Unable to find this pincode. Please check and try again.')
          }
        })
        .catch(() => {
          setPinStatus(PIN_ERROR)
          setPinMsg('Unable to find this pincode. Please check and try again.')
        })
    } else {
      setPinStatus(PIN_IDLE)
      setPinMsg('')
    }
  }

  /* ─── Validation ─── */
  const validateAddress = (form) => {
    const errs = {}
    if (!form.fullName.trim())  errs.fullName = 'Full name is required'
    if (!form.phone.trim())     errs.phone    = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.pincode.trim())   errs.pincode  = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode))     errs.pincode = 'Enter a valid 6-digit pincode'
    if (!form.state.trim())     errs.state    = 'State / UT is required'
    if (!form.district.trim())  errs.district = 'District is required'
    if (!form.city.trim())      errs.city     = 'City is required'
    if (!form.house.trim())     errs.house    = 'House / Flat is required'
    if (!form.street.trim())    errs.street   = 'Street is required'
    return errs
  }

  /* ─── Save new address ─── */
  const handleSaveNewAddress = async () => {
    const errs = validateAddress(addrForm)
    if (Object.keys(errs).length > 0) { setAddrErrors(errs); return }
    try {
      const payload = { ...addrForm, userId: user.id }
      if (!detectedCoords) { delete payload.latitude; delete payload.longitude }
      const created = await addressService.createAddress(payload)
      setSavedAddresses(prev => [...prev, created])
      setSelectedAddressId(created.id)
      setShowNewForm(false)
      setAddrForm({ ...EMPTY_FORM })
      setAddrErrors({})
      setDetectedCoords(null)
      setLocationStatus(LOC_IDLE)
      setPinStatus(PIN_IDLE)
      setPinMsg('')
      addToast('Address saved successfully', 'success')
    } catch {
      addToast('Failed to save address. Please try again.', 'error')
    }
  }

  /* ─── Geolocation: coords only, user completes address manually ─── */
  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus(LOC_ERROR)
      setLocationMsg('Location detection is not supported by this browser.')
      return
    }
    setLocationStatus(LOC_LOADING)
    setLocationMsg('')
    setDetectedCoords(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setDetectedCoords({ latitude, longitude })
        setAddrForm(prev => ({ ...prev, latitude, longitude }))
        setLocationStatus(LOC_SUCCESS)
        setLocationMsg('Location detected. Please complete your address manually.')
        setShowNewForm(true)
      },
      (err) => {
        setLocationStatus(LOC_ERROR)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationMsg('Location permission was denied. Please enter your address manually.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationMsg('Unable to detect your location. Please enter your address manually.')
        } else if (err.code === err.TIMEOUT) {
          setLocationMsg('Location detection timed out. Please enter your address manually.')
        } else {
          setLocationMsg('Unable to detect your location. Please enter your address manually.')
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  /* ─── Coupon: apply by clicking suggestion ─── */
  const handleApplySuggestion = (code) => {
    const success = applyCoupon(code)
    if (success) addToast(`Coupon ${code} applied!`, 'success')
  }

  /* ─── Place order ─── */
  const getSelectedAddress = () => savedAddresses.find(a => a.id === selectedAddressId) || null

  const handlePlaceOrder = async () => {
    let deliveryAddress
    if (showNewForm) {
      const errs = validateAddress(addrForm)
      if (Object.keys(errs).length > 0) {
        setAddrErrors(errs)
        addToast('Please complete your delivery address', 'warning')
        return
      }
      deliveryAddress = addrForm
    } else {
      deliveryAddress = getSelectedAddress()
      if (!deliveryAddress) {
        addToast('Please select or add a delivery address', 'warning')
        return
      }
    }

    setPlacing(true)
    try {
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          const fresh = await productService.getProductById(item.id)
          return { item, fresh }
        })
      )
      for (const { item, fresh } of stockChecks) {
        if (fresh.stock < item.quantity) {
          addToast(`"${item.title}" only has ${fresh.stock} in stock. Please update your cart.`, 'error', 5000)
          setPlacing(false)
          return
        }
      }

      const orderData = {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          category: i.category,
          image: (i.images && i.images[0]) || i.image || '',
          price: i.price,
          originalPrice: i.originalPrice,
          quantity: i.quantity
        })),
        subtotal, couponCode: appliedCoupon?.code || null,
        discount, taxableAmount, cgst, sgst, deliveryFee, total,
        shippingAddress: deliveryAddress,
        status: 'Order Placed',
        createdAt: new Date().toISOString()
      }

      const createdOrder = await orderService.createOrder(orderData)

      await Promise.all(
        stockChecks.map(({ item, fresh }) =>
          productService.updateStock(item.id, fresh.stock - item.quantity)
        )
      )

      clearPurchasedItems(items.map(i => i.id))
      orderPlacedRef.current = true
      addToast('Order placed successfully!', 'success')
      navigate(`/order-confirmation/${createdOrder.id}`)
    } catch (err) {
      console.error('Order error:', err)
      addToast('Failed to place order. Please try again.', 'error')
    } finally {
      setPlacing(false)
    }
  }

  if (authLoading) return null
  if (!user) return null

  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)

  /* ─── Location button label ─── */
  const locationBtnLabel = {
    [LOC_IDLE]:    'Use My Current Location',
    [LOC_LOADING]: 'Detecting location...',
    [LOC_SUCCESS]: 'Location Detected',
    [LOC_ERROR]:   'Try Again'
  }[locationStatus]

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* ── LEFT ── */}
          <div className="checkout-left">

            {/* Delivery Address */}
            <section className="checkout-section" aria-label="Delivery address">
              <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Delivery Address
              </h2>

              {addressLoading ? (
                <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
              ) : (
                <>
                  {/* Saved address list */}
                  {savedAddresses.length > 0 && !showNewForm && (
                    <div className="saved-addr-list">
                      {savedAddresses.map(addr => (
                        <label
                          key={addr.id}
                          className={`saved-addr-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="delivery-address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="addr-radio"
                          />
                          <div className="addr-option-info">
                            <strong>{addr.fullName}</strong>
                            <span>{addr.house}, {addr.street}{addr.area ? `, ${addr.area}` : ''}</span>
                            <span>{addr.district ? `${addr.district}, ` : ''}{addr.city}, {addr.state} – {addr.pincode}</span>
                            <span>Phone: {addr.phone}</span>
                          </div>
                        </label>
                      ))}
                      <button
                        className="btn-link add-addr-link"
                        onClick={() => {
                          setShowNewForm(true)
                          setAddrForm({ ...EMPTY_FORM })
                          setLocationStatus(LOC_IDLE)
                          setLocationMsg('')
                          setPinStatus(PIN_IDLE)
                          setPinMsg('')
                        }}
                      >
                        + Add a new address
                      </button>
                    </div>
                  )}

                  {/* New address form */}
                  {showNewForm && (
                    <div className="address-form">

                      {/* Location button */}
                      <button
                        type="button"
                        className={`location-btn location-btn--${locationStatus}`}
                        onClick={handleUseLocation}
                        disabled={locationStatus === LOC_LOADING}
                        aria-label={locationBtnLabel}
                      >
                        {locationStatus === LOC_LOADING && <span className="location-spinner" aria-hidden="true" />}
                        {locationStatus === LOC_SUCCESS && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {locationStatus === LOC_ERROR && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        )}
                        {locationStatus === LOC_IDLE && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                          </svg>
                        )}
                        {locationBtnLabel}
                      </button>

                      {/* Location message */}
                      {locationMsg && (
                        <div className={`location-msg location-msg--${locationStatus}`} role="alert">
                          {locationMsg}
                        </div>
                      )}

                      {/* Detected coords */}
                      {detectedCoords && (
                        <div className="location-coords">
                          Detected coordinates: {detectedCoords.latitude.toFixed(5)}°N, {detectedCoords.longitude.toFixed(5)}°E
                        </div>
                      )}

                      {/* Full Name + Phone */}
                      <div className="addr-grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="co-fullName">Full Name *</label>
                          <input
                            id="co-fullName"
                            type="text"
                            className={`form-input ${addrErrors.fullName ? 'error' : ''}`}
                            value={addrForm.fullName}
                            onChange={e => setField('fullName', e.target.value)}
                            placeholder="Full name"
                            autoComplete="name"
                          />
                          {addrErrors.fullName && <p className="form-error">{addrErrors.fullName}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="co-phone">Phone * (10 digits)</label>
                          <input
                            id="co-phone"
                            type="tel"
                            inputMode="numeric"
                            className={`form-input ${addrErrors.phone ? 'error' : ''}`}
                            value={addrForm.phone}
                            onChange={handlePhoneChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            autoComplete="tel"
                          />
                          {addrErrors.phone && <p className="form-error">{addrErrors.phone}</p>}
                        </div>
                      </div>

                      {/* Pincode — triggers API lookup at 6 digits */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-pincode">Pincode *</label>
                        <input
                          id="co-pincode"
                          type="text"
                          inputMode="numeric"
                          className={`form-input ${addrErrors.pincode ? 'error' : ''} ${pinStatus === PIN_ERROR ? 'error' : ''}`}
                          value={addrForm.pincode}
                          onChange={handlePincodeChange}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                        />
                        {pinStatus === PIN_LOADING && (
                          <p className="pin-status pin-status--loading">
                            <span className="location-spinner" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
                            Finding address...
                          </p>
                        )}
                        {pinStatus === PIN_SUCCESS && (
                          <p className="pin-status pin-status--success">{pinMsg}</p>
                        )}
                        {pinStatus === PIN_ERROR && (
                          <p className="pin-status pin-status--error">{pinMsg}</p>
                        )}
                        {addrErrors.pincode && pinStatus === PIN_IDLE && (
                          <p className="form-error">{addrErrors.pincode}</p>
                        )}
                      </div>

                      {/* State */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-state">State / Union Territory *</label>
                        <select
                          id="co-state"
                          className={`form-input ${addrErrors.state ? 'error' : ''}`}
                          value={addrForm.state}
                          onChange={e => setField('state', e.target.value)}
                        >
                          <option value="">Select state / UT</option>
                          {INDIA_STATES_UTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {addrErrors.state && <p className="form-error">{addrErrors.state}</p>}
                      </div>

                      {/* District */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-district">District *</label>
                        <input
                          id="co-district"
                          type="text"
                          className={`form-input ${addrErrors.district ? 'error' : ''}`}
                          value={addrForm.district}
                          onChange={e => setField('district', e.target.value)}
                          placeholder="District (auto-filled or enter manually)"
                        />
                        {addrErrors.district && <p className="form-error">{addrErrors.district}</p>}
                      </div>

                      {/* City */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-city">City *</label>
                        <input
                          id="co-city"
                          type="text"
                          className={`form-input ${addrErrors.city ? 'error' : ''}`}
                          value={addrForm.city}
                          onChange={e => setField('city', e.target.value)}
                          placeholder="City (auto-filled or enter manually)"
                        />
                        {addrErrors.city && <p className="form-error">{addrErrors.city}</p>}
                      </div>

                      {/* House */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-house">House / Flat / Building *</label>
                        <input
                          id="co-house"
                          type="text"
                          className={`form-input ${addrErrors.house ? 'error' : ''}`}
                          value={addrForm.house}
                          onChange={e => setField('house', e.target.value)}
                          placeholder="House No., Building, Apartment"
                        />
                        {addrErrors.house && <p className="form-error">{addrErrors.house}</p>}
                      </div>

                      {/* Street */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-street">Street *</label>
                        <input
                          id="co-street"
                          type="text"
                          className={`form-input ${addrErrors.street ? 'error' : ''}`}
                          value={addrForm.street}
                          onChange={e => setField('street', e.target.value)}
                          placeholder="Street, Road, Colony"
                        />
                        {addrErrors.street && <p className="form-error">{addrErrors.street}</p>}
                      </div>

                      {/* Area (optional) */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="co-area">Area / Locality</label>
                        <input
                          id="co-area"
                          type="text"
                          className="form-input"
                          value={addrForm.area}
                          onChange={e => setField('area', e.target.value)}
                          placeholder="Area or locality (optional)"
                        />
                      </div>

                      {/* Actions */}
                      <div className="addr-form-btns">
                        <button className="btn btn-navy" onClick={handleSaveNewAddress}>
                          Save &amp; Use This Address
                        </button>
                        {savedAddresses.length > 0 && (
                          <button
                            className="btn btn-outline"
                            onClick={() => {
                              setShowNewForm(false)
                              setAddrErrors({})
                              setLocationStatus(LOC_IDLE)
                              setLocationMsg('')
                              setPinStatus(PIN_IDLE)
                              setPinMsg('')
                            }}
                          >
                            Use Saved Address
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Order items */}
            <section className="checkout-section" aria-label="Order items">
              <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Order Items ({items.length})
              </h2>
              <div className="checkout-items">
                {items.map(item => (
                  <div key={item.id} className="checkout-item">
                    <img
                      src={(item.images && item.images[0]) || item.image || ''}
                      alt={item.title}
                      className="co-item-img"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=120&q=60' }}
                    />
                    <div className="co-item-info">
                      <p className="co-item-title">{item.title}</p>
                      <p className="co-item-cat">{item.category}</p>
                    </div>
                    <div className="co-item-right">
                      <span className="co-qty">×{item.quantity}</span>
                      <span className="co-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT ── */}
          <div className="checkout-right">

            {/* Free delivery bar */}
            {freeDeliveryRemaining > 0 ? (
              <div className="checkout-delivery-bar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Add <strong>{formatPrice(freeDeliveryRemaining)}</strong> more to unlock FREE delivery
              </div>
            ) : (
              <div className="checkout-delivery-bar unlocked">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                FREE delivery unlocked!
              </div>
            )}

            {/* ── Coupon section ── */}
            <div className="checkout-section">
              <h2>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Coupon
              </h2>

              {/* Applied coupon */}
              {appliedCoupon && (
                <div className="coupon-applied-banner">
                  <div className="coupon-applied-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      <code>{appliedCoupon.code}</code> applied — {formatPrice(discount)} off
                    </span>
                  </div>
                  <button
                    className="coupon-remove-btn"
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Manual coupon input */}
              {!appliedCoupon && (
                <div className="coupon-manual-row">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className={`coupon-input ${couponError ? 'error' : ''}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const success = applyCoupon(e.target.value)
                        if (success) { addToast('Coupon applied!', 'success'); e.target.value = '' }
                      }
                    }}
                    aria-label="Coupon code"
                  />
                  <button
                    className="btn btn-navy coupon-apply-btn"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      const success = applyCoupon(input.value)
                      if (success) { addToast('Coupon applied!', 'success'); input.value = '' }
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}

              {/* Coupon suggestion cards */}
              <div className="coupon-suggestions">
                {COUPON_DEFS.map(cpn => {
                  const isActive = appliedCoupon?.code === cpn.code
                  const otherActive = appliedCoupon && appliedCoupon.code !== cpn.code
                  const eligible = subtotal >= cpn.minSubtotal
                  const needed = cpn.minSubtotal - subtotal

                  return (
                    <div key={cpn.code} className={`coupon-card ${isActive ? 'coupon-card--active' : ''}`}>
                      <div className="coupon-card-left">
                        <code className="coupon-card-code">{cpn.code}</code>
                        <p className="coupon-card-label">{cpn.label}</p>
                        <p className="coupon-card-condition">
                          Min. order {formatPrice(cpn.minSubtotal)}
                        </p>
                      </div>
                      <div className="coupon-card-right">
                        {isActive ? (
                          <span className="coupon-tag-active">Applied</span>
                        ) : otherActive ? (
                          <button
                            className="btn coupon-swap-btn"
                            onClick={() => { removeCoupon(); handleApplySuggestion(cpn.code) }}
                            disabled={!eligible}
                          >
                            {eligible ? 'Switch' : `Add ${formatPrice(needed)}`}
                          </button>
                        ) : eligible ? (
                          <button
                            className="btn btn-primary coupon-suggest-btn"
                            onClick={() => handleApplySuggestion(cpn.code)}
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="coupon-tag-locked">
                            Add {formatPrice(needed)} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Bill summary ── */}
            <div className="checkout-section bill-section">
              <h2>Order Summary</h2>
              <div className="bill-row">
                <span>Product Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="bill-row discount-row">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>– {formatPrice(discount)}</span>
                </div>
              )}
              <div className="bill-row">
                <span>Taxable Amount</span><span>{formatPrice(taxableAmount)}</span>
              </div>
              <div className="bill-row tax-row">
                <span>CGST (9%)</span><span>{formatPrice(cgst)}</span>
              </div>
              <div className="bill-row tax-row">
                <span>SGST (9%)</span><span>{formatPrice(sgst)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'free-delivery-text' : ''}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="bill-divider" />
              <div className="bill-row total-row">
                <span>Grand Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
              aria-busy={placing}
            >
              {placing ? (
                <><span className="spinner" aria-hidden="true" /> Placing Order...</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
