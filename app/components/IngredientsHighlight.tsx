'use client';
import {useRef} from 'react';
import {useInView} from 'react-intersection-observer';

const INGREDIENTS = [
  {
    name: 'Vitamin C',
    desc: 'Brightens and evens out skin tone while boosting collagen production.',
    image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/VG_WEB_IMG_1_fa83d471-5f0e-4231-ba0b-ac7d9251e341.jpg?v=1770710714',
  },
  {
    name: 'Hyaluronic Acid',
    desc: 'Deeply hydrates and plumps the skin, reducing the appearance of fine lines.',
    image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/43.jpg?v=1756558491',
  },
  {
    name: 'Niacinamide',
    desc: 'Minimizes pores, regulates oil, and strengthens the skin barrier.',
    image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399',
  },
];

export function IngredientsHighlight() {
  const {ref, inView} = useInView({threshold: 0.1, triggerOnce: true});

  return (
    <section
      ref={ref}
      className="py-20 md:py-32"
      style={{background: '#FAF9F7', overflow: 'hidden'}}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center mb-16">
        <span
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e',
            display: 'block', marginBottom: '1rem',
          }}
        >
          Pure & Potent
        </span>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 400, color: '#1a1a1a', margin: 0,
          }}
        >
          Key Ingredients
        </h2>
        <div
          style={{
            width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
            margin: '1.5rem auto 0',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {INGREDIENTS.map((ing, i) => (
            <IngredientCard key={ing.name} ingredient={ing} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IngredientCard({ingredient, index, inView}: any) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${index * 200}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 200}ms`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '180px', height: '240px', margin: '0 auto 1.5rem',
          borderRadius: '100rem', overflow: 'hidden', position: 'relative',
        }}
      >
        <img
          src={ingredient.image}
          alt={ingredient.name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget.style.transform = 'scale(1.05)'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
        />
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem',
          fontWeight: 400, color: '#1a1a1a', marginBottom: '0.75rem',
        }}
      >
        {ingredient.name}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
          lineHeight: 1.6, color: '#6b6158', maxWidth: '280px', margin: '0 auto',
        }}
      >
        {ingredient.desc}
      </p>
    </div>
  );
}
