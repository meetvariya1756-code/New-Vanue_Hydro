import { useState, useEffect } from 'react';
import { Link } from '~/components/Link';

interface Slide {
  image: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
}

const SLIDES: Slide[] = [
  {
    image: 'https://cdn.shopify.com/s/files/1/0608/2019/3416/files/vanue_post_1.webp?v=1779281401',
    eyebrow: 'EST. 2024 · LUXURY BOTANICALS',
    heading: "Nature's Ultimate Elixir",
    subheading: 'Pure, organic formulations crafted to deliver salon-grade skincare naturally.',
    ctaText: 'Shop Collections',
    ctaLink: '/collections/freestyle',
  },
  {
    image: '/vanue_banner_2.png',
    eyebrow: 'PURE ACTIVE ESSENCES',
    heading: 'Radiance Reimagined',
    subheading: 'Infused with rare active botanical extracts for a deeply hydrated, flawless glow.',
    ctaText: 'Discover Serums',
    ctaLink: '/products',
  },
  {
    image: '/vanue_banner_3.png',
    eyebrow: 'RESTORE & REBALANCE',
    heading: 'Pure Skin Harmony',
    subheading: 'Nourish your skin barrier with cold-pressed natural oils and calming botanical cures.',
    ctaText: 'View Botanical Range',
    ctaLink: '/collections/backcountry',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section className="vanue-slider relative w-full h-[85vh] md:h-screen -mt-nav overflow-hidden bg-[#FAF7F2]">
      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image Background */}
              <div className="absolute inset-0 bg-black/25 z-10" />
              <img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover transform scale-105 transition-transform duration-[5500ms] ease-out"
                style={{
                  transform: isActive ? 'scale(1)' : 'scale(1.05)',
                }}
              />

              {/* Text Overlay Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-12 lg:px-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
                <div
                  className={`max-w-2xl text-left transition-all duration-700 delay-300 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  <p className="font-semibold text-xs md:text-sm tracking-[0.25em] text-[#B89E74] uppercase mb-3">
                    {slide.eyebrow}
                  </p>
                  <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-wide leading-tight mb-4 drop-shadow-sm">
                    {slide.heading}
                  </h2>
                  <p className="text-sm md:text-lg text-white/80 font-light leading-relaxed max-w-xl mb-8">
                    {slide.subheading}
                  </p>
                  <Link
                    to={slide.ctaLink}
                    className="inline-block bg-[#B89E74] hover:bg-[#a68d63] text-[#1E1E1C] font-semibold tracking-wider text-xs md:text-sm uppercase py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-[#B89E74] w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
