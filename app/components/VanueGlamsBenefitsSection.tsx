import { useState, useEffect } from 'react';
import { CosmeticBottleVisual } from '~/components/CosmeticBottleVisual';

const LEFT_FEATURES = [
  {
    title: 'Removes Dead Skin Cells',
    text: 'Gently exfoliates to reveal smooth and radiant skin.',
  },
  {
    title: 'Deep Cleansing Action',
    text: 'Lifts impurities and excess oil for a refreshed feel.',
  },
  {
    title: 'Acne & Blemish Control',
    text: 'Supports clear skin with effective active ingredients.',
  },
];

const RIGHT_FEATURES = [
  {
    title: 'Skin Barrier Protection',
    text: 'Helps lock moisture and strengthen daily defense.',
  },
  {
    title: 'Hydration Boost',
    text: 'Softens and nourishes skin for lasting hydration.',
  },
  {
    title: 'Bright & Even Tone',
    text: 'Improves texture for a cleaner, more luminous glow.',
  },
];

export function VanueGlamsBenefitsSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const progress = Math.min(1, Math.max(0, (scrollY - 420) / 950));
  const rotate = progress * 120;
  const raise = progress * 24;

  return (
    <section className="vanue-benefits">
      <div className="vanue-benefits__ambient vanue-benefits__ambient--left" />
      <div className="vanue-benefits__ambient vanue-benefits__ambient--right" />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <p className="vanue-benefits__eyebrow">Vanue Glams Body Wash</p>
        <h2 className="vanue-benefits__heading">Luxury Skin, Daily Ritual</h2>
        <p className="vanue-benefits__subheading">
          A premium body care formula designed to cleanse, hydrate, and elevate
          your everyday routine.
        </p>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_360px_1fr]">
          <div className="grid gap-4">
            {LEFT_FEATURES.map((item) => (
              <article key={item.title} className="vanue-benefits__item">
                <span className="vanue-benefits__dot" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="vanue-benefits__center">
            <div
              className="vanue-benefits__ring"
              style={{
                transform: `rotate(${rotate}deg)`,
              }}
            />
            <CosmeticBottleVisual
              className="vanue-benefits__product"
              style={{
                transform: `translate3d(0, ${-raise}px, 0) rotate(${-rotate * 0.08}deg)`,
              }}
            />
          </div>

          <div className="grid gap-4">
            {RIGHT_FEATURES.map((item) => (
              <article key={item.title} className="vanue-benefits__item">
                <span className="vanue-benefits__dot" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
