import {useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import {Link} from '~/components/Link';
import {Money} from '@shopify/hydrogen';
import {flattenConnection} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';

type CosmeticDuoSpotlightProps = {
  products: ProductCardFragment[];
};

export function CosmeticDuoSpotlight({products}: CosmeticDuoSpotlightProps) {
  const duo = products.slice(0, 2);
  if (duo.length < 1) return null;

  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-40px 0px',
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background:
          'linear-gradient(135deg, #1a1209 0%, #2d1f08 40%, #1a1209 100%)',
      }}
    >
      {/* ── Ambient background glows ── */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{background: 'radial-gradient(circle, #B89E74, transparent 70%)'}}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
        style={{background: 'radial-gradient(circle, #c8a882, transparent 70%)'}}
      />

      {/* ── Decorative top divider ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, #B89E74 30%, #B89E74 70%, transparent)',
          opacity: 0.3,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, #B89E74 30%, #B89E74 70%, transparent)',
          opacity: 0.3,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* ── Section Header ── */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.35em]"
            style={{color: '#B89E74'}}
          >
            New Arrivals
          </p>
          <h2
            className="font-serif text-3xl font-light tracking-wide text-white md:text-5xl"
            style={{textShadow: '0 2px 30px rgba(184,158,116,0.2)'}}
          >
            Crafted for You
          </h2>
          <div
            className="mx-auto mt-5 h-px w-16"
            style={{
              background:
                'linear-gradient(90deg, transparent, #B89E74, transparent)',
            }}
          />
        </div>

        {/* ── Product Cards ── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {duo.map((product, index) => (
            <SpotlightCard
              key={product.id}
              product={product}
              index={index}
              inView={inView}
            />
          ))}
        </div>
      </div>

      {/* ── Floating particle dots ── */}
      <FloatingParticles inView={inView} />
    </section>
  );
}

/* ─────────────── Individual card ─────────────── */
function SpotlightCard({
  product,
  index,
  inView,
}: {
  product: ProductCardFragment;
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const variants = flattenConnection(product.variants);
  const firstVariant = variants[0];
  if (!firstVariant) return null;

  const {image, price} = firstVariant;
  const delay = index * 150;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${-y * 14}deg`);
    el.style.setProperty('--tilt-y', `${x * 14}deg`);
    el.style.setProperty(
      '--mouse-x',
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    el.style.setProperty(
      '--mouse-y',
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'translateY(0) scale(1)'
          : `translateY(60px) scale(0.94)`,
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        perspective: '1200px',
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative cursor-pointer rounded-3xl"
        style={{
          transform:
            'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
          transition: 'transform 0.15s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer glow border */}
        <div
          className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(135deg, rgba(184,158,116,0.5), rgba(184,158,116,0.1), rgba(184,158,116,0.4))',
            filter: 'blur(1px)',
          }}
        />

        {/* Card body */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(184,158,116,0.18)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Cursor spotlight */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background:
                'radial-gradient(200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(184,158,116,0.12), transparent 70%)',
            }}
          />

          {/* Product Image */}
          <Link to={`/products/${product.handle}`} prefetch="intent">
            <div className="relative overflow-hidden" style={{aspectRatio: '3/4'}}>
              {image ? (
                <img
                  src={image.url}
                  alt={image.altText || product.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(184,158,116,0.1), rgba(184,158,116,0.05))',
                  }}
                />
              )}

              {/* Image overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(26,18,9,0.85) 0%, rgba(26,18,9,0.2) 50%, transparent 100%)',
                }}
              />

              {/* "New" badge */}
              <div className="absolute left-5 top-5">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: 'rgba(184,158,116,0.15)',
                    border: '1px solid rgba(184,158,116,0.4)',
                    color: '#D4B896',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  New
                </span>
              </div>

              {/* Product info overlaid on image bottom */}
              <div className="absolute bottom-0 inset-x-0 p-7">
                <h3
                  className="font-serif text-lg font-light leading-snug text-white mb-2 line-clamp-2"
                  style={{textShadow: '0 2px 12px rgba(0,0,0,0.5)'}}
                >
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium"
                    style={{color: '#D4B896'}}
                  >
                    <Money data={price!} withoutTrailingZeros />
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{color: '#B89E74'}}
                  >
                    Shop Now
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Bottom CTA strip */}
          <Link to={`/products/${product.handle}`} prefetch="intent">
            <div
              className="flex items-center justify-between px-7 py-5 transition-colors duration-300 group-hover:bg-white/5"
              style={{borderTop: '1px solid rgba(184,158,116,0.12)'}}
            >
              <span className="text-xs text-white/50 font-light tracking-wide">
                {product.vendor || 'Vanue Glams'}
              </span>
              <button
                className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300"
                style={{
                  background: 'rgba(184,158,116,0.15)',
                  border: '1px solid rgba(184,158,116,0.35)',
                  color: '#D4B896',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(184,158,116,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(184,158,116,0.15)';
                }}
              >
                Add to Cart
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Floating ambient dots ─────────────── */
function FloatingParticles({inView}: {inView: boolean}) {
  const particles = [
    {top: '12%', left: '8%', size: 3, delay: 0},
    {top: '28%', left: '92%', size: 2, delay: 0.6},
    {top: '60%', left: '5%', size: 4, delay: 1.2},
    {top: '75%', left: '88%', size: 2, delay: 0.3},
    {top: '45%', left: '50%', size: 1.5, delay: 0.9},
    {top: '88%', left: '22%', size: 2.5, delay: 1.5},
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: '#B89E74',
            opacity: inView ? 0.5 : 0,
            transition: `opacity 1s ease ${p.delay + 0.5}s`,
            animation: inView
              ? `float-y ${3 + i * 0.5}s ease-in-out ${p.delay}s infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes float-y {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
