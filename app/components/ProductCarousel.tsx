import {useRef, useCallback} from 'react';
import {useInView} from 'react-intersection-observer';
import {Link} from '~/components/Link';
import {Money, flattenConnection} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';

// Static product data used as fallback or for non-Shopify cards
export interface StaticProduct {
  handle: string;
  title: string;
  shortDescription?: string;
  price: string;
  reviewCount?: number;
  image: string;
  badge?: string;
}

interface ProductCarouselProps {
  heading: string;
  badge?: string;
  shopifyProducts?: ProductCardFragment[];
  staticProducts?: StaticProduct[];
}

function StarRating({count}: {count: number}) {
  return (
    <div className="vg-product-card__stars" aria-label={`${count} reviews`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="vg-product-card__star" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      ))}
      <span className="vg-product-card__reviews">({count})</span>
    </div>
  );
}

function ShopifyCard({product, index, inView}: {product: ProductCardFragment; index: number; inView: boolean}) {
  const variants = flattenConnection(product.variants);
  const firstVariant = variants[0];
  if (!firstVariant) return null;
  const {image, price} = firstVariant;

  return (
    <div
      className="vg-carousel__card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms`,
      }}
    >
      <Link to={`/products/${product.handle}`} prefetch="intent">
        <div className="vg-product-card">
          <div className="vg-product-card__img-wrap">
            {image && (
              <img
                src={image.url}
                alt={image.altText || product.title}
                loading="lazy"
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            )}
            <span className="vg-product-card__badge">Buy 1 Get 1 Free</span>
            <div className="vg-product-card__quick-add">Shop Now</div>
          </div>
          <div className="vg-product-card__body">
            <StarRating count={42} />
            <h3 className="vg-product-card__title">{product.title}</h3>
            <p className="vg-product-card__price">
              <Money data={price!} withoutTrailingZeros />
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function StaticCard({product, index, inView}: {product: StaticProduct; index: number; inView: boolean}) {
  return (
    <div
      className="vg-carousel__card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms`,
      }}
    >
      <Link to={`/products/${product.handle}`} prefetch="intent">
        <div className="vg-product-card">
          <div className="vg-product-card__img-wrap">
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
            {product.badge && (
              <span className="vg-product-card__badge">{product.badge}</span>
            )}
            <div className="vg-product-card__quick-add">Shop Now →</div>
          </div>
          <div className="vg-product-card__body">
            {product.reviewCount != null && <StarRating count={product.reviewCount} />}
            <h3 className="vg-product-card__title">{product.title}</h3>
            {product.shortDescription && (
              <p className="vg-product-card__desc">{product.shortDescription}</p>
            )}
            <p className="vg-product-card__price">Rs. {product.price}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ProductCarousel({
  heading,
  badge,
  shopifyProducts,
  staticProducts,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const {ref: sectionRef, inView} = useInView({threshold: 0.05, triggerOnce: true});

  const scroll = useCallback((direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const cardW = track.querySelector('.vg-carousel__card')?.clientWidth ?? 280;
    const gap = 20;
    const amount = (cardW + gap) * 2;
    track.scrollBy({left: direction === 'next' ? amount : -amount, behavior: 'smooth'});
  }, []);

  const hasProducts = (shopifyProducts?.length ?? 0) > 0 || (staticProducts?.length ?? 0) > 0;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24"
      style={{background: '#FAF9F7', overflow: 'hidden'}}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div
          className="flex items-end justify-between mb-8"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div>
            {badge && <span className="vg-section-eyebrow">{badge}</span>}
            <h2 className="vg-section-heading" style={{margin: 0}}>{heading}</h2>
          </div>
          <Link
            to="/collections/all"
            prefetch="intent"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '11px',
              fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#c9a96e', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'gap 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            View All
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Carousel */}
        {hasProducts ? (
          <div className="vg-carousel">
            <button
              onClick={() => scroll('prev')}
              className="vg-carousel-btn vg-carousel-btn--prev"
              aria-label="Previous products"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div ref={trackRef} className="vg-carousel__track">
              {shopifyProducts?.map((p, i) => (
                <ShopifyCard key={p.id} product={p} index={i} inView={inView} />
              ))}
              {staticProducts?.map((p, i) => (
                <StaticCard key={p.handle} product={p} index={i} inView={inView} />
              ))}
            </div>

            <button
              onClick={() => scroll('next')}
              className="vg-carousel-btn vg-carousel-btn--next"
              aria-label="Next products"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <p style={{fontFamily: 'Inter, sans-serif', color: '#9a9086', fontSize: '0.9rem'}}>
            No products found.
          </p>
        )}
      </div>
    </section>
  );
}
