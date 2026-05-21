import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {getSeoMeta} from '@shopify/hydrogen';

import {PageHeader, Section} from '~/components/Text';
import {Button} from '~/components/Button';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.policyHandle, 'Missing policy handle');

  const policyName = params.policyHandle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as 'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy';

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');
  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.policy({policy, url: request.url});

  return json({policy, seo});
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Policies() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <>
      {/* Page Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FAF9F7 0%, #F5EFE6 50%, #EDE6DA 100%)',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.1), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{position: 'relative', zIndex: 1}}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#c9a96e', display: 'block', marginBottom: '0.5rem',
            }}
          >
            Vanue Glams
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            {policy.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section
        style={{
          maxWidth: '800px', margin: '0 auto',
          padding: '4rem 1.5rem',
        }}
      >
        {/* Back link */}
        <Button
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px',
            fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#c9a96e', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            marginBottom: '2rem', background: 'none', border: 'none',
            padding: 0, cursor: 'pointer',
          }}
          variant="inline"
          to={'/policies'}
        >
          ← Back to Policies
        </Button>

        <div
          dangerouslySetInnerHTML={{__html: policy.body}}
          className="prose"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem', lineHeight: 1.8, color: '#4a4540',
          }}
        />
      </section>
    </>
  );
}


const POLICY_CONTENT_QUERY = `#graphql
  fragment PolicyHandle on ShopPolicy {
    body
    handle
    id
    title
    url
  }

  query PoliciesHandle(
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $refundPolicy: Boolean!
  ) @inContext(language: $language) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...PolicyHandle
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...PolicyHandle
      }
      termsOfService @include(if: $termsOfService) {
        ...PolicyHandle
      }
      refundPolicy @include(if: $refundPolicy) {
        ...PolicyHandle
      }
    }
  }
`;
