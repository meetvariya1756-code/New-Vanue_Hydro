// CollectionContentFragment type defined inline (generated type was removed)
type CollectionContentFragment = {
  id?: string;
  handle?: string;
  heading?: {value?: string | null} | null;
  byline?: {value?: string | null} | null;
  cta?: {value?: string | null} | null;
  spread?: {reference?: {image?: {url?: string | null} | null; previewImage?: {url?: string | null} | null; alt?: string | null} | null} | null;
  spreadSecondary?: {reference?: {image?: {url?: string | null} | null; previewImage?: {url?: string | null} | null; alt?: string | null} | null} | null;
};

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
  heading: '10% VITAMIN C SERUM',
  subheading:
    'Infused with Vitamin E & Pro Vitamin B5 for an anti-aging, professional radiant glow. Restore your skin\'s natural brilliance.',
  ctaText: 'Shop Serum',
  ctaLink: '/collections/all',
  backgroundColor: '#FAF7F2',
  textColor: '#1E1E1C',
  accentColor: '#B89E74',
  productsTitle: 'The Signature Line',
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

  // Safely detect if the returned hero data belongs to the default snowboard demo
  const isSnowboardHero =
    heroHeading?.toLowerCase().includes('mountain') ||
    heroHeading?.toLowerCase().includes('snowboard') ||
    heroHeading?.toLowerCase().includes('freestyle') ||
    heroByline?.toLowerCase().includes('snowboard') ||
    heroByline?.toLowerCase().includes('freestyle') ||
    (bgFromHero && (bgFromHero.includes('snowboard') || bgFromHero.includes('freestyle') || bgFromHero.includes('mountain'))) ||
    (secondaryFromHero && (secondaryFromHero.includes('snowboard') || secondaryFromHero.includes('freestyle') || secondaryFromHero.includes('mountain')));

  const finalHeroHeading = isSnowboardHero ? null : heroHeading;
  const finalHeroByline = isSnowboardHero ? null : heroByline;
  const finalHeroCta = isSnowboardHero ? null : heroCta;
  const finalBgFromHero = isSnowboardHero ? null : bgFromHero;
  const finalSecondaryFromHero = isSnowboardHero ? null : secondaryFromHero;

  return {
    heading:
      shop?.heading?.value?.trim() ||
      finalHeroHeading ||
      (shop?.name && shop.name !== 'Hydrogen Demo Store' ? shop.name : null) ||
      DEFAULTS.heading,
    subheading:
      shop?.subheading?.value?.trim() || finalHeroByline || DEFAULTS.subheading,
    ctaText: shop?.ctaText?.value?.trim() || finalHeroCta || DEFAULTS.ctaText,
    ctaLink:
      shop?.ctaLink?.value?.trim() ||
      (heroHandle && !isSnowboardHero ? `/collections/${heroHandle}` : DEFAULTS.ctaLink),
    backgroundColor:
      shop?.bgColor?.value?.trim() || DEFAULTS.backgroundColor,
    textColor: shop?.textColor?.value?.trim() || DEFAULTS.textColor,
    accentColor: shop?.accentColor?.value?.trim() || DEFAULTS.accentColor,
    backgroundImageUrl: bgFromMetafield || finalBgFromHero || '/cream_texture.png',
    backgroundImageAlt:
      shop?.backgroundImage?.reference?.image?.altText ||
      (!isSnowboardHero ? hero?.spread?.reference?.alt : null) ||
      'Luxury cosmetic cream texture background',
    productsTitle:
      shop?.productsTitle?.value?.trim() || DEFAULTS.productsTitle,
    productsCollectionHandle:
      shop?.productsCollection?.value?.trim() || null,
    secondaryImageUrl: finalSecondaryFromHero || '/vanue_serum.png',
  };
}
