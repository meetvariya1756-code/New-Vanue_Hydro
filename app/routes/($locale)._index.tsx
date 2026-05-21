import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {HeroSlider} from '~/components/HeroSlider';
import {AnnouncementMarquee} from '~/components/AnnouncementMarquee';
import {VanueGlamsSection} from '~/components/VanueGlamsSection';
import {ProductFeatureGrid} from '~/components/ProductFeatureGrid';
import {ProductCarousel} from '~/components/ProductCarousel';
import {FullWidthBanner} from '~/components/FullWidthBanner';
import {IngredientsHighlight} from '~/components/IngredientsHighlight';
import {TrustBadges} from '~/components/TrustBadges';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

// ─── Static product data (shown until Shopify data loads / as fallback) ──────
const BESTSELLER_PRODUCTS = [
  {handle:'vanue-glams-purify-face-cleanser-gentle-acne-preventing-deep-clean-formula-with-3-niacinamide-and-vitamin-e-removes-dirt-excess-oil-and-brightens-skin-tone-suitable-for-all-skin-types-50ml', title:'Purify Face Cleanser – 50ml', shortDescription:'Sulphate-free cleanser with 3% Niacinamide & Vitamin E.', price:'249', reviewCount:1, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-avocado-hair-serum-frizz-free-shine-with-keratin-argan-oil', title:'Avocado Hair Serum – 50ml', shortDescription:'Lightweight serum with Avocado Oil, Keratin & Argan Oil.', price:'599', reviewCount:51, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/43.jpg?v=1756558491', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-natural-hair-oil-18-botanical-oils-extracts-for-strong-shiny-healthy-hair', title:'Natural Hair Oil – 100ml', shortDescription:'Premium blend of 18 natural oils including Argan, Almond & Rosemary.', price:'599', reviewCount:50, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-purify-face-cleanser-gentle-acne-control-deep-clean-formula', title:'Purify Face Cleanser – 100ml', shortDescription:'Sulphate-free, non-comedogenic with Niacinamide & Vitamin E.', price:'499', reviewCount:50, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/8_cf164dfd-2b0e-41bc-929a-ff6c114fccfa.jpg?v=1757595500', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-keratin-repair-hair-mask-intense-nourishment-damage-repair', title:'Keratin Repair Hair Mask – 200g', shortDescription:'Deeply nourishing with Hydrolyzed Keratin & Vitamin E.', price:'699', reviewCount:49, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/47.jpg?v=1756532965', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-moisture-cream-deep-hydration-skin-barrier-protection', title:'Moisture Cream – 100g', shortDescription:'Lightweight formula with Shea Butter & Argan Oil.', price:'489', reviewCount:45, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/37.jpg?v=1756532728', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-dandruff-control-shampoo-clear-scalp-stronger-hair', title:'Dandruff Control Shampoo – 250ml', shortDescription:'Gentle formula with Rosemary, Vitamin E & Vitamin B5.', price:'699', reviewCount:36, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/31.jpg?v=1756532420', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-foaming-cleanser-gentle-exfoliation-acne-care', title:'Gentle Foaming Cleanser – 100ml', shortDescription:'2% Salicylic Acid & 3% Glycolic Acid for radiant skin.', price:'499', reviewCount:49, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/13.jpg?v=1756532028', badge:'Buy 1 Get 1 Free'},
];

const NEW_ARRIVALS_PRODUCTS = [
  {handle:'10-vitamin-c-serum-vanue-glams', title:'10% Vitamin C Serum – 30ml', shortDescription:'Radiant, youthful skin with 10% Vitamin C & Pro Vitamin B5.', price:'689', reviewCount:50, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-body-wash-deep-cleansing-exfoliating-hydrating-formula', title:'Exfoliate Body Wash – 250ml', shortDescription:'Deep cleansing with 2% Lactic Acid, 1% Salicylic Acid & Ceramide.', price:'699', reviewCount:49, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/1_8e974002-6d60-4e59-b4ed-f797f73ed928.jpg?v=1757595405', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-avocado-hair-serum-frizz-free-shine-with-keratin-argan-oil', title:'Avocado Hair Serum – 50ml', shortDescription:'Lightweight, non-sticky serum with Avocado Oil & Keratin.', price:'599', reviewCount:51, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/43.jpg?v=1756558491', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-purify-face-cleanser-gentle-acne-control-deep-clean-formula', title:'Purify Face Cleanser – 100ml', shortDescription:'Sulphate-free cleanser for all skin types.', price:'499', reviewCount:50, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/8_cf164dfd-2b0e-41bc-929a-ff6c114fccfa.jpg?v=1757595500', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-foaming-cleanser-gentle-exfoliation-acne-care', title:'Gentle Foaming Cleanser – 100ml', shortDescription:'Exfoliates dead skin, prevents acne & enhances radiance.', price:'499', reviewCount:49, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/13.jpg?v=1756532028', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-dandruff-control-shampoo-clear-scalp-stronger-hair', title:'Dandruff Control Shampoo – 250ml', shortDescription:'Soothes scalp, reduces flakes, strengthens hair.', price:'699', reviewCount:36, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/31.jpg?v=1756532420', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-purify-face-cleanser-gentle-acne-preventing-deep-clean-formula-with-3-niacinamide-and-vitamin-e-removes-dirt-excess-oil-and-brightens-skin-tone-suitable-for-all-skin-types-50ml', title:'Purify Face Cleanser – 50ml', shortDescription:'Gentle cleanser with 3% Niacinamide & Vitamin E.', price:'249', reviewCount:1, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714', badge:'Buy 1 Get 1 Free'},
  {handle:'vanue-glams-natural-hair-oil-18-botanical-oils-extracts-for-strong-shiny-healthy-hair', title:'Natural Hair Oil – 100ml', shortDescription:'18 botanical oils including Argan, Almond, Rosemary & Jojoba.', price:'599', reviewCount:50, image:'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/22_2064f634-392d-4174-8994-b99c2c92ccdf.jpg?v=1756723678', badge:'Buy 1 Get 1 Free'},
];

const BODY_WASH_FEATURES = [
  {title:'Removes Dead Skin Cells', description:'Gently exfoliates to reveal fresh, radiant skin.', icon:'sparkle'},
  {title:'Deep Cleansing Action', description:'Clears impurities, excess oil, and buildup for a refreshed feel.', icon:'droplet'},
  {title:'Acne & Blemish Control', description:'Salicylic acid helps reduce body acne and prevent breakouts.', icon:'shield'},
  {title:'Skin Barrier Protection', description:'Ceramides lock in moisture and strengthen the skin barrier.', icon:'layers'},
  {title:'Hydration Boost', description:'Pro Vitamin B5 soothes, softens, and keeps skin hydrated.', icon:'water'},
  {title:'Bright & Even Skin Tone', description:'Lactic acid smoothens texture and enhances natural glow.', icon:'sun'},
];

// ─── Hair Oil split section (styled inline matching spec) ────────────────────
function HairOilFeature() {
  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #FAF9F7 0%, #F5EFE6 100%)',
        padding: '5rem 1.5rem',
      }}
    >
      <div
        className="max-w-6xl mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
        }}
      >
        {/* Image */}
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
            aspectRatio: '4/5',
          }}
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Hair_Oil.jpg?v=1757670381"
            alt="Vanue Glams Natural Hair Oil"
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
            loading="lazy"
          />
        </div>
        {/* Text */}
        <div>
          <span className="vg-section-eyebrow">Best for Hair</span>
          <h2 className="vg-section-heading">
            Why Choose Vanue Glams Hair Oil?
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: '#4a4540',
              marginBottom: '2rem',
            }}
          >
            Vanue Glams Natural Hair Oil is enriched with 18 botanical oils and
            herbal extracts that deeply nourish your scalp and hair. It helps
            reduce hair fall, strengthens roots, and promotes healthy growth
            while adding natural shine. With its gentle yet effective formula,
            every drop brings softness, strength, and vitality to your hair.
          </p>
          {/* Benefit pills */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem'}}>
            {['Reduces Hair Fall', 'Strengthens Roots', 'Promotes Growth', 'Adds Shine'].map((b) => (
              <span
                key={b}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: '#8a7050',
                  background: 'rgba(201,169,110,0.1)',
                  border: '1px solid rgba(201,169,110,0.25)',
                  borderRadius: '100px',
                  padding: '0.3rem 0.85rem',
                }}
              >
                {b}
              </span>
            ))}
          </div>
          <a
            href="/products/vanue-glams-natural-hair-oil-18-botanical-oils-extracts-for-strong-shiny-healthy-hair"
            className="vg-btn-primary"
          >
            Buy Now
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Loader ──────────────────────────────────────────────────────────────────
export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {params, context, request} = args;
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    throw new Response(null, {status: 404});
  }

  const featuredProducts = context.storefront
    .query(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {country, language},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  let shop = {name: 'Vanue Glams', description: 'Premium cosmetics'};
  try {
    const data = await context.storefront.query(SHOP_QUERY);
    if (data?.shop) {
      shop = {
        name: data.shop.name,
        description: data.shop.description ?? 'Premium cosmetics',
      };
    }
  } catch (_) {}

  return defer({
    featuredProducts,
    shop,
    seo: seoPayload.home({url: request.url}),
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

// ─── Homepage Component ───────────────────────────────────────────────────────
export default function Homepage() {
  const {featuredProducts} = useLoaderData<typeof loader>();

  return (
    <>
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Skin & Hair Intro (existing VanueGlamsSection) */}
      <VanueGlamsSection />

      {/* 3. Body Wash Feature Grid */}
      <ProductFeatureGrid
        heading="Experience skincare that cleanses, nourishes, and transforms—every wash, every day."
        subheading="Why Choose Vanue Glams Body Wash?"
        productImage="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Body_Wash.png?v=1759927360"
        productLink="/products/vanue-glams-body-wash-deep-cleansing-exfoliating-hydrating-formula"
        features={BODY_WASH_FEATURES as any}
      />

      {/* 4. Bestsellers Carousel */}
      <ProductCarousel
        heading="Bestseller"
        badge="Buy 1 Get 1 Free"
        staticProducts={BESTSELLER_PRODUCTS}
      />

      {/* 5. Removed VideoGrid */}

      {/* 6. Vitamin C Serum Full-Width Banner */}
      <FullWidthBanner
        desktopImage="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Banner_2.png?v=1758698150"
        mobileImage="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_Mobile_Size_Banner_2.jpg?v=1758699267"
        eyebrow="Vitamin C Serum"
        heading="Smoother & Brighter Skin"
        description="Vitamin C serum brightens skin, reduces dark spots, boosts collagen, and smooths texture, giving you radiant, healthier, youthful-looking skin."
        cta={{label: 'Click To Buy', path: '/products/10-vitamin-c-serum-vanue-glams'}}
      />

      {/* 7. New Arrivals Carousel */}
      <ProductCarousel
        heading="New Arrivals"
        badge="Buy 1 Get 1 Free"
        staticProducts={NEW_ARRIVALS_PRODUCTS}
      />

      {/* 8. Hair Oil Feature */}
      <HairOilFeature />

      {/* 9. Key Ingredients Section */}
      <IngredientsHighlight />

      {/* 10. Trust Badges */}
      <TrustBadges />
    </>
  );
}

// ─── GraphQL Queries ──────────────────────────────────────────────────────────
const SHOP_QUERY = `#graphql
  query ShopInfo {
    shop {
      name
      description
    }
  }
` as const;

export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
