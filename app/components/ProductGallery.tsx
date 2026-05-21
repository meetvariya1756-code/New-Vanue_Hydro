import { useState, useRef, useEffect } from 'react';
import { Image } from '@shopify/hydrogen';
import type { MediaFragment } from 'storefrontapi.generated';

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
    setTimeout(() => setIsAnimating(false), 400); // match transition duration
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
    <div className={`flex flex-col md:flex-row-reverse gap-4 lg:gap-8 ${className}`}>
      {/* Main Image Container */}
      <div className="relative flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,169,110,0.1)] aspect-square md:aspect-[4/5] lg:aspect-square group">
        {images.map((med, i) => (
          <div
            key={med.id || i}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              loading={i === 0 ? 'eager' : 'lazy'}
              data={(med as any).image}
              sizes="(min-width: 48em) 60vw, 90vw"
              className="object-cover w-full h-full"
              style={{
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            />
          </div>
        ))}

        {/* Mobile Arrows (Visible only on mobile) */}
        <div className="md:hidden absolute inset-0 flex items-center justify-between p-4 z-20 pointer-events-none">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-[#1a1a1a] pointer-events-auto transition-transform active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-[#1a1a1a] pointer-events-auto transition-transform active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Right Thumbnails Sidebar (Desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-3 w-24 lg:w-28 flex-shrink-0 relative">
          <button
            onClick={handlePrev}
            className="w-full h-8 flex items-center justify-center text-[#c9a96e] hover:bg-white/50 rounded-t-xl transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          
          <div 
            ref={thumbnailsRef}
            className="flex-1 overflow-y-auto hiddenScroll flex flex-col gap-3 pb-8 pt-2 px-1 relative"
            style={{ maxHeight: 'calc(100% - 64px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((med, i) => (
              <button
                key={med.id || i}
                onClick={() => handleThumbnailClick(i)}
                className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                  i === currentIndex 
                    ? 'border-[#c9a96e] shadow-md transform scale-105' 
                    : 'border-transparent hover:border-[rgba(201,169,110,0.5)] opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  data={(med as any).image}
                  sizes="120px"
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="absolute bottom-0 left-0 w-full h-8 flex items-center justify-center text-[#c9a96e] bg-gradient-to-t from-[#FAF9F7] to-transparent rounded-b-xl hover:text-[#1a1a1a] transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
