'use client';
import {useRef, useEffect} from 'react';
import {useInView} from 'react-intersection-observer';

const VIDEOS = [
  'https://cdn.shopify.com/videos/c/o/v/2f4a37b3053342b685f261c01244f2de.mp4',
  'https://cdn.shopify.com/videos/c/o/v/07436a0665534870b0675261107734c4.mp4',
  'https://cdn.shopify.com/videos/c/o/v/c5ff4ef81c3448b3acd1c6b277dacc90.mp4',
  'https://cdn.shopify.com/videos/c/o/v/c1bac5ea9666418fb63929fbbcb16716.mp4',
  'https://cdn.shopify.com/videos/c/o/v/56d29c3fcdd24acbbd981db800a77bee.mp4',
  'https://cdn.shopify.com/videos/c/o/v/576b0796b2134cf5be16f267317b498e.mp4',
  'https://cdn.shopify.com/videos/c/o/v/f0e41cb60d634a4db5416c4cf2d16d90.mp4',
  'https://cdn.shopify.com/videos/c/o/v/40f5ae40bbd446739dc7140511f20544.mp4',
  'https://cdn.shopify.com/videos/c/o/v/fed7a4a9a0b9488486774eef8dddee59.mp4',
  'https://cdn.shopify.com/videos/c/o/v/aee0d6a60825416a9aacc8bf1d74b292.mp4',
];

function VideoItem({src, index}: {src: string; index: number}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {ref: wrapRef, inView} = useInView({threshold: 0.3, triggerOnce: false});

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView]);

  return (
    <div
      ref={wrapRef}
      className="vg-video-item"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1)' : 'scale(0.92)',
        transition: `opacity 0.6s ease ${index * 60}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms`,
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`Vanue Glams product video ${index + 1}`}
      />
      <div className="vg-video-item__overlay" aria-hidden="true" />
    </div>
  );
}

export function VideoGrid() {
  const {ref, inView} = useInView({threshold: 0.05, triggerOnce: true});

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
      style={{background: '#FAF9F7'}}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div
          ref={ref}
          className="text-center mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="vg-section-eyebrow">Real Results</span>
          <h2 className="vg-section-heading">Enhance Your Natural Glow</h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)'}}
          />
        </div>

        {/* Grid */}
        <div className="vg-video-grid">
          {VIDEOS.map((src, i) => (
            <VideoItem key={src} src={src} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
