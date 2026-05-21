import {useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import {Link} from '~/components/Link';

type FeatureIcon = 'sparkle' | 'droplet' | 'shield' | 'layers' | 'water' | 'sun';

interface Feature {
  title: string;
  description: string;
  icon: FeatureIcon;
}

interface ProductFeatureGridProps {
  heading: string;
  subheading: string;
  productImage: string;
  productLink: string;
  features: Feature[];
}

function FeatureIcon({name}: {name: FeatureIcon}) {
  const icons: Record<FeatureIcon, React.ReactNode> = {
    sparkle: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" strokeLinejoin="round" />
      </svg>
    ),
    droplet: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0c0-4.5-8-13-8-13z" strokeLinejoin="round" />
      </svg>
    ),
    shield: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
      </svg>
    ),
    layers: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" strokeLinejoin="round" />
        <polyline points="2 15 12 21.5 22 15" strokeLinejoin="round" />
        <polyline points="2 11.5 12 18 22 11.5" strokeLinejoin="round" />
      </svg>
    ),
    water: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        <path d="M12 6v12M8 10c1.5 0 2.5 1 4 1s2.5-1 4-1" strokeLinecap="round" />
      </svg>
    ),
    sun: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
        <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
        <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
}

export function ProductFeatureGrid({
  heading,
  subheading,
  productImage,
  productLink,
  features,
}: ProductFeatureGridProps) {
  const {ref, inView} = useInView({threshold: 0.1, triggerOnce: true});

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
      style={{background: 'linear-gradient(160deg, #FAF9F7 0%, #F5EFE6 100%)'}}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="vg-section-eyebrow">{subheading}</span>
          <h2 className="vg-section-heading" style={{maxWidth: '680px', margin: '0 auto'}}>
            {heading}
          </h2>
        </div>

        {/* Content grid */}
        <div className="vg-feature-grid">
          {/* Product Image */}
          <div
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(-48px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <Link to={productLink}>
              <div
                style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(201,169,110,0.15)',
                  borderRadius: '24px',
                  padding: '2rem',
                  boxShadow: '0 24px 60px rgba(201,169,110,0.12), 0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 32px 80px rgba(201,169,110,0.18), 0 8px 24px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 60px rgba(201,169,110,0.12), 0 4px 16px rgba(0,0,0,0.04)';
                }}
              >
                <img
                  src={productImage}
                  alt="Vanue Glams Body Wash"
                  style={{
                    height: '340px', width: 'auto', objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(201,169,110,0.2))',
                  }}
                />
                {/* Badge */}
                <div style={{
                  marginTop: '1.25rem', textAlign: 'center',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)',
                  borderRadius: '100px', padding: '0.4rem 1rem',
                  fontFamily: 'Inter, sans-serif', fontSize: '11px',
                  fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#8a7050',
                }}>
                  <span style={{color: '#c9a96e'}}>✦</span>
                  Buy 1 Get 1 Free
                </div>
              </div>
            </Link>
          </div>

          {/* Feature Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(48px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s',
            }}
          >
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="vg-feature-tile"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${0.3 + i * 0.08}s, transform 0.5s ease ${0.3 + i * 0.08}s`,
                }}
              >
                <div className="vg-feature-tile__icon">
                  <FeatureIcon name={feat.icon as FeatureIcon} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '0.95rem', fontWeight: 500,
                    color: '#1a1a1a', marginBottom: '0.3rem',
                  }}>
                    {feat.title}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.78rem', lineHeight: 1.55,
                    color: '#6b6158', margin: 0,
                  }}>
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
