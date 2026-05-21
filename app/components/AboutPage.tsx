import {useInView} from 'react-intersection-observer';
import {Link} from '~/components/Link';

function ValueIcon({name}: {name: string}) {
  if (name === 'leaf') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.43a1 1 0 01-1.6.07 1 1 0 01-.07-1.2C4.83 14.57 7.1 7.57 17 8z" />
      <path d="M17 8c0 11-8 13-8 13" strokeLinecap="round" />
    </svg>
  );
  if (name === 'heart') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
  if (name === 'star') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
  if (name === 'globe') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
  return null;
}

export function AboutPage() {
  const {ref: heroRef, inView: heroInView} = useInView({threshold: 0.1, triggerOnce: true});
  const {ref: intro1Ref, inView: intro1InView} = useInView({threshold: 0.1, triggerOnce: true});
  const {ref: intro2Ref, inView: intro2InView} = useInView({threshold: 0.1, triggerOnce: true});
  const {ref: valuesRef, inView: valuesInView} = useInView({threshold: 0.1, triggerOnce: true});

  const values = [
    {icon: 'leaf', title: 'Clean Formulas', description: 'Safe, effective ingredients free from harmful chemicals.'},
    {icon: 'heart', title: 'Customer First', description: 'Your satisfaction and trust drive everything we do.'},
    {icon: 'star', title: 'Premium Quality', description: 'Every product meets the highest standards before reaching you.'},
    {icon: 'globe', title: 'Accessible Beauty', description: 'Luxury skincare and haircare at prices everyone can afford.'},
  ];

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
          <span className="vg-page-hero__eyebrow">About Us</span>
          <h1 className="vg-page-hero__heading">Our Story</h1>
          <p className="vg-page-hero__sub">
            Beauty is confidence, self-care, and a touch of glamour.
          </p>
        </div>
      </section>

      {/* Section 1 – About intro */}
      <section
        ref={intro1Ref}
        className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
        style={{background: 'linear-gradient(160deg, #FAF9F7 0%, #F5EFE6 100%)'}}
      >
        <div className="max-w-6xl mx-auto vg-split-feature">
          {/* Text */}
          <div
            style={{
              opacity: intro1InView ? 1 : 0,
              transform: intro1InView ? 'translateX(0)' : 'translateX(-48px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <span className="vg-section-eyebrow">About Us</span>
            <h2 className="vg-section-heading">Gorgeous Skin &amp; Healthy Hair</h2>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: '#4a4540', marginBottom: '1rem'}}>
              At Vanue Glams, we believe beauty is all about confidence, self-care, and a touch of glamour. Our mission is to bring you high-quality cosmetic products that are safe, effective, and designed to enhance your natural beauty.
            </p>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: '#4a4540', marginBottom: '2rem'}}>
              We carefully craft our range to ensure every product meets the highest standards of quality. Whether it's skincare, makeup, or personal care essentials, our goal is to help you feel radiant every day.
            </p>
            <Link to="/collections/all" className="vg-btn-primary">
              Explore Products
            </Link>
          </div>
          {/* Image */}
          <div
            className="vg-split-feature__img"
            style={{
              opacity: intro1InView ? 1 : 0,
              transform: intro1InView ? 'translateX(0)' : 'translateX(48px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s',
            }}
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/27_b8c5f60e-f538-4ab7-a12d-40b637007480_800x.jpg?v=1756558388"
              alt="Vanue Glams products"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Section 2 – Our Story */}
      <section
        ref={intro2Ref}
        className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
        style={{background: '#fff'}}
      >
        <div className="max-w-6xl mx-auto vg-split-feature vg-split-feature--reversed">
          {/* Image */}
          <div
            className="vg-split-feature__img"
            style={{
              opacity: intro2InView ? 1 : 0,
              transform: intro2InView ? 'translateX(0)' : 'translateX(-48px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/32_800x.jpg?v=1756532421"
              alt="Vanue Glams story"
              loading="lazy"
            />
          </div>
          {/* Text */}
          <div
            style={{
              opacity: intro2InView ? 1 : 0,
              transform: intro2InView ? 'translateX(0)' : 'translateX(48px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s',
            }}
          >
            <span className="vg-section-eyebrow">Our Story</span>
            <h2 className="vg-section-heading">From a Vision to Your Vanity</h2>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: '#4a4540', marginBottom: '1rem'}}>
              The journey of Vanue Glams began with a simple vision – to make premium cosmetic products accessible and affordable for everyone. We noticed that many people struggled to find trustworthy products that combine quality with value.
            </p>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: '#4a4540'}}>
              That's why we started Vanue Glams: to create a brand you can rely on for everyday beauty needs. From humble beginnings to a growing community of happy customers, our story is built on trust, passion, and the belief that beauty should be celebrated in every form. At Vanue Glams, every product you choose is more than just a cosmetic — it's a step towards self-love, confidence, and timeless elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 – Values */}
      <section
        ref={valuesRef}
        className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
        style={{background: 'linear-gradient(160deg, #FAF9F7 0%, #F5EFE6 100%)'}}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-12"
            style={{
              opacity: valuesInView ? 1 : 0,
              transform: valuesInView ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <span className="vg-section-eyebrow">What We Stand For</span>
            <h2 className="vg-section-heading">Our Values</h2>
          </div>
          <div className="vg-icon-grid">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="vg-icon-tile"
                style={{
                  opacity: valuesInView ? 1 : 0,
                  transform: valuesInView ? 'translateY(0)' : 'translateY(32px)',
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
                }}
              >
                <div className="vg-icon-tile__icon" aria-hidden="true">
                  <ValueIcon name={v.icon} />
                </div>
                <h3 className="vg-icon-tile__title">{v.title}</h3>
                <p className="vg-icon-tile__desc">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
