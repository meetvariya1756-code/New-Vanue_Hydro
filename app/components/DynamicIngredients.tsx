'use client';
import { useInView } from 'react-intersection-observer';

export type Ingredient = {
  name: string;
  desc: string;
  image: string;
};

export function DynamicIngredients({ ingredients }: { ingredients: Ingredient[] }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  if (!ingredients || ingredients.length === 0) return null;

  return (
    <section
      ref={ref}
      className="py-16 md:py-24"
      style={{ background: '#fff', overflow: 'hidden' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center mb-16">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#c9a96e',
            display: 'block',
            marginBottom: '1rem',
          }}
        >
          Formulated For You
        </span>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 400,
            color: '#1a1a1a',
            margin: 0,
          }}
        >
          Key Active Ingredients
        </h2>
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
            margin: '1.5rem auto 0',
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex flex-col gap-12 md:gap-20">
          {ingredients.map((ing, i) => {
            const isEven = i % 2 === 0;
            return (
              <IngredientRow
                key={ing.name}
                ingredient={ing}
                index={i}
                inView={inView}
                isEven={isEven}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IngredientRow({
  ingredient,
  index,
  inView,
  isEven,
}: {
  ingredient: Ingredient;
  index: number;
  inView: boolean;
  isEven: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      } items-center gap-8 md:gap-16`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${index * 200}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 200}ms`,
      }}
    >
      {/* Image Side */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div
          style={{
            width: '280px',
            height: '360px',
            borderRadius: '100rem',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            border: '8px solid #FAF9F7',
          }}
        >
          <img
            src={ingredient.image}
            alt={ingredient.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.8s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </div>
      </div>

      {/* Text Side */}
      <div className={`w-full md:w-1/2 text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 400,
            color: '#1a1a1a',
            marginBottom: '1rem',
          }}
        >
          {ingredient.name}
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#6b6158',
            maxWidth: '400px',
            margin: isEven ? '0 auto 0 0' : '0 0 0 auto',
          }}
        >
          {ingredient.desc}
        </p>
      </div>
    </div>
  );
}
