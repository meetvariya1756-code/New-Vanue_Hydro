import {useEffect} from 'react';
import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate} from '@remix-run/react';
import {useInView} from 'react-intersection-observer';
import type {
  Filter,
  ProductCollectionSortKeys,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';
import {
  Pagination,
  flattenConnection,
  getPaginationVariables,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {PageHeader, Section, Text} from '~/components/Text';
import {Grid} from '~/components/Grid';
import {Button} from '~/components/Button';
import {ProductCard} from '~/components/ProductCard';
import {SortFilter, type SortParam} from '~/components/SortFilter';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {FILTER_URL_PREFIX} from '~/components/SortFilter';
import {getImageLoadingPriority} from '~/lib/const';
import {parseAsCurrency} from '~/lib/utils';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const {collectionHandle} = params;
  const locale = context.storefront.i18n;

  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        const filterKey = key.substring(FILTER_URL_PREFIX.length);
        filters.push({
          [filterKey]: JSON.parse(value),
        });
      }
      return filters;
    },
    [] as ProductFilter[],
  );

  const {collection, collections} = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: collectionHandle,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const seo = seoPayload.collection({collection, url: request.url});

  const allFilterValues = collection.products.filters.flatMap(
    (filter) => filter.values,
  );

  const appliedFilters = filters
    .map((filter) => {
      const foundValue = allFilterValues.find((value) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
        // special case for price, the user can enter something freeform (still a number, though)
        // that may not make sense for the locale/currency.
        // Basically just check if the price filter is applied at all.
        if (valueInput.price && filter.price) {
          return true;
        }
        return (
          // This comparison should be okay as long as we're not manipulating the input we
          // get from the API before using it as a URL param.
          JSON.stringify(valueInput) === JSON.stringify(filter)
        );
      });
      if (!foundValue) {
        // eslint-disable-next-line no-console
        console.error('Could not find filter value for filter', filter);
        return null;
      }

      if (foundValue.id === 'filter.v.price') {
        // Special case for price, we want to show the min and max values as the label.
        const input = JSON.parse(foundValue.input as string) as ProductFilter;
        const min = parseAsCurrency(input.price?.min ?? 0, locale);
        const max = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : '';
        const label = min && max ? `${min} - ${max}` : 'Price';

        return {
          filter,
          label,
        };
      }
      return {
        filter,
        label: foundValue.label,
      };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return json({
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    seo,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Collection() {
  const {collection, collections, appliedFilters} =
    useLoaderData<typeof loader>();

  const {ref, inView} = useInView();

  return (
    <>
      {/* ── Collection Hero ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FAF9F7 0%, #F5EFE6 50%, #EDE6DA 100%)',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.1), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{position: 'relative', zIndex: 1}}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#c9a96e', display: 'block', marginBottom: '0.75rem',
            }}
          >
            Vanue Glams Collection
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400,
              color: '#1a1a1a', marginBottom: '0.75rem',
            }}
          >
            {collection.title}
          </h1>
          {collection?.description && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                lineHeight: 1.7, color: '#6b6158',
                maxWidth: '500px', margin: '0 auto 1rem',
              }}
            >
              {collection.description}
            </p>
          )}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(201,169,110,0.1)',
              border: '1px solid rgba(201,169,110,0.25)',
              borderRadius: '100px', padding: '0.35rem 1rem',
              fontFamily: 'Inter, sans-serif', fontSize: '11px',
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#8a7050',
            }}
          >
            <span style={{color: '#c9a96e'}}>✦</span>
            Buy 1 Get 1 Free on All Products
          </span>
        </div>
      </section>

      {/* ── Filter / Sort + Grid ── */}
      <Section>
        <SortFilter
          filters={collection.products.filters as Filter[]}
          appliedFilters={appliedFilters}
          collections={collections}
        >
          <Pagination connection={collection.products}>
            {({
              nodes,
              isLoading,
              PreviousLink,
              NextLink,
              nextPageUrl,
              hasNextPage,
              state,
            }) => (
              <>
                <div className="flex items-center justify-center mb-6">
                  <Button as={PreviousLink} variant="secondary" width="full">
                    {isLoading ? 'Loading...' : 'Load previous'}
                  </Button>
                </div>
                <ProductsLoadedOnScroll
                  nodes={nodes}
                  inView={inView}
                  nextPageUrl={nextPageUrl}
                  hasNextPage={hasNextPage}
                  state={state}
                />
                <div className="flex items-center justify-center mt-8">
                  <Button
                    ref={ref}
                    as={NextLink}
                    variant="secondary"
                    width="full"
                  >
                    {isLoading ? 'Loading...' : 'Load more products'}
                  </Button>
                </div>
              </>
            )}
          </Pagination>
        </SortFilter>
      </Section>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </>
  );
}

function VanueProductCard({product, index}: {product: any; index: number}) {
  const variants: any[] = product.variants?.nodes ?? product.variants?.edges?.map((e: any) => e.node) ?? [];
  const firstVariant = variants[0];
  const image = firstVariant?.image;
  const price = firstVariant?.price;

  return (
    <a
      href={`/products/${product.handle}`}
      style={{textDecoration: 'none'}}
    >
      <div className="vg-product-card">
        <div className="vg-product-card__img-wrap">
          {image && (
            <img
              src={image.url}
              alt={image.altText || product.title}
              loading={index < 4 ? 'eager' : 'lazy'}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          )}
          <span className="vg-product-card__badge">Buy 1 Get 1 Free</span>
          <div className="vg-product-card__quick-add">Shop Now →</div>
        </div>
        <div className="vg-product-card__body">
          {/* Stars */}
          <div className="vg-product-card__stars">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className="vg-product-card__star" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
              </svg>
            ))}
          </div>
          <h3 className="vg-product-card__title">{product.title}</h3>
          {price && (
            <p className="vg-product-card__price">
              {price.currencyCode === 'INR' ? 'Rs.' : ''} {price.amount ? parseFloat(price.amount).toFixed(0) : ''}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
}: {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
      }}
      className="sm:grid-cols-3 lg:grid-cols-4"
      data-test="product-grid"
    >
      {nodes.map((product: any, i: number) => (
        <VanueProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
