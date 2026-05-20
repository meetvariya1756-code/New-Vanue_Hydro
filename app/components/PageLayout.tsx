import { useParams, Form, Await, useRouteLoaderData } from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import { Disclosure } from '@headlessui/react';
import { Suspense, useEffect, useMemo } from 'react';
import { CartForm } from '@shopify/hydrogen';

import { type LayoutQuery } from 'storefrontapi.generated';
import { Text, Heading, Section } from '~/components/Text';
import { Link } from '~/components/Link';
import { Cart } from '~/components/Cart';
import { CartLoading } from '~/components/CartLoading';
import { Input } from '~/components/Input';
import { Drawer, useDrawer } from '~/components/Drawer';
import { CountrySelector } from '~/components/CountrySelector';
import {
  IconMenu,
  IconCaret,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
} from '~/components/Icon';
import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';
import type { RootLoader } from '~/root';

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

export function PageLayout({ children, layout }: LayoutProps) {
  const { headerMenu, footerMenu } = layout || {};
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
    </>
  );
}

function getCosmeticMenuTitle(title: string): string {
  const t = title.trim().toLowerCase();
  if (t === 'collections') return 'Serum Collections';
  if (t === 'products') return 'Shop Skincare';
  if (t === 'journal') return 'Beauty Journal';
  return title;
}

function Header({ title, menu }: { title: string; menu?: EnhancedMenu }) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-2 p-6 sm:gap-4 sm:px-12 sm:py-8 luxury-mobile-menu-drawer min-h-screen">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({ isActive }) =>
              `${isActive ? 'active' : ''} luxury-mobile-nav-link`
            }
          >
            {getCosmeticMenuTitle(item.title)}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  const params = useParams();

  return (
    <header
      role="banner"
      className="luxury-header flex lg:hidden items-center h-nav sticky z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8"
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="luxury-icon-btn relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="items-center gap-2 flex relative"
        >
          <Input
            className="luxury-search-input !py-1"
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 luxury-icon-btn focus:outline-none"
          >
            <IconSearch className="w-4 h-4" />
          </button>
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch justify-center flex-grow w-full h-full"
        to="/"
      >
        <img
          src="/vanu_glams_logo.webp"
          alt="Vanue Glams"
          className="luxury-logo-mobile w-auto object-contain transition-transform duration-300 hover:scale-105"
          width={160}
          height={48}
        />
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="luxury-icon-btn relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  const params = useParams();
  const { y } = useWindowScroll();
  return (
    <header
      role="banner"
      className={`${y > 50 ? 'luxury-header-scrolled' : ''
        } luxury-header hidden h-nav lg:flex items-center sticky transition-all duration-300 z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <div className="flex gap-12 items-center">
        <Link className="flex items-center" to="/" prefetch="intent">
          <img
            src="/vanu_glams_logo.webp"
            alt="Vanue Glams"
            className="luxury-logo-desktop w-auto object-contain transition-transform duration-300 hover:scale-105"
            width={200}
            height={56}
          />
        </Link>
        <nav className="flex gap-8 items-center">
          {/* Top level menu items */}
          {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({ isActive }) =>
                `${isActive ? 'active' : ''} luxury-nav-link`
              }
            >
              {getCosmeticMenuTitle(item.title)}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="flex items-center relative"
        >
          <Input
            className="luxury-search-input"
            type="search"
            variant="minisearch"
            placeholder="Search..."
            name="q"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 luxury-icon-btn focus:outline-none"
          >
            <IconSearch className="w-4 h-4" />
          </button>
        </Form>
        <AccountLink className="luxury-icon-btn relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconLogin />)}
        </Await>
      </Suspense>
    </Link>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <div className="luxury-badge flex items-center justify-center w-8 h-8">
        <IconBag className="w-4 h-4" />
        {count > 0 && (
          <div className="luxury-badge-count">
            <span>{count}</span>
          </div>
        )}
      </div>
    ),
    [count],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center focus:outline-none"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center focus:outline-none"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({ menu }: { menu?: EnhancedMenu }) {
  return (
    <footer className="w-full bg-[#FAF7F2] text-[#1E1E1C] border-t border-[#B89E74]/20 font-sans mt-12">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left Column: Logo, Tagline, and Contact */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Link to="/" className="inline-block max-w-[180px]">
            <img
              src="/vanu_glams_logo.webp"
              alt="Vanue Glams Logo"
              className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
              width={180}
              height={50}
            />
          </Link>
          <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed max-w-sm">
            Crafting pure organic botanical formulations to deliver salon-grade results naturally. Beautifully balanced skincare made with sustainable, ethically sourced botanical actives.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 items-center mt-2 text-[#B89E74]">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C7654] transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C7654] transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C7654] transition-colors" aria-label="Pinterest">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>

        {/* Center Columns: Dynamically Rendered Shopify Navigation Menus */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <FooterMenu menu={menu} />
        </div>

        {/* Right Column: Newsletter Signup Form */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div>
            <h3 className="font-serif text-[#1E1E1C] font-semibold text-xs sm:text-sm tracking-[0.18em] uppercase mb-4">
              The Vanue Circle
            </h3>
            <p className="text-xs text-[#5C554E] font-light leading-relaxed mb-4">
              Subscribe to receive curated organic beauty rituals, seasonal product launches, and exclusive member privileges.
            </p>
            <Form method="post" action="/contact" className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                aria-label="Email address for newsletter"
                className="bg-white/70 border border-[#B89E74]/20 rounded-full px-5 py-3 text-xs tracking-wide text-[#1E1E1C] placeholder-[#1E1E1C]/45 focus:outline-none focus:border-[#B89E74] focus:ring-1 focus:ring-[#B89E74] transition-all"
              />
              <button
                type="submit"
                className="bg-[#B89E74] hover:bg-[#a68d63] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-full transition-colors active:scale-98"
              >
                Join
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Compliance and Selectors */}
      <div className="border-t border-[#B89E74]/15 bg-[#F5EFE6]/40">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-[#8C847C] font-light text-center md:text-left">
            &copy; {new Date().getFullYear()} Vanue Glams. All rights reserved. Crafted for botanical luxury.
          </div>
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <Link to="/policies/privacy-policy" className="text-xs text-[#8C847C] hover:text-[#B89E74] transition-colors font-light">
              Privacy Policy
            </Link>
            <Link to="/policies/terms-of-service" className="text-xs text-[#8C847C] hover:text-[#B89E74] transition-colors font-light">
              Terms of Service
            </Link>
            <CountrySelector />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ item }: { item: ChildEnhancedMenuItem }) {
  const linkClass = "text-xs md:text-sm text-[#5C554E] hover:text-[#B89E74] transition-colors duration-300 font-light tracking-wide py-1 block";
  
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer" className={linkClass}>
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent" className={linkClass}>
      {item.title}
    </Link>
  );
}

function FooterMenu({ menu }: { menu?: EnhancedMenu }) {
  const styles = {
    section: 'grid gap-2',
    nav: 'grid gap-1.5 pb-4',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default w-full focus:outline-none">
                  <h3 className="font-serif text-[#1E1E1C] font-semibold text-xs sm:text-sm tracking-[0.18em] uppercase flex justify-between items-center mb-4">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden text-[#B89E74]">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </h3>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem: ChildEnhancedMenuItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
