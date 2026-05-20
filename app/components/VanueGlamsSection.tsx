/**
 * VanueGlamsSection
 * A luxury brand story section displayed on the homepage below the hero.
 * Showcases the brand identity with elegant design and product highlight.
 */
export function VanueGlamsSection() {
  return (
    <section className="vanue-glams-section">
      {/* Ambient orbs */}
      <div className="vanue-glams-section__orb vanue-glams-section__orb--1" />
      <div className="vanue-glams-section__orb vanue-glams-section__orb--2" />

      <div className="vanue-glams-section__inner">
        {/* Left — Brand Story */}
        <div className="vanue-glams-section__content">
          <p className="vanue-glams-section__eyebrow">Est. 2024 · Premium Skincare</p>
          <h2 className="vanue-glams-section__heading">
            Beauty Born From&nbsp;
            <em>Nature&rsquo;s Finest</em>
          </h2>
          <p className="vanue-glams-section__body">
            Vanue Glams was created for those who believe in the power of
            botanical luxury. Every formulation is crafted with rare organic
            ingredients — cold-pressed, ethically sourced, and free from
            harmful chemicals.
          </p>
          <p className="vanue-glams-section__body">
            Our mission is simple: deliver salon-grade skincare that feels as
            good as it looks, while honouring the environment that gifts us
            these ingredients.
          </p>

          {/* Decorative stats row */}
          <div className="vanue-glams-section__stats">
            <div className="vanue-glams-section__stat">
              <span className="vanue-glams-section__stat-number">100%</span>
              <span className="vanue-glams-section__stat-label">Natural Ingredients</span>
            </div>
            <div className="vanue-glams-section__stat-divider" />
            <div className="vanue-glams-section__stat">
              <span className="vanue-glams-section__stat-number">0</span>
              <span className="vanue-glams-section__stat-label">Harmful Chemicals</span>
            </div>
            <div className="vanue-glams-section__stat-divider" />
            <div className="vanue-glams-section__stat">
              <span className="vanue-glams-section__stat-number">12+</span>
              <span className="vanue-glams-section__stat-label">Botanical Actives</span>
            </div>
          </div>
        </div>

        {/* Right — Visual card */}
        <div className="vanue-glams-section__visual">
          <div className="vanue-glams-section__card">
            <img
              src="/vanue_serum.png"
              alt="Vanue Glams Serum"
              className="vanue-glams-section__product-img"
              loading="lazy"
              width={220}
              height={300}
            />
            {/* Floating tag */}
            <div className="vanue-glams-section__tag">
              <span className="vanue-glams-section__tag-icon">✦</span>
              <span>Organic Botanical Infusion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
