import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import './ContactPage.css'

export default function ContactPage() {
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.message.trim()) errs.message = 'Message is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitted(true)
    addToast('Your message has been sent. We\'ll respond within 24 hours.', 'success', 5000)
  }

  return (
    <div className="contact-page page-enter">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Have a question? We're here to help you celebrate Independence Day with pride.</p>
        </div>

        <div className="contact-layout">
          <div className="contact-info">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h4>Email</h4>
                <p>support@tricolormart.in</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81A2 2 0 017.09 6.4l-1.27 1.27a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
                </svg>
              </div>
              <div>
                <h4>Support Hours</h4>
                <p>Mon – Sat: 9 AM to 6 PM IST</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h4>Response Time</h4>
                <p>We typically respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSubmitted(false) }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2>Send a Message</h2>
                <div className="cform-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-name">Your Name *</label>
                    <input id="c-name" name="name" type="text" className={`form-input ${errors.name ? 'error' : ''}`}
                      value={form.name} onChange={handleChange} placeholder="Full name" />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-email">Email Address *</label>
                    <input id="c-email" name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                      value={form.email} onChange={handleChange} placeholder="your@email.com" />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-subject">Subject</label>
                  <input id="c-subject" name="subject" type="text" className="form-input"
                    value={form.subject} onChange={handleChange} placeholder="What's your query about?" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-message">Message *</label>
                  <textarea id="c-message" name="message" className={`form-input contact-textarea ${errors.message ? 'error' : ''}`}
                    value={form.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={5} />
                  {errors.message && <p className="form-error">{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
