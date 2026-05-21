export const CART_RECOMMENDED_PRODUCT_HANDLES = [
  'vanue-glams-purify-face-cleanser-gentle-acne-preventing-deep-clean-formula-with-3-niacinamide-and-vitamin-e-removes-dirt-excess-oil-and-brightens-skin-tone-suitable-for-all-skin-types-50ml',
  'vanue-glams-avocado-hair-serum-frizz-free-shine-with-keratin-argan-oil',
  'vanue-glams-natural-hair-oil-18-botanical-oils-extracts-for-strong-shiny-healthy-hair',
  '10-vitamin-c-serum-vanue-glams',
] as const;

export const CART_RECOMMENDED_PRODUCTS = [
  {
    handle: CART_RECOMMENDED_PRODUCT_HANDLES[0],
    title: 'Purify Face Cleanser - 50ml',
    price: '249',
    compareAtPrice: '498',
    image:
      'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714',
  },
  {
    handle: CART_RECOMMENDED_PRODUCT_HANDLES[1],
    title: 'Avocado Hair Serum - 50ml',
    price: '599',
    compareAtPrice: '1198',
    image:
      'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/43.jpg?v=1756558491',
  },
  {
    handle: CART_RECOMMENDED_PRODUCT_HANDLES[2],
    title: 'Natural Hair Oil - 100ml',
    price: '599',
    compareAtPrice: '1198',
    image:
      'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678',
  },
  {
    handle: CART_RECOMMENDED_PRODUCT_HANDLES[3],
    title: '10% Vitamin C Serum - 30ml',
    price: '689',
    compareAtPrice: '1378',
    image:
      'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399',
  },
] as const;

export type CartRecommendedProduct =
  (typeof CART_RECOMMENDED_PRODUCTS)[number];
