import {useRef, useEffect, useState} from 'react';
import {Link} from '~/components/Link';

interface FullWidthBannerProps {
  desktopImage: string;
  mobileImage: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  cta?: {label: string; path: string};
  overlayDark?: boolean;
}

export function FullWidthBanner({
  desktopImage,
  mobileImage,
  eyebrow,
  heading,
  description,
  cta,
  overlayDark = true,
}: FullWidthBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Parallax on scroll
  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg || isMobile) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const offset = (progress - 0.5) * 80;
      bg.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="vg-full-banner"
      style={{minHeight: isMobile ? '380px' : '520px'}}
    >
      {/* Parallax background */}
      <div ref={bgRef} className="vg-full-banner__bg" style={{height: '115%', top: '-7.5%'}}>
        <img
          src={isMobile ? mobileImage : desktopImage}
          alt={heading}
          loading="lazy"
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>

      {/* Overlay */}
      {overlayDark && <div className="vg-full-banner__overlay" aria-hidden="true" />}

      {/* Content */}
      <div className="vg-full-banner__content" style={{maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '4rem 1.5rem', position: 'relative', zIndex: 2}}>
        <div style={{maxWidth: '480px'}}>
          {eyebrow && (
            <span
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.25em', textTransform: 'uppercase',
                color: '#c9a96e', marginBottom: '0.75rem',
              }}
            >
              {eyebrow}
            </span>
          )}
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400,
              lineHeight: 1.15, color: '#fff',
              marginBottom: '1rem',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            {heading}
          </h2>
          {description && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem', lineHeight: 1.7,
                color: 'rgba(255,255,255,0.82)',
                marginBottom: '1.75rem',
              }}
            >
              {description}
            </p>
          )}
          {cta && (
            <Link to={cta.path} className="vg-btn-gold">
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
