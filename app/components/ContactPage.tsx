import {useState} from 'react';
import {useInView} from 'react-intersection-observer';
import {Link} from '~/components/Link';

function ContactIcon({name}: {name: string}) {
  if (name === 'phone') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.51-.51a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
  if (name === 'email') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
  if (name === 'clock') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
  return null;
}

function SocialIcon({platform}: {platform: string}) {
  if (platform === 'Instagram') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
  if (platform === 'Facebook') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
    </svg>
  );
  if (platform === 'YouTube') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.47 12.4 12.4 0 00-4.52-1.22 12.4 12.4 0 00-4.52 1.22A4.83 4.83 0 013.01 6.69 16.62 16.62 0 002 12a16.62 16.62 0 001.01 5.31 4.83 4.83 0 003.77 2.47 12.4 12.4 0 004.52 1.22 12.4 12.4 0 004.52-1.22 4.83 4.83 0 003.77-2.47A16.62 16.62 0 0022 12a16.62 16.62 0 00-2.41-5.31zM10 15V9l5 3-5 3z"/>
    </svg>
  );
  return null;
}

const CONTACT_INFO = [
  {icon: 'phone', label: 'Call Us', value: '+91 6359565511', link: 'tel:+916359565511'},
  {icon: 'email', label: 'Email Address', value: 'support@vanueglams.com', link: 'mailto:support@vanueglams.com'},
  {icon: 'clock', label: 'Support Hours', value: 'Monday – Sunday, 24/7'},
];

const SOCIALS = [
  {platform: 'Instagram', url: 'https://www.instagram.com/vanueglams/'},
  {platform: 'Facebook', url: 'https://www.facebook.com/Vanueglams'},
  {platform: 'YouTube', url: 'https://www.youtube.com/@VANUEGLAMS'},
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({name: '', email: '', phone: '', subject: '', message: ''});
  const {ref: heroRef, inView: heroInView} = useInView({threshold: 0.1, triggerOnce: true});
  const {ref: contentRef, inView: contentInView} = useInView({threshold: 0.05, triggerOnce: true});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Page Hero */}
      <section ref={heroRef} className="vg-page-hero">
        <div
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            position: 'relative', zIndex: 1,
          }}
        >
          <span className="vg-page-hero__eyebrow">Get In Touch</span>
          <h1 className="vg-page-hero__heading">Contact Us</h1>
          <p className="vg-page-hero__sub">We'd love to hear from you.</p>
        </div>
      </section>

      {/* Contact Split */}
      <section
        ref={contentRef}
        className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
        style={{background: '#FAF9F7'}}
      >
        <div className="max-w-6xl mx-auto vg-contact-split">
          {/* Left: Info */}
          <div
            style={{
              opacity: contentInView ? 1 : 0,
              transform: contentInView ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <h2 className="vg-section-heading" style={{marginBottom: '0.75rem'}}>Get In Touch</h2>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, color: '#6b6158', marginBottom: '2rem', maxWidth: '340px'}}>
              Have a question about your order, a product, or just want to say hello? Our team is always ready to help.
            </p>

            {/* Info items */}
            <div style={{marginBottom: '2rem'}}>
              {CONTACT_INFO.map((item) => (
                <div key={item.icon} className="vg-contact-info-item">
                  <div className="vg-contact-info-icon" aria-hidden="true">
                    <ContactIcon name={item.icon} />
                  </div>
                  <div>
                    <p style={{fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9086', marginBottom: '0.2rem'}}>
                      {item.label}
                    </p>
                    {item.link ? (
                      <a href={item.link} style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#1a1a1a', textDecoration: 'none', fontWeight: 500}}>
                        {item.value}
                      </a>
                    ) : (
                      <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#1a1a1a', margin: 0, fontWeight: 500}}>
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9086', marginBottom: '0.75rem'}}>
              Follow Us
            </p>
            <div className="vg-footer__social">
              {SOCIALS.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vg-footer__social-btn"
                  aria-label={s.platform}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div
            style={{
              opacity: contentInView ? 1 : 0,
              transform: contentInView ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s',
            }}
          >
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid rgba(201,169,110,0.12)',
              padding: '2.5rem',
              boxShadow: '0 8px 32px rgba(201,169,110,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.5rem', fontWeight: 400,
                color: '#1a1a1a', marginBottom: '1.75rem',
              }}>
                Send Us a Message
              </h3>

              {submitted ? (
                <div style={{
                  textAlign: 'center', padding: '3rem 1.5rem',
                  background: 'rgba(201,169,110,0.06)',
                  borderRadius: '12px', border: '1px solid rgba(201,169,110,0.2)',
                }}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>✦</div>
                  <p style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', color: '#1a1a1a', marginBottom: '0.5rem'}}>
                    Thank You!
                  </p>
                  <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#6b6158'}}>
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div className="vg-form-field">
                      <label htmlFor="contact-name" className="vg-form-label">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Your full name"
                        className="vg-form-input"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div className="vg-form-field">
                      <label htmlFor="contact-email" className="vg-form-label">Email Address *</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="vg-form-input"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div className="vg-form-field">
                      <label htmlFor="contact-phone" className="vg-form-label">Phone Number</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 XXXXXXXXXX"
                        className="vg-form-input"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                      />
                    </div>
                    <div className="vg-form-field">
                      <label htmlFor="contact-subject" className="vg-form-label">Subject *</label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        placeholder="How can we help?"
                        className="vg-form-input"
                        value={form.subject}
                        onChange={(e) => setForm({...form, subject: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="vg-form-field">
                    <label htmlFor="contact-message" className="vg-form-label">Message *</label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Tell us more about your query..."
                      className="vg-form-textarea"
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="vg-btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '0.25rem', padding: '1rem'}}>
                    Send Message
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '0.25rem'}}>
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
