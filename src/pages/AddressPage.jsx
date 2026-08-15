import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { addressService } from '../services/addressService'
import './AddressPage.css'

const INDIA_STATES = [
  // 28 States
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // 8 Union Territories
  'Andaman & Nicobar Islands', 'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

export default function AddressPage() {
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [savedAddress, setSavedAddress] = useState(null)
  const [addressId, setAddressId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    fullName: '', phone: '', house: '', street: '', area: '', city: '', state: '', pincode: ''
  })
  const [errors, setErrors] = useState({})

  const fetchAddress = useCallback(async () => {
    setLoading(true)
    try {
      const addresses = await addressService.getAddressByUser(user.id)
      if (addresses && addresses.length > 0) {
        const addr = addresses[0]
        setSavedAddress(addr)
        setAddressId(addr.id)
        setForm({
          fullName: addr.fullName || '', phone: addr.phone || '',
          house: addr.house || '', street: addr.street || '',
          area: addr.area || '', city: addr.city || '',
          state: addr.state || '', pincode: addr.pincode || ''
        })
      } else {
        setEditing(true)
      }
    } catch {
      setEditing(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    fetchAddress()
  }, [user, authLoading, navigate, fetchAddress])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit Indian phone number'
    if (!form.house.trim()) errs.house = 'House/Flat is required'
    if (!form.street.trim()) errs.street = 'Street is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    try {
      if (addressId) {
        await addressService.updateAddress(addressId, { ...form, userId: user.id })
      } else {
        const created = await addressService.createAddress({ ...form, userId: user.id })
        setAddressId(created.id)
      }
      setSavedAddress(form)
      setEditing(false)
      setErrors({})
      addToast('Address saved successfully', 'success')
    } catch {
      addToast('Failed to save address', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="address-page page-enter">
      <div className="container">
        <div className="address-header">
          <h1>My Address</h1>
          {savedAddress && !editing && (
            <button className="btn btn-outline edit-addr-btn" onClick={() => setEditing(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Address
            </button>
          )}
        </div>

        <div className="address-card">
          {loading ? (
            <div className="skeleton" style={{ height: 300, borderRadius: 8 }} />
          ) : !editing && savedAddress ? (
            <div className="address-display">
              <div className="address-display-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--india-green)" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="address-display-info">
                <h3>{savedAddress.fullName}</h3>
                <p>{savedAddress.house}, {savedAddress.street}</p>
                {savedAddress.area && <p>{savedAddress.area}</p>}
                <p>{savedAddress.city}, {savedAddress.state} – {savedAddress.pincode}</p>
                <p>Phone: {savedAddress.phone}</p>
              </div>
              <span className="address-default-tag">Default</span>
            </div>
          ) : (
            <form className="address-form-grid" onSubmit={e => e.preventDefault()} noValidate>
              <div className="addr-group-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName" name="fullName" type="text"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    value={form.fullName} onChange={handleChange}
                    placeholder="Full name as per records"
                  />
                  {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone *</label>
                  <input
                    id="phone" name="phone" type="tel"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={form.phone} onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="house">House / Flat / Building *</label>
                <input
                  id="house" name="house" type="text"
                  className={`form-input ${errors.house ? 'error' : ''}`}
                  value={form.house} onChange={handleChange}
                  placeholder="House No., Apartment, Building Name"
                />
                {errors.house && <p className="form-error">{errors.house}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="street">Street / Road / Colony *</label>
                <input
                  id="street" name="street" type="text"
                  className={`form-input ${errors.street ? 'error' : ''}`}
                  value={form.street} onChange={handleChange}
                  placeholder="Street, road or colony name"
                />
                {errors.street && <p className="form-error">{errors.street}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="area">Area / Locality</label>
                <input
                  id="area" name="area" type="text"
                  className="form-input"
                  value={form.area} onChange={handleChange}
                  placeholder="Area or locality (optional)"
                />
              </div>
              <div className="addr-group-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City *</label>
                  <input
                    id="city" name="city" type="text"
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    value={form.city} onChange={handleChange}
                    placeholder="City"
                  />
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State *</label>
                  <select
                    id="state" name="state"
                    className={`form-input ${errors.state ? 'error' : ''}`}
                    value={form.state} onChange={handleChange}
                  >
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="form-error">{errors.state}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode" name="pincode" type="text"
                    className={`form-input ${errors.pincode ? 'error' : ''}`}
                    value={form.pincode} onChange={handleChange}
                    placeholder="6-digit pincode" maxLength={6}
                  />
                  {errors.pincode && <p className="form-error">{errors.pincode}</p>}
                </div>
              </div>
              <div className="address-form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                {savedAddress && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setEditing(false); setErrors({}) }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
