import {useState, useEffect} from 'react';
import {Link} from '~/components/Link';

interface Slide {
  desktopImage: string;
  mobileImage: string;
  cta: {label: string; path: string};
}

const SLIDES: Slide[] = [
  {
    desktopImage: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/vanue_post_1.png?v=1771420504',
    mobileImage:  'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/vanue_post_1.png?v=1771420504',
    cta: {label: 'Shop Now', path: '/collections/all'},
  },
  {
    desktopImage: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Banner.jpg?v=1766400238',
    mobileImage:  'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_520_x_600_px_1065674a-a480-409b-9ce9-6d8dd57befa4.jpg?v=1766406623',
    cta: {label: 'Shop Now', path: '/collections/all'},
  },
  {
    desktopImage: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Banner_3.jpg?v=1758688757',
    mobileImage:  'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Mobile_Size_Banner_1.jpg?v=1758700049',
    cta: {label: 'Shop Now', path: '/collections/all'},
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => setCurrentSlide(idx);
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="vanue-slider relative w-full overflow-hidden -mt-nav"
      style={{height: 'calc(100vh - 36px)', minHeight: '480px', background: '#1a1a1a'}}
      aria-label="Hero banner"
    >
      {/* Slides */}
      <div className="absolute inset-0 w-full h-full">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const imgSrc = isMobile ? slide.mobileImage : slide.desktopImage;
          return (
            <div
              key={index}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'opacity 1s ease-in-out',
              }}
            >
              {/* Subtle dark scrim */}
              <div
                className="absolute inset-0 z-10"
                style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 100%)'}}
                aria-hidden="true"
              />
              {/* Image */}
              <img
                src={imgSrc}
                alt={`Vanue Glams slide ${index + 1}`}
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  transform: isActive ? 'scale(1)' : 'scale(1.05)',
                  transition: 'transform 4.5s ease-out',
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />

              {/* Shop Now CTA overlay */}
              <div
                className="absolute inset-0 z-20 flex items-end justify-center pb-12 md:pb-16"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s',
                }}
              >
                <Link
                  to={slide.cta.path}
                  className="vg-btn-gold"
                  style={{
                    fontSize: '12px',
                    padding: '0.9rem 3rem',
                    boxShadow: '0 8px 32px rgba(201,169,110,0.35)',
                  }}
                >
                  {slide.cta.label}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute', left: '16px', top: '50%',
          transform: 'translateY(-50%)', zIndex: 30,
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,169,110,0.5)'}}
        onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute', right: '16px', top: '50%',
          transform: 'translateY(-50%)', zIndex: 30,
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,169,110,0.5)'}}
        onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div
        style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 30,
          display: 'flex', gap: '10px', alignItems: 'center',
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: '3px', borderRadius: '3px',
              background: i === currentSlide ? '#c9a96e' : 'rgba(255,255,255,0.4)',
              width: i === currentSlide ? '32px' : '12px',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}
