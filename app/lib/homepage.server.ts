import type {CollectionContentFragment} from 'storefrontapi.generated';

/**
 * Shop metafields (namespace: homepage) — create in Shopify Admin:
 * Settings → Custom data → Shop → Add definition
 *
 * | Key                    | Type              |
 * |------------------------|-------------------|
 * | heading                | Single line text  |
 * | subheading             | Single line text  |
 * | cta_text               | Single line text  |
 * | cta_link               | URL               |
 * | background_color       | Color             |
 * | text_color             | Color             |
 * | accent_color           | Color             |
 * | background_image       | File (image)      |
 * | products_title         | Single line text  |
 * | products_collection    | Single line text  | (collection handle)
 */
export type HomepageShopMetafields = {
  name?: string;
  heading?: {value?: string | null} | null;
  subheading?: {value?: string | null} | null;
  ctaText?: {value?: string | null} | null;
  ctaLink?: {value?: string | null} | null;
  bgColor?: {value?: string | null} | null;
  textColor?: {value?: string | null} | null;
  accentColor?: {value?: string | null} | null;
  productsTitle?: {value?: string | null} | null;
  productsCollection?: {value?: string | null} | null;
  backgroundImage?: {
    reference?: {
      image?: {
        url?: string | null;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
    } | null;
  } | null;
};

export type HomepageConfig = {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  backgroundImageUrl: string | null;
  backgroundImageAlt: string;
  productsTitle: string;
  productsCollectionHandle: string | null;
  secondaryImageUrl: string | null;
};

const DEFAULTS = {
  heading: 'All Mountain All Season',
  subheading:
    'The All New Hydrogen Snowboard Exclusively From Shopify',
  ctaText: 'Shop Now →',
  ctaLink: '/collections/all',
  backgroundColor: '#141414',
  textColor: '#fafaf9',
  accentColor: '#bf4800',
  productsTitle: 'New Arrivals',
};

function mediaImageUrl(
  spread?: CollectionContentFragment['spread'],
): string | null {
  const ref = spread?.reference;
  if (!ref) return null;
  if ('image' in ref && ref.image?.url) return ref.image.url;
  if ('previewImage' in ref && ref.previewImage?.url) return ref.previewImage.url;
  return null;
}

export function parseHomepageConfig(
  shop: HomepageShopMetafields | null | undefined,
  hero?: CollectionContentFragment | null,
): HomepageConfig {
  const heroHeading = hero?.heading?.value;
  const heroByline = hero?.byline?.value;
  const heroCta = hero?.cta?.value;
  const heroHandle = hero?.handle;

  const bgFromMetafield =
    shop?.backgroundImage?.reference?.image?.url ?? null;
  const bgFromHero = mediaImageUrl(hero?.spread);
  const secondaryFromHero = mediaImageUrl(hero?.spreadSecondary);

  return {
    heading:
      shop?.heading?.value?.trim() ||
      heroHeading ||
      shop?.name ||
      DEFAULTS.heading,
    subheading:
      shop?.subheading?.value?.trim() || heroByline || DEFAULTS.subheading,
    ctaText: shop?.ctaText?.value?.trim() || heroCta || DEFAULTS.ctaText,
    ctaLink:
      shop?.ctaLink?.value?.trim() ||
      (heroHandle ? `/collections/${heroHandle}` : DEFAULTS.ctaLink),
    backgroundColor:
      shop?.bgColor?.value?.trim() || DEFAULTS.backgroundColor,
    textColor: shop?.textColor?.value?.trim() || DEFAULTS.textColor,
    accentColor: shop?.accentColor?.value?.trim() || DEFAULTS.accentColor,
    backgroundImageUrl: bgFromMetafield || bgFromHero,
    backgroundImageAlt:
      shop?.backgroundImage?.reference?.image?.altText ||
      hero?.spread?.reference?.alt ||
      'Homepage background',
    productsTitle:
      shop?.productsTitle?.value?.trim() || DEFAULTS.productsTitle,
    productsCollectionHandle:
      shop?.productsCollection?.value?.trim() || null,
    secondaryImageUrl: secondaryFromHero,
  };
}
