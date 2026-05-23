import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';

function WaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function IgIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="3.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please enter your name';
  if (!form.email.trim()) errors.email = 'Please enter your email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email';
  if (!form.message.trim()) errors.message = 'Please enter a message';
  else if (form.message.trim().length < 10) errors.message = 'Message is too short (min 10 characters)';
  return errors;
}

export default function ContactPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [touched, setTouched] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Clear error on change if touched
    if (touched[name] && errors[name]) {
      const newErrors = validate({ ...form, [name]: value });
      setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErrors = validate(form);
    setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('loading');
    setErrors({});

    // Simulate async submit (replace with real API call / EmailJS)
    await new Promise(res => setTimeout(res, 1400));

    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      setStatus('success');
      toast({ message: "Message sent! We'll get back to you soon 💛", type: 'success', duration: 4000 });
      setForm({ name: '', email: '', phone: '', message: '' });
      setTouched({});
    } else {
      setStatus('error');
      toast({ message: 'Something went wrong. Please try WhatsApp instead.', type: 'error' });
    }
  }

  function resetForm() { setStatus('idle'); setErrors({}); setForm({ name: '', email: '', phone: '', message: '' }); setTouched({}); }

  return (
    <>
      {/* TOP RIBBON */}
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">

        <div className="sa-header-row">
          <h1 className="sa-title">Contact Us</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="contact-page-body">

          <p className="contact-page-sub">
            We'd love to hear from you!<br />
            Reach out for orders, customisations, or any questions.
          </p>

          {/* Contact Buttons */}
          <div className="contact-reach-row">
            <a href="https://wa.me/919769238160" target="_blank" rel="noreferrer" className="contact-reach-btn contact-wa">
              <WaIcon />
              <div className="contact-reach-info">
                <span className="contact-reach-label">WhatsApp</span>
                <span className="contact-reach-value">+91 97692 38160</span>
              </div>
              <span className="contact-reach-arrow">→</span>
            </a>
            <a href="https://instagram.com/marvikala" target="_blank" rel="noreferrer" className="contact-reach-btn contact-ig">
              <IgIcon />
              <div className="contact-reach-info">
                <span className="contact-reach-label">Instagram</span>
                <span className="contact-reach-value">@marvikala</span>
              </div>
              <span className="contact-reach-arrow">→</span>
            </a>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h2 className="contact-form-heading">Send us a message</h2>

            {status === 'success' ? (
              <div className="contact-success">
                <div className="contact-success-icon">🌸</div>
                <h3>Message sent!</h3>
                <p>Thank you for reaching out, {form.name || 'friend'}! We'll get back to you within 24 hours.</p>
                <button className="contact-submit-btn" onClick={resetForm} style={{ marginTop: 16 }}>Send another message</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                <div className="contact-field-wrap">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name *"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`contact-input${errors.name ? ' input-error' : touched.name && !errors.name ? ' input-valid' : ''}`}
                    autoComplete="name"
                    aria-describedby={errors.name ? 'name-err' : undefined}
                  />
                  {errors.name && <span className="contact-field-error" id="name-err">{errors.name}</span>}
                </div>

                <div className="contact-field-wrap">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address *"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`contact-input${errors.email ? ' input-error' : touched.email && !errors.email ? ' input-valid' : ''}`}
                    autoComplete="email"
                    aria-describedby={errors.email ? 'email-err' : undefined}
                  />
                  {errors.email && <span className="contact-field-error" id="email-err">{errors.email}</span>}
                </div>

                <div className="contact-field-wrap">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number (optional)"
                    value={form.phone}
                    onChange={handleChange}
                    className="contact-input"
                    autoComplete="tel"
                  />
                </div>

                <div className="contact-field-wrap">
                  <textarea
                    name="message"
                    placeholder="Your message *"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`contact-input contact-textarea${errors.message ? ' input-error' : touched.message && !errors.message ? ' input-valid' : ''}`}
                    rows={5}
                    aria-describedby={errors.message ? 'msg-err' : undefined}
                  />
                  <div className="contact-char-count">{form.message.length} chars</div>
                  {errors.message && <span className="contact-field-error" id="msg-err">{errors.message}</span>}
                </div>

                {status === 'error' && (
                  <div className="contact-error-banner">
                    Something went wrong. Please try again or reach us on WhatsApp.
                  </div>
                )}

                <button
                  type="submit"
                  className={`contact-submit-btn${status === 'loading' ? ' loading' : ''}`}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <><span className="btn-spinner" />&nbsp;Sending...</>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
