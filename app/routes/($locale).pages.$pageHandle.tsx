import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {getSeoMeta} from '@shopify/hydrogen';

import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {AboutPage} from '~/components/AboutPage';
import {ContactPage} from '~/components/ContactPage';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  // For about/contact we render custom components; still try to fetch page data
  // for SEO, but gracefully fall back if not found in Shopify
  try {
    const {page} = await context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.pageHandle,
        language: context.storefront.i18n.language,
      },
    });

    const seo = page
      ? seoPayload.page({page, url: request.url})
      : seoPayload.home({url: request.url});

    return json({
      pageHandle: params.pageHandle,
      page: page ?? null,
      seo,
    });
  } catch (_) {
    return json({
      pageHandle: params.pageHandle,
      page: null,
      seo: seoPayload.home({url: request.url}),
    });
  }
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Page() {
  const {pageHandle, page} = useLoaderData<typeof loader>();
  const handle = pageHandle?.toLowerCase();

  // ── Custom rendered pages ────────────────────────────────────────────────
  if (handle === 'about') {
    return <AboutPage />;
  }

  if (handle === 'contact') {
    return <ContactPage />;
  }

  // ── Default: render Shopify CMS page content ─────────────────────────────
  if (!page) {
    return (
      <section style={{padding: '6rem 2rem', textAlign: 'center'}}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2.5rem',
            color: '#1a1a1a',
          }}
        >
          Page Not Found
        </h1>
      </section>
    );
  }

  return (
    <section
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '5rem 2rem',
      }}
    >
      {/* Page Hero */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid rgba(201,169,110,0.15)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: '#1a1a1a',
          }}
        >
          {page.title}
        </h1>
      </div>
      <div
        dangerouslySetInnerHTML={{__html: page.body}}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.95rem',
          lineHeight: 1.75,
          color: '#4a4540',
        }}
        className="prose"
      />
    </section>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
