import {useParams, Form, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';

import {type LayoutQuery} from 'storefrontapi.generated';
import {Text, Heading, Section} from '~/components/Text';
import {Link} from '~/components/Link';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Input} from '~/components/Input';
import {Drawer, useDrawer} from '~/components/Drawer';
import {CountrySelector} from '~/components/CountrySelector';
import {AnnouncementMarquee} from '~/components/AnnouncementMarquee';
import {
  IconMenu, IconCaret, IconLogin, IconAccount, IconBag, IconSearch,
} from '~/components/Icon';
import {
  type EnhancedMenu, type ChildEnhancedMenuItem, useIsHomePath,
} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {RootLoader} from '~/root';

// ─── Mega menu product categories ───────────────────────────────────────────
const MEGA_MENU_ITEMS = [
  {label: 'Hair Mask',                path: '/products/vanue-glams-keratin-repair-hair-mask-intense-nourishment-damage-repair',             image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/47.jpg?v=1756532965'},
  {label: 'Moisture Cream',           path: '/products/vanue-glams-moisture-cream-deep-hydration-skin-barrier-protection',                  image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/37.jpg?v=1756532728'},
  {label: 'Dandruff Control Shampoo', path: '/products/vanue-glams-dandruff-control-shampoo-clear-scalp-stronger-hair',                     image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/31.jpg?v=1756532420'},
  {label: 'Foaming Cleanser',         path: '/products/vanue-glams-foaming-cleanser-gentle-exfoliation-acne-care',                          image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/13.jpg?v=1756532028'},
  {label: 'Vitamin C Serum',          path: '/products/10-vitamin-c-serum-vanue-glams',                                                     image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/25_afb785c0-011d-43a9-b6e5-4ef98ebcf8cf.jpg?v=1756558399'},
  {label: 'Body Wash',                path: '/products/vanue-glams-body-wash-deep-cleansing-exfoliating-hydrating-formula',                 image: 'https://cdn.shopify.com/s/files/1/0938/5974/1992/files/1_8e974002-6d60-4e59-b4ed-f797f73ed928.jpg?v=1757595405'},
];

// ─── Footer link data ────────────────────────────────────────────────────────
const FOOTER_QUICK_LINKS = [
  {label: 'Home',       path: '/'},
  {label: 'About Us',  path: '/pages/about'},
  {label: 'Contact Us',path: '/pages/contact'},
];
const FOOTER_POLICIES = [
  {label: 'Search',               path: '/search'},
  {label: 'Privacy Policy',       path: '/policies/privacy-policy'},
  {label: 'Terms of Service',     path: '/policies/terms-of-service'},
  {label: 'Return & Refund Policy',path: '/policies/refund-policy'},
  {label: 'Shipping Policy',      path: '/policies/shipping-policy'},
];
const FOOTER_PRODUCTS = [
  {label: 'Vitamin C Serum',          path: '/products/10-vitamin-c-serum-vanue-glams'},
  {label: 'Dandruff Control Shampoo', path: '/products/vanue-glams-dandruff-control-shampoo-clear-scalp-stronger-hair'},
  {label: 'Body Wash',                path: '/products/vanue-glams-body-wash-deep-cleansing-exfoliating-hydrating-formula'},
  {label: 'Foaming Cleanser',         path: '/products/vanue-glams-foaming-cleanser-gentle-exfoliation-acne-care'},
  {label: 'Hair Mask',                path: '/products/vanue-glams-keratin-repair-hair-mask-intense-nourishment-damage-repair'},
  {label: 'Moisture Cream',           path: '/products/vanue-glams-moisture-cream-deep-hydration-skin-barrier-protection'},
];

// ─── Types ───────────────────────────────────────────────────────────────────
type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

// ─── Root Layout ─────────────────────────────────────────────────────────────
export function PageLayout({children, layout}: LayoutProps) {
  const {headerMenu, footerMenu} = layout || {};
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only">Skip to content</a>
        {/* Announcement Bar */}
        <AnnouncementMarquee />
        {/* Header */}
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <VanueFooter />
    </>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const {isOpen: isCartOpen, openDrawer: openCart, closeDrawer: closeCart} = useDrawer();
  const {isOpen: isMenuOpen, openDrawer: openMenu, closeDrawer: closeMenu} = useDrawer();
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />}
      <DesktopHeader isHome={isHome} title={title} menu={menu} openCart={openCart} />
      <MobileHeader isHome={isHome} title={title} openCart={openCart} openMenu={openMenu} />
    </>
  );
}

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({isOpen, onClose, menu}: {isOpen: boolean; onClose: () => void; menu: EnhancedMenu}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({menu, onClose}: {menu: EnhancedMenu; onClose: () => void}) {
  return (
    <nav className="grid gap-2 p-6 sm:gap-4 sm:px-12 sm:py-8 luxury-mobile-menu-drawer min-h-screen">
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) => `${isActive ? 'active' : ''} luxury-mobile-nav-link`}
          >
            {item.title}
          </Link>
        </span>
      ))}
      {/* Static extra links */}
      <div style={{borderTop: '1px solid rgba(201,169,110,0.12)', paddingTop: '1.5rem', marginTop: '0.5rem'}}>
        <p style={{fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '1rem'}}>
          Shop Categories
        </p>
        {MEGA_MENU_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({isActive}) => `${isActive ? 'active' : ''} luxury-mobile-nav-link`}
            style={{fontSize: '12px', opacity: 0.8}}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ─── Mobile Header ───────────────────────────────────────────────────────────
function MobileHeader({title, isHome, openCart, openMenu}: {
  title: string; isHome: boolean; openCart: () => void; openMenu: () => void;
}) {
  const params = useParams();
  return (
    <header
      role="banner"
      className="luxury-header flex lg:hidden items-center h-nav sticky z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8"
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button onClick={openMenu} className="luxury-icon-btn relative flex items-center justify-center w-8 h-8" aria-label="Open menu">
          <IconMenu />
        </button>
        <Form method="get" action={params.locale ? `/${params.locale}/search` : '/search'} className="items-center gap-2 flex relative">
          <Input className="luxury-search-input !py-1" type="search" variant="minisearch" placeholder="Search" name="q" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 luxury-icon-btn focus:outline-none" aria-label="Search">
            <IconSearch className="w-4 h-4" />
          </button>
        </Form>
      </div>

      <Link className="flex items-center self-stretch justify-center flex-grow w-full h-full" to="/">
        <img
          src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Vanu_Glams_Logo_1_200x.png?v=1756536451"
          alt="Vanue Glams"
          className="luxury-logo-mobile w-auto object-contain"
          width={160} height={48}
          onError={(e) => { (e.target as HTMLImageElement).src = '/vanu_glams_logo.webp'; }}
        />
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="luxury-icon-btn relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

// ─── Desktop Header ──────────────────────────────────────────────────────────
function DesktopHeader({isHome, menu, openCart, title}: {
  isHome: boolean; openCart: () => void; menu?: EnhancedMenu; title: string;
}) {
  const params = useParams();
  const {y} = useWindowScroll();

  return (
    <header
      role="banner"
      className={`${y > 50 ? 'luxury-header-scrolled' : ''} luxury-header hidden h-nav lg:flex items-center sticky transition-all duration-300 z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-4`}
    >
      {/* Logo + Nav */}
      <div className="flex gap-10 items-center">
        <Link to="/" prefetch="intent">
          <img
            src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Vanu_Glams_Logo_1_200x.png?v=1756536451"
            alt="Vanue Glams"
            className="luxury-logo-desktop w-auto object-contain transition-transform duration-300 hover:scale-105"
            width={200} height={56}
            onError={(e) => { (e.target as HTMLImageElement).src = '/vanu_glams_logo.webp'; }}
          />
        </Link>

        {/* Navigation */}
        <nav className="flex gap-8 items-center">
          <Link to="/" prefetch="intent" className={({isActive}) => `${isActive ? 'active' : ''} luxury-nav-link`}>Home</Link>
          <Link to="/pages/about" prefetch="intent" className={({isActive}) => `${isActive ? 'active' : ''} luxury-nav-link`}>About</Link>

          {/* Shop Mega Menu */}
          <div className="vg-mega-menu-trigger relative" style={{position: 'relative'}}>
            <Link to="/collections/all" prefetch="intent" className={({isActive}) => `${isActive ? 'active' : ''} luxury-nav-link`}>
              Shop
              <svg style={{display: 'inline', marginLeft: '4px', verticalAlign: 'middle', opacity: 0.6}} width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="vg-mega-menu" aria-hidden="true">
              {MEGA_MENU_ITEMS.map((item) => (
                <Link key={item.path} to={item.path} prefetch="intent" className="vg-mega-menu-item">
                  <div style={{overflow: 'hidden', height: '120px'}}>
                    <img src={item.image} alt={item.label} loading="lazy" />
                  </div>
                  <span className="vg-mega-menu-item__label">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link to="/pages/contact" prefetch="intent" className={({isActive}) => `${isActive ? 'active' : ''} luxury-nav-link`}>Contact</Link>
        </nav>
      </div>

      {/* Right: Search, Account, Cart */}
      <div className="flex items-center gap-4">
        <Form method="get" action={params.locale ? `/${params.locale}/search` : '/search'} className="flex items-center relative">
          <Input className="luxury-search-input" type="search" variant="minisearch" placeholder="Search..." name="q" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 luxury-icon-btn focus:outline-none" aria-label="Search">
            <IconSearch className="w-4 h-4" />
          </button>
        </Form>
        <AccountLink className="luxury-icon-btn relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

// ─── Account & Cart ───────────────────────────────────────────────────────────
function AccountLink({className}: {className?: string}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;
  return (
    <Link to="/account" className={className} aria-label="Account">
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconLogin />)}
        </Await>
      </Suspense>
    </Link>
  );
}

function CartCount({isHome, openCart}: {isHome: boolean; openCart: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => <Badge dark={isHome} openCart={openCart} count={cart?.totalQuantity || 0} />}
      </Await>
    </Suspense>
  );
}

function Badge({openCart, dark, count}: {count: number; dark: boolean; openCart: () => void}) {
  const isHydrated = useIsHydrated();
  const BadgeCounter = (
    <div className="luxury-badge flex items-center justify-center w-8 h-8">
      <IconBag className="w-4 h-4" />
      {count > 0 && (
        <div className="luxury-badge-count">
          <span>{count}</span>
        </div>
      )}
    </div>
  );
  return isHydrated ? (
    <button onClick={openCart} className="relative flex items-center justify-center focus:outline-none" aria-label={`Cart (${count} items)`}>
      {BadgeCounter}
    </button>
  ) : (
    <Link to="/cart" className="relative flex items-center justify-center focus:outline-none" aria-label="Cart">
      {BadgeCounter}
    </Link>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function VanueFooter() {
  const [email, setEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  return (
    <footer className="vg-footer" aria-label="Site footer">
      {/* Main footer grid */}
      <div className="vg-footer__top">
        {/* Brand column */}
        <div>
          <Link to="/">
            <img
              src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Vanu_Glams_Logo_1_200x.png?v=1756536451"
              alt="Vanue Glams"
              style={{height: '52px', width: 'auto', objectFit: 'contain', marginBottom: '0.5rem'}}
              onError={(e) => { (e.target as HTMLImageElement).src = '/vanu_glams_logo.webp'; }}
            />
          </Link>
          <p className="vg-footer__brand-desc">
            Crafting premium cosmetic products that are safe, effective, and designed to enhance your natural beauty.
          </p>
          {/* Social */}
          <div className="vg-footer__social">
            <a href="https://www.instagram.com/vanueglams/" target="_blank" rel="noopener noreferrer" className="vg-footer__social-btn" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/Vanueglams" target="_blank" rel="noopener noreferrer" className="vg-footer__social-btn" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@VANUEGLAMS" target="_blank" rel="noopener noreferrer" className="vg-footer__social-btn" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.47 12.4 12.4 0 00-8.82.28A4.92 4.92 0 013.36 7.5 36.65 36.65 0 002 12a36.65 36.65 0 001.36 4.5 4.92 4.92 0 013.64 3 12.4 12.4 0 008.82.28 4.83 4.83 0 013.77-2.47A36.65 36.65 0 0022 12a36.65 36.65 0 00-2.41-5.31zM10 15V9l5 3-5 3z"/>
              </svg>
            </a>
          </div>

          {/* Newsletter */}
          <div style={{marginTop: '1.5rem'}}>
            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9086', marginBottom: '0.75rem'}}>
              Newsletter
            </p>
            {newsletterDone ? (
              <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#c9a96e'}}>Thank you for subscribing! ✦</p>
            ) : (
              <form onSubmit={(e) => {e.preventDefault(); if(email) setNewsletterDone(true);}} style={{display: 'flex'}}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="vg-footer__newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email for newsletter"
                />
                <button type="submit" className="vg-footer__newsletter-btn">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="vg-footer__col-title">Quick Links</h3>
          {FOOTER_QUICK_LINKS.map((l) => (
            <Link key={l.path} to={l.path} prefetch="intent" className="vg-footer__link">{l.label}</Link>
          ))}
        </div>

        {/* Policies */}
        <div>
          <h3 className="vg-footer__col-title">Policies</h3>
          {FOOTER_POLICIES.map((l) => (
            <Link key={l.path} to={l.path} prefetch="intent" className="vg-footer__link">{l.label}</Link>
          ))}
        </div>

        {/* Products */}
        <div>
          <h3 className="vg-footer__col-title">Products</h3>
          {FOOTER_PRODUCTS.map((l) => (
            <Link key={l.path} to={l.path} prefetch="intent" className="vg-footer__link">{l.label}</Link>
          ))}
          {/* Trust badge */}
          <div style={{marginTop: '1.5rem'}}>
            <img
              src="https://cdn.shopify.com/s/files/1/0938/5974/1992/files/Untitled_design_b661e470-1edb-4fcc-ae56-b413e13d31af.png?v=1757676661"
              alt="Trust badges"
              style={{maxWidth: '160px', height: 'auto', objectFit: 'contain', opacity: 0.9}}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="vg-footer__bottom">
        <div className="vg-footer__bottom-inner">
          <span>© {new Date().getFullYear()} All Rights Reserved. | Powered by Vanue Glams.</span>
          <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center'}}>
            <Link to="/policies/privacy-policy" className="vg-footer__policy-link">Privacy Policy</Link>
            <Link to="/policies/terms-of-service" className="vg-footer__policy-link">Terms of Service</Link>
            <Link to="/policies/refund-policy" className="vg-footer__policy-link">Refund Policy</Link>
            <Link to="/policies/shipping-policy" className="vg-footer__policy-link">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
