import clsx from 'clsx';
import {useEffect, useId, useMemo} from 'react';
import {useFetcher} from '@remix-run/react';
import type {
  Product,
  ProductSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

import {Heading, Text} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';
import {Skeleton} from '~/components/Skeleton';
import {usePrefixPathWithLocale} from '~/lib/utils';
import type {CartRecommendedProduct} from '~/data/vanueProducts';

interface FeaturedProductsProps {
  count: number;
  fallbackProducts?: readonly CartRecommendedProduct[];
  heading: string;
  layout?: 'drawer' | 'page';
  onClose?: () => void;
  query?: string;
  reverse?: boolean;
  sortKey: ProductSortKeys;
}

/**
 * Display a grid of products and a heading based on some options.
 * This components uses the storefront API products query
 * @param count number of products to display
 * @param query a filtering query
 * @param reverse wether to reverse the product results
 * @param sortKey Sort the underlying list by the given key.
 * @see query https://shopify.dev/api/storefront/current/queries/products
 * @see filters https://shopify.dev/api/storefront/current/queries/products#argument-products-query
 */
export function FeaturedProducts({
  count = 4,
  fallbackProducts,
  heading = 'Shop Best Sellers',
  layout = 'drawer',
  onClose,
  query,
  reverse,
  sortKey = 'BEST_SELLING',
}: FeaturedProductsProps) {
  const {load, data} = useFetcher<{products: Product[]}>();
  const queryString = useMemo(
    () =>
      Object.entries({count, sortKey, query, reverse})
        .map(([key, val]) =>
          val ? `${key}=${encodeURIComponent(String(val))}` : null,
        )
        .filter(Boolean)
        .join('&'),
    [count, sortKey, query, reverse],
  );
  const productsApiPath = usePrefixPathWithLocale(
    `/api/products?${queryString}`,
  );

  useEffect(() => {
    load(productsApiPath);
  }, [load, productsApiPath]);

  return (
    <>
      <Heading format size="copy" className="t-4">
        {heading}
      </Heading>
      <div
        className={clsx([
          `grid grid-cols-2 gap-x-6 gap-y-8`,
          layout === 'page' ? 'md:grid-cols-4 sm:grid-col-4' : '',
        ])}
      >
        <FeatureProductsContent
          count={count}
          fallbackProducts={fallbackProducts}
          onClick={onClose}
          products={data?.products}
        />
      </div>
    </>
  );
}

/**
 * Render the FeaturedProducts content based on the fetcher's state. "loading", "empty" or "products"
 */
function FeatureProductsContent({
  count = 4,
  fallbackProducts,
  onClick,
  products,
}: {
  count: FeaturedProductsProps['count'];
  fallbackProducts?: FeaturedProductsProps['fallbackProducts'];
  products: Product[] | undefined;
  onClick?: () => void;
}) {
  const id = useId();

  if (!products) {
    return (
      <>
        {[...new Array(count)].map((_, i) => (
          <div key={`${id + i}`} className="grid gap-2">
            <Skeleton className="aspect-[3/4]" />
            <Skeleton className="w-32 h-4" />
          </div>
        ))}
      </>
    );
  }

  if (products?.length === 0) {
    if (fallbackProducts?.length) {
      return (
        <>
          {fallbackProducts.map((product) => (
            <FallbackProductCard
              key={product.handle}
              product={product}
              onClick={onClick}
            />
          ))}
        </>
      );
    }

    return <Text format>No products found.</Text>;
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard
          product={product}
          key={product.id}
          onClick={onClick}
          quickAdd
        />
      ))}
    </>
  );
}

function FallbackProductCard({
  product,
  onClick,
}: {
  product: CartRecommendedProduct;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <a onClick={onClick} href={`/products/${product.handle}`}>
        <div className="grid gap-4">
          <div className="card-image aspect-[4/5] bg-primary/5">
            <img
              className="object-cover w-full h-full fadeIn"
              src={product.image}
              alt={product.title}
              loading="lazy"
            />
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              Sale
            </Text>
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis"
              as="h3"
            >
              {product.title}
            </Text>
            <div className="flex gap-4">
              <Text className="flex gap-4">
                Rs. {product.price}
                <span className="opacity-50 strike">
                  Rs. {product.compareAtPrice}
                </span>
              </Text>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
