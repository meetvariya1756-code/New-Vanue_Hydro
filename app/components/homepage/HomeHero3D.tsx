import {useEffect, useRef, useState} from 'react';
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

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({x: 0, y: 0, targetX: 0, targetY: 0});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Golden Particle Canvas Engine
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle constructor
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      wobbleSpeed: number;
      wobbleDistance: number;
      angle: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = -(Math.random() * 0.35 + 0.15); // float upward
        this.opacity = Math.random() * 0.35 + 0.15;
        this.wobbleSpeed = Math.random() * 0.015 + 0.005;
        this.wobbleDistance = Math.random() * 1.2 + 0.3;
        this.angle = Math.random() * Math.PI * 2;
        // Luxury champagne and warm gold tones
        const golds = ['rgba(212, 175, 55, ', 'rgba(184, 158, 116, ', 'rgba(240, 230, 215, '];
        this.color = golds[Math.floor(Math.random() * golds.length)];
      }

      update() {
        this.y += this.speedY;
        this.angle += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.angle) * this.wobbleDistance * 0.1;

        // Slow parallax mouse drift
        const dx = mouseRef.current.x * width * 0.08;
        this.x += (dx - this.x * 0.0005) * 0.01;

        // Reset particle if it drifts off the screen or top boundaries
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.y = height + 10;
          this.x = Math.random() * width;
          this.opacity = Math.random() * 0.35 + 0.15;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `${this.color}${this.opacity})`;
        c.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(70, Math.floor((width * height) / 16000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Lerp mouse positions for smooth tracking transitions
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  // CSS Variable synchronization
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

  // Interaction handlers to inject variables into CSS
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;

    e.currentTarget.style.setProperty('--mouse-x', `${x}`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    e.currentTarget.style.setProperty('--mouse-x', '0');
    e.currentTarget.style.setProperty('--mouse-y', '0');
  };

  const parallaxY = scrollProgress * 120;
  const textLift = scrollProgress * -50;
  const fade = 1 - scrollProgress * 0.65;

  return (
    <section
      className="homepage-hero relative -mt-nav min-h-[var(--screen-height-dynamic)] overflow-hidden flex items-center"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Macro Cream Background Texture */}
      {config.backgroundImageUrl ? (
        <img
          src={config.backgroundImageUrl}
          alt={config.backgroundImageAlt}
          className="homepage-hero__bg absolute inset-0 h-[125%] w-full object-cover select-none pointer-events-none"
          style={{
            transform: `translate3d(0, ${parallaxY * 0.3}px, 0) scale(1.05)`,
            opacity: 0.28 * fade + 0.12,
            filter: 'blur(3px)',
          }}
          loading="eager"
          fetchPriority="high"
        />
      ) : null}

      {/* 2. Soft Ambient Overlays */}
      <div
        className="homepage-hero__gradient absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(circle at 65% 45%, rgba(245, 235, 220, 0.4) 0%, transparent 65%), linear-gradient(180deg, transparent 40%, ${config.backgroundColor} 98%)`,
          opacity: 0.8 + (1 - fade) * 0.2,
        }}
      />

      {/* 3. Golden Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full pointer-events-none opacity-85"
      />

      {/* 4. 3D Parallax & Mouse Sway Scene */}
      <div
        className="homepage-hero__scene absolute inset-0 z-[3] hidden md:block select-none pointer-events-none"
        style={{
          perspective: '1400px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Plinth / Circular Podium */}
        <div
          className="absolute"
          style={{
            transform: `translate3d(calc(65vw + var(--mouse-x, 0) * 45px), calc(48vh + var(--mouse-y, 0) * 35px + ${parallaxY * 0.15}px), -40px) rotateX(68deg) rotateZ(calc(var(--mouse-x, 0) * -18deg))`,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Inner glass ring */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-md shadow-[0_0_50px_rgba(184,158,116,0.12)]"
            style={{
              width: '280px',
              height: '280px',
              border: '2px solid rgba(184, 158, 116, 0.35)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(184,158,116,0.02) 100%)',
            }}
          />
          {/* Outer gold ring */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
            style={{
              width: '360px',
              height: '360px',
              borderColor: 'rgba(184, 158, 116, 0.18)',
            }}
          />
        </div>

        {/* Floating Skincare Serum Bottle */}
        <div
          className="absolute"
          style={{
            transform: `translate3d(calc(65vw + var(--mouse-x, 0) * 110px), calc(24vh + var(--mouse-y, 0) * 80px - ${parallaxY * 0.25}px), 90px) rotateY(calc(var(--mouse-x, 0) * 36deg + 12deg)) rotateX(calc(var(--mouse-y, 0) * -25deg - 6deg))`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <img
            src={config.secondaryImageUrl || '/serum_dropper.png'}
            alt="Radiant Skin Elixir Serum Bottle"
            className="w-[250px] lg:w-[290px] filter drop-shadow-[0_28px_45px_rgba(0,0,0,0.12)] animate-[float_6s_ease-in-out_infinite]"
          />
        </div>

        {/* Floating Shapes for Depth */}
        {/* Shape 1 (Back left blurred glow) */}
        <div
          className="absolute rounded-full"
          style={{
            transform: `translate3d(calc(12vw + var(--mouse-x, 0) * -40px), calc(15vh + var(--mouse-y, 0) * -30px + ${parallaxY * 0.2}px), -120px)`,
            width: '240px',
            height: '240px',
            background: 'linear-gradient(135deg, rgba(184, 158, 116, 0.08) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />

        {/* Shape 2 (Mid Left organic card) */}
        <div
          className="absolute rounded-[2.5rem] border border-[rgba(184,158,116,0.14)]"
          style={{
            transform: `translate3d(calc(8vw + var(--mouse-x, 0) * 40px), calc(55vh + var(--mouse-y, 0) * 30px - ${parallaxY * 0.15}px), 40px) rotate(12deg)`,
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(184,158,116,0.01) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        />

        {/* Shape 3 (Front Right tiny gold sphere) */}
        <div
          className="absolute rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_15px_30px_rgba(0,0,0,0.08)]"
          style={{
            transform: `translate3d(calc(82vw + var(--mouse-x, 0) * 160px), calc(68vh + var(--mouse-y, 0) * 120px - ${parallaxY * 0.5}px), 200px)`,
            width: '70px',
            height: '70px',
            background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, rgba(184, 158, 116, 0.25) 50%, rgba(184,158,116,0.85) 100%)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        />
      </div>

      {/* 5. Hero Content (Premium luxury styling) */}
      <div
        className="homepage-hero__content relative z-10 w-full md:w-3/5 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-20 select-text"
        style={{
          transform: `translate3d(0, ${textLift}px, 0)`,
          opacity: fade,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="max-w-2xl">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{color: config.accentColor}}
          >
            Organic Botanical infusion
          </p>

          <h1 className="homepage-hero__title font-serif max-w-4xl text-5xl font-light leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            {config.heading}
          </h1>

          <p className="mt-8 text-base opacity-80 md:text-lg leading-relaxed font-light max-w-lg">
            {config.subheading}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              to={config.ctaLink}
              prefetch="intent"
              className="homepage-hero__cta relative overflow-hidden group inline-flex items-center justify-center rounded-full px-10 py-5 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_10px_30px_rgba(184,158,116,0.22)]"
              style={{
                backgroundColor: config.accentColor,
                color: '#FFFFFF',
              }}
            >
              {/* Gloss shine effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.2s_ease-in-out_infinite]" />
              {config.ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="homepage-scroll-hint absolute bottom-8 left-1/2 z-20 -translate-x-1/2 select-none pointer-events-none flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">
          Scroll Down
        </span>
        <div
          className="homepage-scroll-hint__line mt-3 h-12 w-px opacity-30"
          style={{backgroundColor: config.textColor}}
        />
      </div>
    </section>
  );
}
