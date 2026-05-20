import {useEffect} from 'react';
import clsx from 'clsx';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import type {HomepageConfig} from '~/lib/homepage.server';
import {Link} from '~/components/Link';

type HomeHero3DProps = {
  config: HomepageConfig;
};

export function HomeHero3D({config}: HomeHero3DProps) {
  const {y} = useWindowScroll();
  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 800;
  const scrollProgress = Math.min(1, y / (viewportHeight * 0.85));

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--homepage-bg',
      config.backgroundColor,
    );
    document.documentElement.style.setProperty(
      '--homepage-text',
      config.textColor,
    );
    document.documentElement.style.setProperty(
      '--homepage-accent',
      config.accentColor,
    );
  }, [config.backgroundColor, config.textColor, config.accentColor]);

  const parallaxY = scrollProgress * 120;
  const textLift = scrollProgress * -80;
  const sceneRotate = scrollProgress * 8;
  const sceneScale = 1 - scrollProgress * 0.08;
  const fade = 1 - scrollProgress * 0.65;

  return (
    <section
      className="homepage-hero relative -mt-nav min-h-[var(--screen-height-dynamic)] overflow-hidden"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
    >
      {config.backgroundImageUrl ? (
        <img
          src={config.backgroundImageUrl}
          alt={config.backgroundImageAlt}
          className="homepage-hero__bg absolute inset-0 h-[120%] w-full object-cover"
          style={{
            transform: `translate3d(0, ${parallaxY * 0.5}px, 0) scale(1.1)`,
            opacity: 0.55 * fade + 0.25,
          }}
          loading="eager"
          fetchPriority="high"
        />
      ) : null}

      <div
        className="homepage-hero__gradient absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 100%)',
          opacity: 0.4 + (1 - fade) * 0.4,
        }}
      />

      <div
        className="homepage-hero__scene pointer-events-none absolute inset-0 z-[2]"
        style={{
          perspective: '1200px',
          transform: `rotateX(${sceneRotate}deg) scale(${sceneScale})`,
          transformOrigin: 'center top',
        }}
      >
        <FloatingShape
          className="homepage-shape homepage-shape--1"
          style={{
            transform: `translate3d(-12%, ${20 + parallaxY * 0.3}%, 80px) rotateY(${25 + scrollProgress * 40}deg)`,
          }}
        />
        <FloatingShape
          className="homepage-shape homepage-shape--2"
          style={{
            transform: `translate3d(72%, ${35 + parallaxY * 0.2}%, 120px) rotateY(${-15 - scrollProgress * 30}deg)`,
          }}
        />
        <FloatingShape
          className="homepage-shape homepage-shape--3"
          style={{
            transform: `translate3d(40%, ${65 + parallaxY * 0.15}%, 40px) rotateX(${scrollProgress * 25}deg)`,
          }}
        />
        {config.secondaryImageUrl ? (
          <div
            className="homepage-hero__card absolute right-[8%] top-[18%] hidden w-[min(38vw,320px)] md:block"
            style={{
              transform: `translate3d(0, ${scrollProgress * -60}px, 160px) rotateY(${-12 + scrollProgress * 20}deg) rotateX(${4 - scrollProgress * 10}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={config.secondaryImageUrl}
              alt=""
              className="w-full rounded-lg shadow-2xl ring-1 ring-white/10"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>

      <div
        className="homepage-hero__content relative z-10 flex min-h-[var(--screen-height-dynamic)] flex-col justify-end px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-20"
        style={{
          transform: `translate3d(0, ${textLift}px, 0)`,
          opacity: fade,
          transformStyle: 'preserve-3d',
        }}
      >
        <p
          className="mb-4 text-sm font-medium uppercase tracking-[0.25em] opacity-70"
          style={{color: config.accentColor}}
        >
          New collection
        </p>
        <h1 className="homepage-hero__title max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {config.heading}
        </h1>
        <p className="mt-6 max-w-xl text-lg opacity-85 md:text-xl">
          {config.subheading}
        </p>
        <Link
          to={config.ctaLink}
          prefetch="intent"
          className="homepage-hero__cta mt-10 inline-flex w-fit items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-transform hover:scale-105"
          style={{
            backgroundColor: config.accentColor,
            color: config.backgroundColor,
          }}
        >
          {config.ctaText}
        </Link>
      </div>

      <div className="homepage-scroll-hint absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <span className="text-xs uppercase tracking-[0.3em] opacity-60">
          Scroll
        </span>
        <div className="homepage-scroll-hint__line mx-auto mt-2 h-10 w-px bg-current opacity-40" />
      </div>
    </section>
  );
}

function FloatingShape({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={clsx('homepage-shape absolute rounded-2xl', className)}
      style={{...style, transformStyle: 'preserve-3d'}}
    />
  );
}
