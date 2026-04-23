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

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  /** Absolute URL to OG image (1200×630 recommended) */
  image?: string;
  /** Canonical URL for this page */
  url?: string;
  /** JSON-LD structured data object - passed as-is to <script type="application/ld+json"> */
  structuredData?: object;
  /** "website" | "article" - defaults to "website" */
  type?: string;
  /** Page-specific keywords for <meta name="keywords"> */
  keywords?: string;
  /** Breadcrumb trail — renders a BreadcrumbList JSON-LD block for rich results */
  breadcrumbs?: BreadcrumbItem[];
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
}

const SITE_NAME  = "Saad Mazhar";
const BASE_URL   = "https://saadmaz.com";
const DEFAULT_OG = `${BASE_URL}/logo.png`;

const DEFAULT_DESCRIPTION =
  "Saad Mazhar - Startup Founder, Tech Speaker & Full-Stack Developer based in Colombo, Sri Lanka. Building products at the intersection of technology and impact.";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG,
  url = BASE_URL,
  structuredData,
  type = "website",
  keywords,
  breadcrumbs,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Founder · Speaker · Developer`;

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
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <link rel="canonical" href={url} />
      }
      {keywords && <meta name="keywords" content={keywords} />}

      {/* ── Open Graph ───────────────────────────────────────────── */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={url} />
      <meta property="og:image"       content={image} />
      <meta property="og:image:alt"   content={`${SITE_NAME} preview`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* ── Twitter / X Card ─────────────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@SaadMazhar_" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* ── JSON-LD Structured Data ───────────────────────────────── */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}  
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
