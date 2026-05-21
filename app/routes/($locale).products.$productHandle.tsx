import {useRef, useState, Suspense} from 'react';
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

const HAIR_OIL_TITLE =
  'Vanue Glams Natural Hair Oil - Infused With 18 Botanical Oils & Extracts - Argan, Almond, Rosemary, Jojoba, Onion - Nourishes, Strengthens, And Promotes Hair Growth - 100ml';

const HAIR_OIL_DESCRIPTION_HTML = `
  <p>A premium blend of 18 natural oils and herbal extracts including Argan, Almond, Bhringraj, Hibiscus, Aloe Vera, and Curry Leaves. This lightweight, non-sticky hair oil reduces hair fall, strengthens roots, nourishes scalp, and promotes faster hair growth - giving you shinier, softer, and healthier hair with every drop.</p>
  <p><strong>Manufacturer:</strong><br />DEV CARE<br />9/10, Sai Industrial Estate, Ta. Kamrej,<br />Dist. Surat - 394185, Gujarat, India.</p>
  <p><strong>Marketed By:</strong><br />Vanue Glams<br />Surat, Gujarat, India.</p>
  <p>Net Quantity: 100 ml<br />MRP: Rs. 599 (incl. of all taxes)<br />Customer Care: support@vanueglams.com | +91 6359565511</p>
`;

const HAIR_OIL_BENEFITS_HTML = `
  <ul>
    <li><strong>Reduces Hair Fall</strong> - Strengthens roots and minimizes breakage.</li>
    <li><strong>Boosts Shine & Smoothness</strong> - Argan and Coconut Oil give silky softness.</li>
    <li><strong>Nourishes Scalp Deeply</strong> - Aloe Vera, Hibiscus and Licorice soothe and hydrate.</li>
    <li><strong>Promotes Hair Growth</strong> - Bhringraj and Curry Leaves stimulate new growth.</li>
    <li><strong>Rich in Vitamin E</strong> - Repairs damage and improves overall hair texture.</li>
    <li><strong>Mild Natural Fragrance</strong> - Refreshing aroma without heaviness.</li>
  </ul>
`;

const HAIR_OIL_CARE_HTML = `
  <ul>
    <li>Take 2-3 teaspoons of oil and apply directly to the scalp and hair strands.</li>
    <li>Massage gently with fingertips in circular motions for 5-10 minutes.</li>
    <li>Leave it on for at least 1 hour, or overnight for best results.</li>
    <li>Wash off with a mild shampoo.</li>
    <li>Use 2-3 times a week for stronger, shinier, and healthier hair.</li>
  </ul>
`;

const HAIR_OIL_MEDIA_IMAGES = [
  'https://vanueglams.com/cdn/shop/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678',
  'https://vanueglams.com/cdn/shop/files/23_3dd00bee-0675-4185-807f-ca615f9ae666.jpg?v=1756723678',
  'https://vanueglams.com/cdn/shop/files/25_285d6b56-942d-473a-94a3-4b911f2c4e33.jpg?v=1756723678',
  'https://vanueglams.com/cdn/shop/files/27_6e990773-1864-4ea2-8d99-40d9706aca09.jpg?v=1756723678',
  'https://vanueglams.com/cdn/shop/files/HAIROILBACK.jpg?v=1756723678',
] as const;

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
    title = HAIR_OIL_TITLE;
    price = '599';
    image =
      'https://vanueglams.com/cdn/shop/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678';
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

  const galleryImages = getFallbackGalleryImages(handle, image);

  return {
    id: 'gid://shopify/Product/mock-product',
    title,
    vendor: 'Vanue Glams',
    handle,
    descriptionHtml: handle.includes('hair-oil')
      ? HAIR_OIL_DESCRIPTION_HTML
      : '<p>Experience the luxury of Vanue Glams. Enriched with botanical extracts and clinically proven actives to bring out your natural radiance. Cleanses, nourishes, and transforms every wash, every day.</p>',
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
      nodes: createFallbackMediaNodes(galleryImages, title),
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

function getFallbackGalleryImages(handle: string, primaryImage: string) {
  if (!handle.includes('hair-oil')) return [primaryImage];

  return [...HAIR_OIL_MEDIA_IMAGES];
}

function createFallbackMediaNodes(images: string[], title: string) {
  return [...new Set(images)].map((url, index) => ({
    __typename: 'MediaImage',
    id: `gid://shopify/MediaImage/fallback-${index}`,
    mediaContentType: 'IMAGE',
    alt: `${title} image ${index + 1}`,
    previewImage: {url},
    image: {url, width: 900, height: 900, altText: `${title} image ${index + 1}`},
  }));
}

function withFallbackGallery(product: any) {
  const mediaNodes = product?.media?.nodes ?? [];
  if (product?.handle?.includes('hair-oil')) {
    return {
      ...product,
      media: {
        ...product.media,
        nodes: createFallbackMediaNodes([...HAIR_OIL_MEDIA_IMAGES], product.title),
      },
    };
  }

  if (mediaNodes.length > 1) return product;

  const primaryImage =
    product?.selectedOrFirstAvailableVariant?.image?.url ||
    mediaNodes[0]?.image?.url ||
    mediaNodes[0]?.previewImage?.url;

  if (!primaryImage) return product;

  return {
    ...product,
    media: {
      ...product.media,
      nodes: createFallbackMediaNodes(
        getFallbackGalleryImages(product.handle, primaryImage),
        product.title,
      ),
    },
  };
}

function withReferenceProductData(product: any) {
  if (!product?.handle?.includes('hair-oil')) return product;

  return {
    ...product,
    title: HAIR_OIL_TITLE,
    vendor: 'Vanue Glams',
    descriptionHtml: HAIR_OIL_DESCRIPTION_HTML,
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

  const finalProduct = withFallbackGallery(
    withReferenceProductData(product?.id ? product : getMockProduct(productHandle)),
  );

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
  const detailSections = product.handle.includes('hair-oil')
    ? [
        {title: 'Benefits', content: HAIR_OIL_BENEFITS_HTML},
        {title: 'Care Instructions', content: HAIR_OIL_CARE_HTML},
        {title: 'Description', content: HAIR_OIL_DESCRIPTION_HTML},
      ]
    : [
        ...(descriptionHtml
          ? [{title: 'Product Details', content: descriptionHtml}]
          : []),
        ...(shippingPolicy?.body
          ? [
              {
                title: 'Shipping',
                content: getExcerpt(shippingPolicy.body),
                learnMore: `/policies/${shippingPolicy.handle}`,
              },
            ]
          : []),
        ...(refundPolicy?.body
          ? [
              {
                title: 'Returns',
                content: getExcerpt(refundPolicy.body),
                learnMore: `/policies/${refundPolicy.handle}`,
              },
            ]
          : []),
      ];

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="luxury-product-breadcrumb" style={{padding: '0.75rem 1.5rem'}}>
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
      <Section className="luxury-product-shell px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="luxury-product-grid mx-auto max-w-7xl">
          {/* Gallery */}
          <ProductGallery
            media={media.nodes}
            className="w-full"
          />

          {/* Info Panel */}
          <div>
            <section
              className="luxury-product-panel flex w-full flex-col gap-6 p-5 md:p-7"
            >
              {/* Eyebrow */}
              <div className="grid gap-4">
                <span
                  className="luxury-product-kicker"
                >
                  {vendor || 'Vanue Glams'}
                </span>

                {/* Title */}
                <h1 className="luxury-product-title">
                  {title}
                </h1>

                {descriptionHtml && (
                  <div
                    className="luxury-product-description line-clamp-4"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                )}

                {/* Stars + B1G1 badge */}
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#d4af37">
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
                className="luxury-price-panel"
                style={{
                  display: 'flex', alignItems: 'baseline', gap: '0.75rem',
                  padding: '1rem',
                }}
              >
                {price && (
                  <span
                    className="luxury-price"
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

              <div className="luxury-promise-panel grid gap-3 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="luxury-product-kicker">Availability</span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: selectedVariant?.availableForSale
                        ? '#2f6f44'
                        : '#9a2f2f',
                    }}
                  >
                    {selectedVariant?.availableForSale ? 'In stock' : 'Sold out'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-[0.12em] text-[#6b6158]">
                  <span>Free shipping</span>
                  <span>Easy returns</span>
                  <span>Secure pay</span>
                </div>
              </div>

              {/* Product Form */}
              <ProductForm
                amazonUrl={`https://www.amazon.in/s?k=${encodeURIComponent(
                  title,
                )}`}
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                storeDomain={storeDomain}
              />

              {/* Details accordions */}
              <div className="grid gap-3 pt-2">
                {detailSections.map((section) => (
                  <ProductDetail
                    key={section.title}
                    title={section.title}
                    content={section.content}
                    learnMore={'learnMore' in section ? section.learnMore : undefined}
                  />
                ))}
              </div>

              {/* Trust row */}
              <div
                style={{
                  display: 'none', gap: '1rem', flexWrap: 'wrap',
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
  amazonUrl,
  productOptions,
  selectedVariant,
  storeDomain,
}: {
  amazonUrl: string;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  return (
    <div className="grid gap-7">
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
          <div className="grid items-stretch gap-4">
            <div className="luxury-quantity-row">
              <span className="luxury-product-kicker">Quantity</span>
              <div className="luxury-quantity-control">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  +
                </button>
              </div>
            </div>
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
                    quantity,
                  },
                ]}
                variant="primary"
                className="luxury-cta"
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
                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: selectedVariant.id!,
                      quantity,
                    },
                  ]}
                  variant="secondary"
                  className="luxury-cta luxury-cta--gold"
                >
                  <span>Buy Now</span>
                </AddToCartButton>
                <ShopPayButton
                  width="100%"
                  variantIds={[selectedVariant?.id!]}
                  storeDomain={storeDomain}
                />
                <div className="luxury-amazon-card">
                  <span>Available on</span>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-amazon-link"
                  >
                    Amazon
                  </a>
                </div>
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
