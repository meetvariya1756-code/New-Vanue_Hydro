import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {HomeHero3D} from '~/components/homepage/HomeHero3D';
import {ProductShowcase3D} from '~/components/homepage/ProductShowcase3D';
import {ParallaxBand} from '~/components/homepage/ParallaxBand';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {
  parseHomepageConfig,
  type HomepageShopMetafields,
} from '~/lib/homepage.server';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import type {ProductCardFragment} from 'storefrontapi.generated';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {params, context} = args;
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    throw new Response(null, {status: 404});
  }

  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const [{shop, hero}] = await Promise.all([
    context.storefront.query(HOMEPAGE_SEO_QUERY, {
      variables: {handle: 'freestyle'},
    }),
  ]);

  const homepageConfig = parseHomepageConfig(
    shop as HomepageShopMetafields,
    hero,
  );

  return {
    shop,
    homepageConfig,
    seo: seoPayload.home({url: request.url}),
  };
}

function loadDeferredData({context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  const featuredProducts = loadHomepageProducts(context, country, language);

  const secondaryHero = context.storefront
    .query(COLLECTION_HERO_QUERY, {
      variables: {handle: 'backcountry', country, language},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  const featuredCollections = context.storefront
    .query(FEATURED_COLLECTIONS_QUERY, {
      variables: {country, language},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    featuredProducts,
    secondaryHero,
    featuredCollections,
  };
}

async function loadHomepageProducts(
  context: LoaderFunctionArgs['context'],
  country: string,
  language: string,
) {
  const {storefront} = context;

  try {
    const {shop} = await storefront.query(HOMEPAGE_SHOP_SETTINGS_QUERY, {
      variables: {country, language},
    });
    const collectionHandle =
      shop?.productsCollection?.value?.trim() || null;

    if (collectionHandle) {
      const result = await storefront.query(
        HOMEPAGE_COLLECTION_PRODUCTS_QUERY,
        {
          variables: {handle: collectionHandle, country, language},
        },
      );
      const nodes = result?.collection?.products?.nodes ?? [];
      if (nodes.length) {
        return {products: {nodes}};
      }
    }

    const result = await storefront.query(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {country, language},
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Homepage() {
  const {homepageConfig, featuredProducts, secondaryHero, featuredCollections} =
    useLoaderData<typeof loader>();

  return (
    <>
      <HomeHero3D config={homepageConfig} />

      {featuredProducts && (
        <Suspense
          fallback={
            <ProductShowcase3D
              title={homepageConfig.productsTitle}
              products={[]}
              accentColor={homepageConfig.accentColor}
            />
          }
        >
          <Await resolve={featuredProducts}>
            {(response) => {
              const nodes =
                response?.products?.nodes ??
                response?.collection?.products?.nodes ??
                [];
              return (
                <ProductShowcase3D
                  title={homepageConfig.productsTitle}
                  products={nodes as ProductCardFragment[]}
                  accentColor={homepageConfig.accentColor}
                  viewAllLink={
                    homepageConfig.productsCollectionHandle
                      ? `/collections/${homepageConfig.productsCollectionHandle}`
                      : '/collections/all'
                  }
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {secondaryHero && (
        <Suspense>
          <Await resolve={secondaryHero}>
            {(response) => {
              if (!response?.hero) return null;
              const imageUrl =
                response.hero.spread?.reference &&
                'image' in response.hero.spread.reference
                  ? response.hero.spread.reference.image?.url
                  : null;
              return (
                <ParallaxBand
                  config={homepageConfig}
                  imageUrl={imageUrl}
                  handle={response.hero.handle}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {(response) => {
              if (!response?.collections?.nodes) return null;
              return (
                <FeaturedCollections
                  collections={response.collections}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

const HOMEPAGE_SHOP_FRAGMENT = `#graphql
  fragment HomepageShopSettings on Shop {
    name
    heading: metafield(namespace: "homepage", key: "heading") {
      value
    }
    subheading: metafield(namespace: "homepage", key: "subheading") {
      value
    }
    ctaText: metafield(namespace: "homepage", key: "cta_text") {
      value
    }
    ctaLink: metafield(namespace: "homepage", key: "cta_link") {
      value
    }
    bgColor: metafield(namespace: "homepage", key: "background_color") {
      value
    }
    textColor: metafield(namespace: "homepage", key: "text_color") {
      value
    }
    accentColor: metafield(namespace: "homepage", key: "accent_color") {
      value
    }
    productsTitle: metafield(namespace: "homepage", key: "products_title") {
      value
    }
    productsCollection: metafield(namespace: "homepage", key: "products_collection") {
      value
    }
    backgroundImage: metafield(namespace: "homepage", key: "background_image") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
` as const;

const HOMEPAGE_SHOP_SETTINGS_QUERY = `#graphql
  query homepageShopSettings($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      ...HomepageShopSettings
    }
  }
  ${HOMEPAGE_SHOP_FRAGMENT}
` as const;

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
` as const;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      ...HomepageShopSettings
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
  ${HOMEPAGE_SHOP_FRAGMENT}
` as const;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
` as const;

export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const HOMEPAGE_COLLECTION_PRODUCTS_QUERY = `#graphql
  query homepageCollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 12, sortKey: CREATED, reverse: true) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
` as const;
