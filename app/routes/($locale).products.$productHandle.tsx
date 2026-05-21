import {useRef, Suspense} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getProductOptions,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';

import type {ProductFragment} from 'storefrontapi.generated';
import {Heading, Section, Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {Button} from '~/components/Button';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Skeleton} from '~/components/Skeleton';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {ProductGallery} from '~/components/ProductGallery';
import {DynamicIngredients, type Ingredient} from '~/components/DynamicIngredients';
import {IconCaret, IconCheck, IconClose} from '~/components/Icon';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront} from '~/lib/type';
import {routeHeaders} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {productHandle} = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
function getMockProduct(handle: string): any {
  let title = 'Vanue Glams Beauty Product';
  let price = '599';
  let image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714';

  if (handle.includes('serum')) {
    title = '10% Vitamin C Serum – 30ml';
    price = '689';
    image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399';
  } else if (handle.includes('body-wash')) {
    title = 'Exfoliate Body Wash – 250ml';
    price = '699';
    image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/1_8e974002-6d60-4e59-b4ed-f797f73ed928.jpg?v=1757595405';
  } else if (handle.includes('hair-oil')) {
    title = 'Natural Hair Oil – 100ml';
    price = '599';
    image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678';
  } else if (handle.includes('shampoo')) {
    title = 'Dandruff Control Shampoo – 250ml';
    price = '699';
    image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/31.jpg?v=1756532420';
  } else if (handle.includes('cream')) {
    title = 'Moisture Cream – 100g';
    price = '489';
    image = 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/37.jpg?v=1756532728';
  }

  const variantId = 'gid://shopify/ProductVariant/mock-' + Math.random().toString(36).substring(7);

  return {
    id: 'gid://shopify/Product/mock-product',
    title,
    vendor: 'Vanue Glams',
    handle,
    descriptionHtml: '<p>Experience the luxury of Vanue Glams. Enriched with botanical extracts and clinically proven actives to bring out your natural radiance. Cleanses, nourishes, and transforms—every wash, every day.</p>',
    options: [{ name: 'Size', values: ['Standard'] }],
    selectedOrFirstAvailableVariant: {
      id: variantId,
      title: 'Standard',
      availableForSale: true,
      price: { amount: price, currencyCode: 'INR' },
      compareAtPrice: { amount: (parseInt(price) * 2).toString(), currencyCode: 'INR' },
      selectedOptions: [{ name: 'Size', value: 'Standard' }],
      image: { url: image, altText: title, width: 800, height: 800 },
    },
    media: {
      nodes: [
        {
          __typename: 'MediaImage',
          id: 'gid://shopify/MediaImage/mock',
          mediaContentType: 'IMAGE',
          alt: title,
          previewImage: { url: image },
          image: { url: image, width: 800, height: 800, altText: title }
        }
      ]
    },
    variants: {
      nodes: [
        {
          id: variantId,
          title: 'Standard',
          availableForSale: true,
          price: { amount: price, currencyCode: 'INR' },
          compareAtPrice: { amount: (parseInt(price) * 2).toString(), currencyCode: 'INR' },
          selectedOptions: [{ name: 'Size', value: 'Standard' }],
          image: { url: image, altText: title, width: 800, height: 800 },
        }
      ]
    }
  };
}

async function loadCriticalData({
  params,
  request,
  context,
}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{shop, product}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }).catch(() => ({shop: {primaryDomain: {url: 'http://localhost:3000'}, shippingPolicy: null, refundPolicy: null}, product: null})),
  ]);

  const finalProduct = product?.id ? product : getMockProduct(productHandle);

  const recommended = finalProduct.id === 'gid://shopify/Product/mock-product'
    ? Promise.resolve({ nodes: [] })
    : getRecommendedProducts(context.storefront, finalProduct.id);

  const selectedVariant = finalProduct.selectedOrFirstAvailableVariant ?? {};
  // For mock product, just use the single variant instead of trying to map adjacents
  const variants = finalProduct.id === 'gid://shopify/Product/mock-product'
    ? finalProduct.variants.nodes
    : getAdjacentAndFirstAvailableVariants(finalProduct);

  const seo = seoPayload.product({
    product: {...finalProduct, variants},
    selectedVariant,
    url: request.url,
  });

  return {
    product: finalProduct,
    variants,
    shop: shop || {primaryDomain: {url: 'http://localhost:3000'}, shippingPolicy: null, refundPolicy: null},
    storeDomain: shop?.primaryDomain?.url || 'http://localhost:3000',
    recommended,
    seo,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(args: LoaderFunctionArgs) {
  // Put any API calls that are not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

const INGREDIENTS_MAP: Record<string, Ingredient[]> = {
  '10-vitamin-c-serum-vanue-glams': [
    {
      name: '10% Vitamin C',
      desc: 'A potent antioxidant that neutralizes free radicals, boosts collagen production, and visibly brightens the skin, leaving a radiant, glowing complexion.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714',
    },
    {
      name: 'Pro Vitamin B5',
      desc: 'Also known as Panthenol, it acts as a deep moisturizer and helps keep skin soft, smooth, and healthy while enhancing the healing process.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399',
    },
    {
      name: 'Hyaluronic Acid',
      desc: 'Acts like a sponge for the skin, retaining up to 1000 times its weight in water to provide intense, long-lasting hydration and plumping.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/43.jpg?v=1756558491',
    }
  ],
  'vanue-glams-body-wash-deep-cleansing-exfoliating-hydrating-formula': [
    {
      name: '2% Lactic Acid',
      desc: 'An alpha hydroxy acid (AHA) that gently exfoliates dead skin cells, improving texture and promoting a brighter, smoother body surface.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/1_8e974002-6d60-4e59-b4ed-f797f73ed928.jpg?v=1757595405',
    },
    {
      name: '1% Salicylic Acid',
      desc: 'A beta hydroxy acid (BHA) that penetrates deep into pores to dissolve excess sebum, making it highly effective at preventing body breakouts and acne.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/13.jpg?v=1756532028',
    },
    {
      name: 'Ceramide Complex',
      desc: 'Essential lipids that form the skin\'s natural barrier, locking in moisture and protecting against environmental stressors.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/37.jpg?v=1756532728',
    }
  ],
  'default': [
    {
      name: 'Niacinamide',
      desc: 'A versatile vitamin B3 derivative that minimizes enlarged pores, evens skin tone, and fortifies the delicate skin barrier.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/8_cf164dfd-2b0e-41bc-929a-ff6c114fccfa.jpg?v=1757595500',
    },
    {
      name: 'Shea Butter',
      desc: 'A rich, nourishing emollient loaded with vitamins and fatty acids to deliver profound hydration and soothe dry, irritated skin.',
      image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/37.jpg?v=1756532728',
    }
  ]
};

export default function Product() {
  const {product, shop, recommended, variants, storeDomain} =
    useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale =
    price?.amount &&
    compareAtPrice?.amount &&
    price.amount < compareAtPrice.amount;

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div
        style={{
          background: '#FAF9F7',
          borderBottom: '1px solid rgba(201,169,110,0.1)',
          padding: '0.75rem 1.5rem',
        }}
      >
        <div
          className="max-w-7xl mx-auto"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: '#9a9086',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <a href="/" style={{color: '#9a9086', textDecoration: 'none'}}>Home</a>
          <span>›</span>
          <a href="/collections/all" style={{color: '#9a9086', textDecoration: 'none'}}>Shop</a>
          <span>›</span>
          <span style={{color: '#1a1a1a'}}>{title}</span>
        </div>
      </div>

      {/* ── Main Product Grid ── */}
      <Section className="px-0 md:px-8 lg:px-12" style={{background: '#FAF9F7'}}>
        <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
          {/* Gallery */}
          <ProductGallery
            media={media.nodes}
            className="w-full lg:col-span-2"
          />

          {/* Info Panel */}
          <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
            <section
              className="flex flex-col w-full max-w-xl gap-6 p-6 md:mx-auto md:max-w-sm md:px-0"
              style={{paddingTop: '2rem'}}
            >
              {/* Eyebrow */}
              <div>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: '#c9a96e', display: 'block', marginBottom: '0.5rem',
                  }}
                >
                  {vendor || 'Vanue Glams'}
                </span>

                {/* Title */}
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                    fontWeight: 400, lineHeight: 1.25,
                    color: '#1a1a1a', marginBottom: '0.75rem',
                  }}
                >
                  {title}
                </h1>

                {/* Stars + B1G1 badge */}
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#c9a96e">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                      </svg>
                    ))}
                    <span style={{fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8a7968', marginLeft: '4px'}}>
                      (49 reviews)
                    </span>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'rgba(201,169,110,0.12)',
                      border: '1px solid rgba(201,169,110,0.3)',
                      borderRadius: '100px', padding: '2px 10px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px', fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: '#8a7050',
                    }}
                  >
                    <span style={{color: '#c9a96e'}}>✦</span>
                    Buy 1 Get 1 Free
                  </span>
                </div>
              </div>

              {/* Price */}
              <div
                style={{
                  display: 'flex', alignItems: 'baseline', gap: '0.75rem',
                  padding: '1rem 0',
                  borderTop: '1px solid rgba(201,169,110,0.12)',
                  borderBottom: '1px solid rgba(201,169,110,0.12)',
                }}
              >
                {price && (
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.75rem', fontWeight: 400, color: '#1a1a1a',
                    }}
                  >
                    Rs. {parseFloat(price.amount).toFixed(0)}
                  </span>
                )}
                {isOnSale && compareAtPrice && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem', color: '#9a9086',
                      textDecoration: 'line-through',
                    }}
                  >
                    Rs. {parseFloat(compareAtPrice.amount).toFixed(0)}
                  </span>
                )}
                {isOnSale && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px', fontWeight: 700,
                      color: '#fff', background: '#c9a96e',
                      borderRadius: '100px', padding: '2px 8px',
                    }}
                  >
                    SALE
                  </span>
                )}
              </div>

              {/* Product Form */}
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                storeDomain={storeDomain}
              />

              {/* Details accordions */}
              <div className="grid gap-3 pt-2">
                {descriptionHtml && (
                  <ProductDetail title="Product Details" content={descriptionHtml} />
                )}
                {shippingPolicy?.body && (
                  <ProductDetail
                    title="Shipping"
                    content={getExcerpt(shippingPolicy.body)}
                    learnMore={`/policies/${shippingPolicy.handle}`}
                  />
                )}
                {refundPolicy?.body && (
                  <ProductDetail
                    title="Returns"
                    content={getExcerpt(refundPolicy.body)}
                    learnMore={`/policies/${refundPolicy.handle}`}
                  />
                )}
              </div>

              {/* Trust row */}
              <div
                style={{
                  display: 'flex', gap: '1rem', flexWrap: 'wrap',
                  padding: '1rem 0',
                  borderTop: '1px solid rgba(201,169,110,0.1)',
                }}
              >
                {[
                  {icon: '🚚', text: 'Free Shipping'},
                  {icon: '↩', text: 'Easy Returns'},
                  {icon: '🔒', text: 'Secure Payment'},
                ].map((item) => (
                  <div
                    key={item.text}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px', color: '#6b6158',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Section>

      {/* ── Dynamic Ingredients ── */}
      <DynamicIngredients ingredients={INGREDIENTS_MAP[product.handle] || INGREDIENTS_MAP.default} />

      {/* ── You May Also Like ── */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <ProductSwimlane title="You May Also Like" products={products} />
          )}
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}


export function ProductForm({
  productOptions,
  selectedVariant,
  storeDomain,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        {productOptions.map((option, optionIndex) => (
          <div
            key={option.name}
            className="product-options flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {option.optionValues.length > 7 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({open}) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex items-center justify-between w-full py-3 px-4 border border-primary',
                            open
                              ? 'rounded-b md:rounded-t md:rounded-b-none'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {
                              selectedVariant?.selectedOptions[optionIndex]
                                .value
                            }
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.optionValues
                            .filter((value) => value.available)
                            .map(
                              ({
                                isDifferentProduct,
                                name,
                                variantUriQuery,
                                handle,
                                selected,
                              }) => (
                                <Listbox.Option
                                  key={`option-${option.name}-${name}`}
                                  value={name}
                                >
                                  <Link
                                    {...(!isDifferentProduct
                                      ? {rel: 'nofollow'}
                                      : {})}
                                    to={`/products/${handle}?${variantUriQuery}`}
                                    preventScrollReset
                                    className={clsx(
                                      'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                      selected && 'bg-primary/10',
                                    )}
                                    onClick={() => {
                                      if (!closeRef?.current) return;
                                      closeRef.current.click();
                                    }}
                                  >
                                    {name}
                                    {selected && (
                                      <span className="ml-2">
                                        <IconCheck />
                                      </span>
                                    )}
                                  </Link>
                                </Listbox.Option>
                              ),
                            )}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                option.optionValues.map(
                  ({
                    isDifferentProduct,
                    name,
                    variantUriQuery,
                    handle,
                    selected,
                    available,
                    swatch,
                  }) => (
                    <Link
                      key={option.name + name}
                      {...(!isDifferentProduct ? {rel: 'nofollow'} : {})}
                      to={`/products/${handle}?${variantUriQuery}`}
                      preventScrollReset
                      prefetch="intent"
                      replace
                      className={clsx(
                        'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                        selected ? 'border-primary/50' : 'border-primary/0',
                        available ? 'opacity-100' : 'opacity-50',
                      )}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  ),
                )
              )}
            </div>
          </div>
        ))}
        {selectedVariant && (
          <div className="grid items-stretch gap-3">
            {isOutOfStock ? (
              <button
                disabled
                style={{
                  width: '100%', padding: '1rem', textAlign: 'center',
                  fontFamily: 'Inter, sans-serif', fontSize: '12px',
                  fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                  background: '#e8e4de', color: '#9a9086',
                  border: 'none', borderRadius: '2px', cursor: 'not-allowed',
                }}
              >
                Sold Out
              </button>
            ) : (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id!,
                    quantity: 1,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
                style={{
                  width: '100%', padding: '1rem',
                  background: '#1a1a1a', color: '#faf9f7',
                  fontFamily: 'Inter, sans-serif', fontSize: '12px',
                  fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                  border: 'none', borderRadius: '2px', cursor: 'pointer',
                  transition: 'background 0.3s ease, transform 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <span>Add to Cart</span>
              </AddToCartButton>
            )}
            {!isOutOfStock && (
              <>
                <ShopPayButton
                  width="100%"
                  variantIds={[selectedVariant?.id!]}
                  storeDomain={storeDomain}
                />
                
                {/* Available on Amazon */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-2 w-full py-4 mt-2 overflow-hidden bg-white border border-[#ff9900] rounded-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#e38800]"
                >
                  <div className="absolute inset-0 w-full h-full bg-[#ff9900]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  
                  <span className="relative font-['Inter',sans-serif] text-[13px] font-semibold text-[#1a1a1a]">
                    Available on
                  </span>
                  
                  <div className="relative flex items-center h-5">
                    {/* Amazon Logo SVG */}
                    <svg viewBox="0 0 100 30" height="24" className="text-[#1a1a1a] translate-y-[2px] group-hover:scale-105 transition-transform duration-300">
                      <path fill="currentColor" d="M63.5,10.6c-0.2-0.3-0.5-0.5-0.9-0.5c-0.6,0-1,0.5-1,1.1v9.3c-1.1,0.8-2.6,1.4-4.5,1.4c-2,0-3.3-0.5-4-1.5 c-0.5-0.8-0.8-2-0.8-3.6c0-2.4,0.6-3.8,1.6-4.6c1.1-0.9,2.9-1.3,5.1-1.3c0.9,0,1.7,0.1,2.5,0.3V9.8c0-1.8-0.3-3.1-1.1-3.9 c-0.8-0.8-2-1.2-3.8-1.2c-1.4,0-2.5,0.2-3.4,0.6c-0.6,0.3-1,0.9-1,1.5c0,0.5,0.3,1,0.8,1.1c0.8,0.3,1.9,0.5,3.1,0.5 c0.8,0,1.4,0.2,1.8,0.5c0.4,0.3,0.5,0.8,0.5,1.4v0.5c-0.7-0.1-1.4-0.2-2.1-0.2c-3.1,0-5.5,0.7-7.2,2c-1.6,1.3-2.4,3.2-2.4,5.8 c0,2.1,0.5,3.8,1.5,4.9c1.2,1.3,3,2,5.2,2c2.2,0,4.2-0.8,5.8-2.5v1.8c0,0.5,0.4,0.9,0.9,0.9h1.7c0.5,0,0.9-0.4,0.9-0.9V11.2 C63.7,10.9,63.6,10.7,63.5,10.6z M60.1,16.4c-0.4,1.8-1.4,3.5-3.1,4.7c-0.6,0.4-1.3,0.6-2,0.6c-1,0-1.7-0.3-2.1-0.8 c-0.4-0.5-0.6-1.3-0.6-2.3c0-1.2,0.3-2,0.9-2.5c0.7-0.6,1.8-0.9,3.5-0.9c1,0,2.2,0.1,3.4,0.4V16.4z"/>
                      <path fill="currentColor" d="M37.8,4.9c-0.5,0-0.9,0.4-0.9,0.9v1.6C35.2,5.8,33.1,5,30.8,5c-2.3,0-4.2,0.8-5.5,2.3c-1.4,1.6-2.1,3.7-2.1,6.3 c0,2.6,0.7,4.8,2.1,6.3c1.3,1.5,3.2,2.3,5.5,2.3c2.3,0,4.4-0.8,6.1-2.4v1.6c0,0.5,0.4,0.9,0.9,0.9h1.8c0.5,0,0.9-0.4,0.9-0.9V5.8 c0-0.5-0.4-0.9-0.9-0.9H37.8z M36.8,13.6c0,2.1-0.5,3.6-1.5,4.6c-1,1-2.2,1.5-3.7,1.5c-1.5,0-2.8-0.5-3.7-1.5 c-1-1-1.5-2.6-1.5-4.6s0.5-3.6,1.5-4.6c1-1,2.2-1.5,3.7-1.5c1.5,0,2.8,0.5,3.7,1.5C36.3,10,36.8,11.6,36.8,13.6z"/>
                      <path fill="currentColor" d="M85.9,4.9c-0.5,0-0.9,0.4-0.9,0.9v1.6C83.3,5.8,81.2,5,78.9,5c-2.3,0-4.2,0.8-5.5,2.3c-1.4,1.6-2.1,3.7-2.1,6.3 c0,2.6,0.7,4.8,2.1,6.3c1.3,1.5,3.2,2.3,5.5,2.3c2.3,0,4.4-0.8,6.1-2.4v1.6c0,0.5,0.4,0.9,0.9,0.9h1.8c0.5,0,0.9-0.4,0.9-0.9V5.8 c0-0.5-0.4-0.9-0.9-0.9H85.9z M84.9,13.6c0,2.1-0.5,3.6-1.5,4.6c-1,1-2.2,1.5-3.7,1.5c-1.5,0-2.8-0.5-3.7-1.5 c-1-1-1.5-2.6-1.5-4.6s0.5-3.6,1.5-4.6c1-1,2.2-1.5,3.7-1.5c1.5,0,2.8,0.5,3.7,1.5C84.4,10,84.9,11.6,84.9,13.6z"/>
                      <path fill="currentColor" d="M51.9,4.9h-1.8c-0.2,0-0.4,0.1-0.6,0.3L45.2,11L41,5.2c-0.2-0.2-0.4-0.3-0.6-0.3h-1.8c-0.4,0-0.6,0.4-0.4,0.7 l6.2,8.6l-6.6,9.5c-0.2,0.3-0.1,0.7,0.3,0.7h1.9c0.2,0,0.5-0.1,0.6-0.3l4.7-6.8l4.7,6.8c0.2,0.2,0.4,0.3,0.6,0.3h1.8 c0.4,0,0.6-0.4,0.4-0.7l-6.6-9.5l6.1-8.6C52.5,5.3,52.3,4.9,51.9,4.9z"/>
                      <path fill="currentColor" d="M20.2,4.9h-1.7c-0.3,0-0.5,0.1-0.7,0.4L10,21.5c-0.1,0.3,0.1,0.7,0.4,0.7h1.9c0.2,0,0.4-0.1,0.5-0.3 l1.6-3.8h7.9l1.6,3.8c0.1,0.2,0.3,0.3,0.5,0.3h1.9c0.4,0,0.6-0.4,0.5-0.7L18.9,5.3C18.8,5,18.5,4.9,18.2,4.9z M16.9,15.6h-5.4 l2.7-6.4L16.9,15.6z"/>
                      <path fill="currentColor" d="M100.8,4.9h-1.7c-0.2,0-0.4,0.1-0.5,0.3l-5.6,8.1v-7.6c0-0.5-0.4-0.9-0.9-0.9h-1.8c-0.5,0-0.9,0.4-0.9,0.9v16 c0,0.5,0.4,0.9,0.9,0.9h1.8c0.5,0,0.9-0.4,0.9-0.9v-7.6l5.6,8.1c0.2,0.2,0.4,0.3,0.5,0.3h1.7c0.4,0,0.6-0.4,0.4-0.7L94.7,13l6.4-7.4 C101.4,5.3,101.2,4.9,100.8,4.9z"/>
                      {/* Arrow */}
                      <path fill="#ff9900" d="M64.6,23.3c-7.3,3.7-16.7,5.4-25.7,5.4c-11.4,0-22.3-3.1-30.8-8.9c-1.1-0.7-0.7-2,0.5-1.5 c10.3,4.6,22,6.9,33.5,6.9c8.6,0,16.8-1.5,23.1-4.2C66.5,20.6,65.9,22.6,64.6,23.3z"/>
                      <path fill="#ff9900" d="M68.7,21.9c0.1-1.3-1.6-2-3-1.4c-1.4,0.6-2.5,2-2.1,3.4c0.2,0.6,0.6,1.1,1,1.5c-0.5-0.5-1.1-1-1.6-1.5 c-0.6-0.6-0.9-1.5-0.6-2.3c0.3-0.8,1.1-1.2,1.9-1.2c1,0,2.1,0.6,2.6,1.5C67.4,22.9,68.6,23.2,68.7,21.9z"/>
                    </svg>
                  </div>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="w-8 h-8"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" style={{borderBottom: '1px solid rgba(201,169,110,0.15)', paddingBottom: '0.5rem'}}>
      {({open}) => (
        <>
          <Disclosure.Button
            style={{
              width: '100%', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '0.95rem', fontWeight: 400, color: '#1a1a1a',
              }}
            >
              {title}
            </span>
            <IconClose
              className={clsx(
                'transition-transform transform-gpu duration-200',
                !open && 'rotate-[45deg]',
              )}
              style={{color: '#c9a96e', flexShrink: 0}}
            />
          </Disclosure.Button>

          <Disclosure.Panel style={{paddingBottom: '1rem'}}>
            <div
              className="prose"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem', lineHeight: 1.7, color: '#6b6158',
              }}
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <Link
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '11px',
                  fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#c9a96e', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem',
                }}
                to={learnMore}
              >
                Learn more →
              </Link>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    media(first: 7) {
      nodes {
        ...Media
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
