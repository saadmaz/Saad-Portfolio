/**
 * SEO.tsx
 * ─────────────────────────────────────────────────────────────
 * Reusable head manager. Drop <SEO ... /> anywhere inside <Layout>
 * to override the default meta tags for that page.
 *
 * Usage:
 *   <SEO
 *     title="Projects - Saad Mazhar"
 *     description="Browse all projects built by Saad Mazhar..."
 *     image="https://saadmaz.com/og-projects.png"
 *   />
 */

import { Helmet } from "react-helmet-async";
import { SITE_NAME, BASE_URL } from "@/lib/seo-content.js";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  /** Absolute URL to OG image (1200×630 recommended for summary_large_image) */
  image?: string;
  /** Actual pixel dimensions of `image` - must match reality or the OG/Twitter card renders cropped. */
  imageWidth?: number;
  imageHeight?: number;
  /** Canonical URL for this page */
  url?: string;
  /** JSON-LD structured data object - passed as-is to <script type="application/ld+json"> */
  structuredData?: object;
  /** "website" | "article" - defaults to "website" */
  type?: string;
  /** Breadcrumb trail - renders a BreadcrumbList JSON-LD block for rich results */
  breadcrumbs?: BreadcrumbItem[];
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
}

// Every prerendered route gets a 1200×630 card at /og/<path>.png, drawn at
// build time by scripts/og/render.mjs (home is /og/home.png). Pages only pass
// `image` to override it, with that image's real dimensions.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ogCardFor = (url: string) => {
  const path = url.replace(BASE_URL, "").replace(/^\/|\/$/g, "");
  return `${BASE_URL}/og/${path || "home"}.png`;
};

const DEFAULT_DESCRIPTION =
  "Saad Mazhar - Startup Founder, Tech Speaker & Full-Stack Developer based in Colombo, Sri Lanka. Building products at the intersection of technology and impact.";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  imageWidth = OG_WIDTH,
  imageHeight = OG_HEIGHT,
  url = BASE_URL,
  structuredData,
  type = "website",
  breadcrumbs,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Founder · Speaker · Developer`;
  const ogImage = image ?? ogCardFor(url);
  const isLargeImage = imageWidth / imageHeight >= 1.9 && imageWidth >= 1200;

  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          ...breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: crumb.name,
            item: crumb.url,
          })),
        ],
      }
    : null;

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={url} />}

      {/* ── Open Graph ───────────────────────────────────────────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />

      {/* ── Twitter / X Card ─────────────────────────────────────── */}
      <meta name="twitter:card" content={isLargeImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:site" content="@SaadMazhar_" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ───────────────────────────────── */}
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    </Helmet>
  );
}
