import {useInView} from 'react-intersection-observer';

interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

const BADGES: TrustBadge[] = [
  {
    icon: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Group_4_1.png?v=1758360766',
    title: 'Free Shipping',
    description: 'Free India Shipping on all orders',
  },
  {
    icon: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Group_5.png?v=1758360766',
    title: '24/7 Friendly Support',
    description: 'Our support team is always ready for you 7 days a week',
  },
  {
    icon: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Group_6.png?v=1758360766',
    title: 'Secure Payment',
    description: 'Pay safely via UPI, Cards and NetBanking — securely encrypted',
  },
];

export function TrustBadges() {
  const {ref, inView} = useInView({threshold: 0.15, triggerOnce: true});

  return (
    <section className="vg-trust-badges" ref={ref} aria-label="Trust indicators">
      {BADGES.map((badge, i) => (
        <div
          key={badge.title}
          className="vg-trust-badge"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
          }}
        >
          <img
            src={badge.icon}
            alt={badge.title}
            className="vg-trust-badge__icon"
            loading="lazy"
          />
          <p className="vg-trust-badge__title">{badge.title}</p>
          <p className="vg-trust-badge__desc">{badge.description}</p>
        </div>
      ))}
    </section>
  );
}
