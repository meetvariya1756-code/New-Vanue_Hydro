import {useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import type {MediaFragment} from 'storefrontapi.generated';

export function ProductGallery({
  media,
  className,
}: {
  media: MediaFragment[];
  className?: string;
}) {
  if (!media.length) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Extract all images
  const images = media
    .filter((med) => med.__typename === 'MediaImage')
    .map((med) => ({
      ...med,
      image: {
        ...(med as any).image,
        altText: med.alt || 'Product image',
      },
    }));

  if (!images.length) return null;

  const handleThumbnailClick = (index: number) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 520);
  };

  const handleNext = () => {
    if (isAnimating) return;
    const nextIndex = (currentIndex + 1) % images.length;
    handleThumbnailClick(nextIndex);
    scrollToThumbnail(nextIndex);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    handleThumbnailClick(prevIndex);
    scrollToThumbnail(prevIndex);
  };

  const scrollToThumbnail = (index: number) => {
    if (!thumbnailsRef.current) return;
    const thumbnailObj = thumbnailsRef.current.children[index] as HTMLElement;
    if (thumbnailObj) {
      thumbnailsRef.current.scrollTo({
        top: thumbnailObj.offsetTop - thumbnailsRef.current.offsetTop - 40,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`luxury-product-gallery flex flex-col gap-4 md:flex-row-reverse lg:gap-7 ${className}`}
    >
      <div className="luxury-product-gallery__main group">
        {images.map((med, i) => (
          <div
            key={med.id || i}
            className={`luxury-product-gallery__frame ${
              i === currentIndex
                ? 'luxury-product-gallery__frame--active'
                : ''
            }`}
          >
            <Image
              loading={i === 0 ? 'eager' : 'lazy'}
              data={(med as any).image}
              sizes="(min-width: 48em) 60vw, 90vw"
              className="luxury-product-gallery__image"
            />
          </div>
        ))}

        <div className="luxury-product-gallery__arrows">
          <button
            onClick={handlePrev}
            className="luxury-product-gallery__arrow"
            type="button"
            aria-label="Previous product image"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="luxury-product-gallery__arrow"
            type="button"
            aria-label="Next product image"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="luxury-product-gallery__thumb-rail">
          <button
            onClick={handlePrev}
            className="luxury-product-gallery__thumb-nav"
            type="button"
            aria-label="Previous product image"
          >
            <svg
              className="hidden md:block"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>

          <div
            ref={thumbnailsRef}
            className="luxury-product-gallery__thumbs hiddenScroll"
          >
            {images.map((med, i) => (
              <button
                key={med.id || i}
                onClick={() => handleThumbnailClick(i)}
                className={`luxury-product-gallery__thumb ${
                  i === currentIndex
                    ? 'luxury-product-gallery__thumb--active'
                    : ''
                }`}
                type="button"
                aria-label={`View product image ${i + 1}`}
              >
                <Image
                  data={(med as any).image}
                  sizes="120px"
                  className="luxury-product-gallery__thumb-image"
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="luxury-product-gallery__thumb-nav"
            type="button"
            aria-label="Next product image"
          >
            <svg
              className="hidden md:block"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
