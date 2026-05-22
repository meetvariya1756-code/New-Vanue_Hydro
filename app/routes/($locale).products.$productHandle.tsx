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
import {ProductGallery} from '~/components/premium/ProductGallery';
import {ProductInfo} from '~/components/premium/ProductInfo';
import {ProductAccordion} from '~/components/premium/ProductAccordion';
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
    <div className="bg-[#fdfbf7] min-h-screen text-[#1a1a1a]">
      {/* ── Breadcrumb ── */}
      <div className="px-4 py-3 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-2 font-sans text-[10px] tracking-widest uppercase text-[#9a9086]">
          <Link to="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
          <span>›</span>
          <Link to="/collections/all" className="hover:text-[#1a1a1a] transition-colors">Shop</Link>
          <span>›</span>
          <span className="text-[#1a1a1a] truncate">{title}</span>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <section className="px-4 py-6 md:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Gallery / Left Side */}
            <div className="lg:col-span-7 w-full">
              <ProductGallery media={media.nodes} />
            </div>

            {/* Info / Right Side */}
            <div className="lg:col-span-5 w-full">
              <ProductInfo
                product={product}
                selectedVariant={selectedVariant}
                productOptions={productOptions}
                storeDomain={storeDomain}
                amazonUrl={`https://www.amazon.in/s?k=${encodeURIComponent(title)}`}
              />
              
              {/* Accordions */}
              <div className="mt-8 border-t border-black/10">
                {detailSections.map((section) => (
                  <ProductAccordion
                    key={section.title}
                    title={section.title}
                    content={section.content}
                    learnMore={'learnMore' in section ? section.learnMore : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Ingredients ── */}
      <div className="mt-12 bg-white">
        <DynamicIngredients ingredients={INGREDIENTS_MAP[product.handle] || INGREDIENTS_MAP.default} />
      </div>

      {/* ── You May Also Like ── */}
      <div className="bg-[#fdfbf7] py-12">
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
      </div>

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
    </div>
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
