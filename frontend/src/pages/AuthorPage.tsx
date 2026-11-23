import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, Eyebrow, PageHero, Skeleton } from "@/components/ui";
import { ArticleCard } from "@/components/article/ArticleParts";
import { authorLinks } from "@/lib/authors";
import { useAuthors, useBlogPosts, useBlogSettings } from "@/hooks/useBlog";
import { articleTypeLabel, personSchema } from "@/lib/article-core";
import { BASE_URL } from "@/lib/seo-content";
import NotFound from "./NotFound";

/** /authors/:slug - profile, links (rel="me") and every listed article by this author. */
const AuthorPage = () => {
  const { slug = "" } = useParams();
  const { data: authors = [], isLoading } = useAuthors();
  const { data: posts = [] } = useBlogPosts();
  const { settings } = useBlogSettings();
  const author = authors.find((a) => a.slug === slug);

  if (isLoading)
    return (
      <Layout>
        <div className="wrap py-24">
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  if (!author) return <NotFound />;

  const isDefault = author.isDefault || author.id === settings.defaultAuthorId;
  const articles = posts.filter((p) => p.authorId === author.id || (!p.authorId && isDefault));
  const url = `${BASE_URL}/authors/${author.slug}`;
  const links = authorLinks(author);

  return (
    <Layout>
      <SEO
        title={`${author.name}${author.title ? `, ${author.title}` : ""}`}
        description={author.bio || `Articles by ${author.name}.`}
        url={url}
        type="profile"
        {...(author.avatar
          ? { image: author.avatar, imageWidth: 400, imageHeight: 400, imageAlt: author.name }
          : {})}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url,
          mainEntity: personSchema(author, BASE_URL),
        }}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: author.name, url },
        ]}
      />
      <PageHero className="mb-8" band="Saad Mazhar · Authors">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          {author.avatar && (
            <img
              src={author.avatar}
              alt=""
              className="size-28 rounded-full border border-line-2 object-cover md:size-36"
            />
          )}
          <div className="flex max-w-[680px] flex-col gap-4">
            <Eyebrow>Author</Eyebrow>
            <h1 className="text-display-m font-medium">{author.name}</h1>
            {author.title && <p className="text-body-l text-fg-2">{author.title}</p>}
            {author.bio && <p className="text-fg-2">{author.bio}</p>}
            {links.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-fg-2 underline-offset-4 hover:text-fg hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PageHero>
      <section className="section">
        <div className="wrap">
          <Eyebrow>{`${articles.length} ${articles.length === 1 ? "article" : "articles"}`}</Eyebrow>
          {articles.length === 0 ? (
            <div className="mt-10">
              <Empty>No published articles yet.</Empty>
            </div>
          ) : (
            <div className="mt-10 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((p) => (
                <ArticleCard
                  key={p.id}
                  post={p}
                  wpm={settings.readingWpm}
                  typeLabel={articleTypeLabel(p.articleType, settings.articleTypes)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AuthorPage;
