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
  accentColor = 'var(--homepage-accent, #bf4800)',
  viewAllLink = '/collections/all',
}: ProductShowcase3DProps) {
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.12,
    rootMargin: '-40px 0px',
  });

  if (!products.length) {
    return (
      <section className="homepage-products px-6 py-20 md:px-12 lg:px-20">
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mt-4 text-primary/60">
          Add products in Shopify Admin — they will appear here automatically.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={clsx(
        'homepage-products relative overflow-hidden px-6 py-20 md:px-12 lg:px-20',
        inView && 'homepage-products--visible',
      )}
      style={{perspective: '1400px'}}
    >
      <div className="homepage-products__glow pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full opacity-30 blur-3xl" />

      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="mb-2 text-sm font-medium uppercase tracking-[0.2em]"
            style={{color: accentColor}}
          >
            From your store
          </p>
          <h2 className="text-3xl font-bold md:text-5xl">{title}</h2>
        </div>
        <Link
          to={viewAllLink}
          prefetch="intent"
          className="text-sm font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
          style={{color: accentColor}}
        >
          View all →
        </Link>
      </div>

      <div className="homepage-products__grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      className={clsx('homepage-product-card', inView && 'homepage-product-card--in')}
      style={{
        animationDelay: `${index * 80}ms`,
        transform: inView
          ? undefined
          : `translate3d(0, 60px, -80px) rotateX(12deg)`,
      }}
      onMouseMove={(e) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--tilt-x', `${-y * 12}deg`);
        el.style.setProperty('--tilt-y', `${x * 12}deg`);
      }}
      onMouseLeave={() => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      }}
    >
      <ProductCard product={product} className="w-full" />
    </div>
  );
}
