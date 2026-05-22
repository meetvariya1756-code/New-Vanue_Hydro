import sys

file_path = r"c:\Users\Venner\Desktop\Dawn_nEw\hydrogen-demo\app\routes\($locale).products.$productHandle.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace imports
old_import = "import {ProductGallery} from '~/components/ProductGallery';"
new_import = """import {ProductGallery} from '~/components/premium/ProductGallery';
import {ProductInfo} from '~/components/premium/ProductInfo';
import {ProductAccordion} from '~/components/premium/ProductAccordion';"""
content = content.replace(old_import, new_import)

# Find start and end of the components we want to replace
start_str = "export default function Product() {"
end_str = "const PRODUCT_VARIANT_FRAGMENT = `#graphql"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end strings")
    sys.exit(1)

new_components = """export default function Product() {
  const {product, shop, recommended, variants, storeDomain} =
    useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const detailSections = product.handle.includes('hair-oil')
    ? [
        {title: 'Benefits', content: HAIR_OIL_BENEFITS_HTML},
        {title: 'Care Instructions', content: HAIR_OIL_CARE_HTML},
        {title: 'Description', content: HAIR_OIL_DESCRIPTION_HTML},
      ]
    : [
        ...(descriptionHtml
          ? [{title: 'Product Details', content: descriptionHtml}]
          : []),
        ...(shippingPolicy?.body
          ? [
              {
                title: 'Shipping',
                content: getExcerpt(shippingPolicy.body),
                learnMore: `/policies/${shippingPolicy.handle}`,
              },
            ]
          : []),
        ...(refundPolicy?.body
          ? [
              {
                title: 'Returns',
                content: getExcerpt(refundPolicy.body),
                learnMore: `/policies/${refundPolicy.handle}`,
              },
            ]
          : []),
      ];

  return (
    <div className="bg-[#fdfbf7] min-h-screen text-[#1a1a1a]">
      {/* ── Breadcrumb ── */}
      <div className="px-4 py-3 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-2 font-sans text-[10px] tracking-widest uppercase text-[#9a9086]">
          <Link to="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
          <span>›</span>
          <Link to="/collections/all" className="hover:text-[#1a1a1a] transition-colors">Shop</Link>
          <span>›</span>
          <span className="text-[#1a1a1a] truncate">{title}</span>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <section className="px-4 py-6 md:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Gallery / Left Side */}
            <div className="lg:col-span-7 w-full">
              <ProductGallery media={media.nodes} />
            </div>

            {/* Info / Right Side */}
            <div className="lg:col-span-5 w-full">
              <ProductInfo
                product={product}
                selectedVariant={selectedVariant}
                productOptions={productOptions}
                storeDomain={storeDomain}
                amazonUrl={`https://www.amazon.in/s?k=${encodeURIComponent(title)}`}
              />
              
              {/* Accordions */}
              <div className="mt-8 border-t border-black/10">
                {detailSections.map((section) => (
                  <ProductAccordion
                    key={section.title}
                    title={section.title}
                    content={section.content}
                    learnMore={'learnMore' in section ? section.learnMore : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Ingredients ── */}
      <div className="mt-12 bg-white">
        <DynamicIngredients ingredients={INGREDIENTS_MAP[product.handle] || INGREDIENTS_MAP.default} />
      </div>

      {/* ── You May Also Like ── */}
      <div className="bg-[#fdfbf7] py-12">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <Await
            errorElement="There was a problem loading related products"
            resolve={recommended}
          >
            {(products) => (
              <ProductSwimlane title="You May Also Like" products={products} />
            )}
          </Await>
        </Suspense>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

"""

new_content = content[:start_idx] + new_components + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully replaced content")
