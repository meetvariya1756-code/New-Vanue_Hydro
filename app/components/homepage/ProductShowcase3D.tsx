import {useRef} from 'react';
import clsx from 'clsx';
import {useInView} from 'react-intersection-observer';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {Link} from '~/components/Link';

type ProductShowcase3DProps = {
  title: string;
  products: ProductCardFragment[];
  accentColor?: string;
  viewAllLink?: string;
};

export function ProductShowcase3D({
  title,
  products,
  accentColor = 'var(--homepage-accent, #B89E74)',
  viewAllLink = '/collections/all',
}: ProductShowcase3DProps) {
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.08,
    rootMargin: '-20px 0px',
  });

  if (!products.length) {
    return (
      <section className="homepage-products px-6 py-24 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl font-light tracking-wide md:text-4xl">{title}</h2>
        <p className="mt-4 text-primary/60 font-light">
          Add skincare products in Shopify Admin — they will appear here automatically.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={clsx(
        'homepage-products relative overflow-hidden px-6 py-24 md:px-12 lg:px-20 max-w-7xl mx-auto',
        inView && 'homepage-products--visible',
      )}
      style={{perspective: '1500px'}}
    >
      {/* Luxury background ambient golden glow */}
      <div 
        className="homepage-products__glow pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full opacity-[0.06] blur-[90px] select-none"
        style={{backgroundColor: accentColor}}
      />
      <div 
        className="homepage-products__glow pointer-events-none absolute -left-24 bottom-1/4 h-80 w-80 rounded-full opacity-[0.04] blur-[90px] select-none"
        style={{backgroundColor: accentColor}}
      />

      <div className="mb-16 flex flex-wrap items-end justify-between gap-6 border-b border-primary/5 pb-6">
        <div>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{color: accentColor}}
          >
            The Collection
          </p>
          <h2 className="font-serif text-3xl font-light tracking-wide md:text-5xl">{title}</h2>
        </div>
        <Link
          to={viewAllLink}
          prefetch="intent"
          className="text-xs font-semibold uppercase tracking-[0.2em] pb-1 border-b border-current hover:opacity-75 transition-opacity"
          style={{color: accentColor}}
        >
          View all products
        </Link>
      </div>

      <div className="homepage-products__grid grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard3D
            key={product.id}
            product={product}
            index={index}
            inView={inView}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard3D({
  product,
  index,
  inView,
}: {
  product: ProductCardFragment;
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={clsx(
        'homepage-product-card group relative p-[1px] rounded-2xl transition-all duration-500 ease-out',
        inView && 'homepage-product-card--in'
      )}
      style={{
        animationDelay: `${index * 70}ms`,
        transform: inView
          ? undefined
          : `translate3d(0, 50px, -60px) rotateX(10deg)`,
      }}
      onMouseMove={(e) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;

        el.style.setProperty('--tilt-x', `${-y * 11}deg`);
        el.style.setProperty('--tilt-y', `${x * 11}deg`);
        el.style.setProperty('--mouse-x-px', `${xPx}px`);
        el.style.setProperty('--mouse-y-px', `${yPx}px`);
      }}
      onMouseLeave={() => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      }}
    >
      {/* 3D dynamic cursor spotlight shine effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(130px circle at var(--mouse-x-px, 0px) var(--mouse-y-px, 0px), rgba(184, 158, 116, 0.14), transparent 80%)`,
        }}
      />

      {/* Muted luxury golden border that illuminates on hover */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl border transition-colors duration-300"
        style={{
          borderColor: 'rgba(184, 158, 116, 0.12)',
        }}
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderColor: 'rgba(184, 158, 116, 0.38)',
          boxShadow: '0 0 15px rgba(184, 158, 116, 0.12)',
        }}
      />

      {/* Glassmorphic card body wrapper */}
      <div 
        className="relative z-10 h-full w-full rounded-2xl bg-[rgba(255,255,255,0.015)] backdrop-blur-[1px] transition-shadow duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.01)] group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        <ProductCard product={product} className="w-full" />
      </div>
    </div>
  );
}
