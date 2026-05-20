import useWindowScroll from 'react-use/esm/useWindowScroll';
import type {HomepageConfig} from '~/lib/homepage.server';
import {Link} from '~/components/Link';

type ParallaxBandProps = {
  config: HomepageConfig;
  imageUrl?: string | null;
  handle?: string;
  reverse?: boolean;
};

export function ParallaxBand({
  config,
  imageUrl,
  handle = 'all',
  reverse = false,
}: ParallaxBandProps) {
  const {y} = useWindowScroll();
  const offset = (y % 1200) * 0.15;

  if (!imageUrl) return null;

  return (
    <section
      className="homepage-parallax relative flex min-h-[50vh] items-center overflow-hidden md:min-h-[60vh]"
      style={{backgroundColor: config.backgroundColor}}
    >
      <img
        src={imageUrl}
        alt=""
        className={`absolute inset-0 h-[130%] w-full object-cover ${
          reverse ? 'object-left' : 'object-right'
        }`}
        style={{
          transform: `translate3d(0, ${offset}px, 0) scale(1.05)`,
          opacity: 0.7,
        }}
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${
            reverse ? '90deg' : '270deg'
          }, ${config.backgroundColor} 0%, transparent 55%)`,
        }}
      />
      <div className="relative z-10 max-w-lg px-8 py-16 md:px-16">
        <Link
          to={`/collections/${handle}`}
          prefetch="intent"
          className="inline-flex items-center gap-2 text-lg font-semibold"
          style={{color: config.textColor}}
        >
          Explore collection →
        </Link>
      </div>
    </section>
  );
}
