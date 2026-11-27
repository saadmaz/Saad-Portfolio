import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Empty,
  Eyebrow,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
  Tag,
} from "@/components/ui";
import { BlogCard } from "@/components/article/BlogCard";
import { authorLinks } from "@/lib/authors";
import { authorFaq, authorTopics } from "@/lib/authorFaq";
import { useAuthors, useBlogPosts, useBlogSettings } from "@/hooks/useBlog";
import { useCertificates, useEducation, useEvents, useExperience } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { articleTypeLabel, personSchema, slugify } from "@/lib/article-core";
import { normalizeExperience } from "@/lib/experience";
import { certificatePath, eventPath } from "@/lib/paths";
import { monthYear } from "@/lib/format";
import { projectStatusOf, projectGroupOf } from "@/lib/projectGroups";
import { BASE_URL, PERSON_ID, fitDescription } from "@/lib/seo-content";
import type { Certificate, Event } from "@/types";
import NotFound from "./NotFound";
import { resizedUrl } from "@/lib/images";

/** Newest first; dates are stored as text such as "Aug 24, 2023" or "2026-02-01". */
const time = (s?: string | null) => Date.parse(String(s ?? "")) || 0;
const byDateDesc = (a?: string | null, b?: string | null) => time(b) - time(a);

/** One credentials column: a label and up to four linked lines. */
function Credentials({
  label,
  items,
  more,
}: {
  label: string;
  items: { key: string; title: string; meta?: string; to?: string; href?: string }[];
  more?: { to: string; label: string };
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-5 border-t border-line-2 pt-6">
      <span className="label text-fg-3">{label}</span>
      <ul className="flex flex-col gap-4">
        {items.map((i) => {
          const body = (
            <>
              <span className="font-medium text-fg transition-colors group-hover:text-accent">{i.title}</span>
              {i.meta && <span className="text-sm text-fg-3">{i.meta}</span>}
            </>
          );
          return (
            <li key={i.key}>
              {i.to ? (
                <Link to={i.to} className="group flex flex-col gap-0.5">
                  {body}
                </Link>
              ) : i.href ? (
                <a
                  href={i.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-0.5"
                >
                  {body}
                </a>
              ) : (
                <div className="flex flex-col gap-0.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      {more && (
        <Link to={more.to} className="tap inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
          {more.label} <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}

/** /authors/:slug - profile, proof, topics, every listed article and credentials. */
const AuthorPage = () => {
  const { slug = "" } = useParams();
  const { data: authors = [], isLoading } = useAuthors();
  const { data: posts = [] } = useBlogPosts();
  const { settings } = useBlogSettings();
  const { data: projects = [] } = useProjects();
  const { data: events = [] } = useEvents();
  const { data: certificates = [] } = useCertificates();
  const { data: experience = [] } = useExperience();
  const { data: education = [] } = useEducation();
  const author = authors.find((a) => a.slug === slug);

  const isDefault = !!author && (author.isDefault || author.id === settings.defaultAuthorId);
  const articles = useMemo(
    () => (author ? posts.filter((p) => p.authorId === author.id || (!p.authorId && isDefault)) : []),
    [author, posts, isDefault],
  );
  const topics = useMemo(() => authorTopics(articles, 10), [articles]);
  const categories = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of articles) if (p.category) count.set(p.category, (count.get(p.category) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [articles]);
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of articles) for (const t of p.tags ?? []) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 14);
  }, [articles]);

  // Proof and credentials describe the site owner, so only the default author gets them.
  const companies = useMemo(
    () => (isDefault ? normalizeExperience(experience) : []),
    [isDefault, experience],
  );
  const current = companies.filter((c) => c.roles.some((r) => r.isCurrent));
  const talks = isDefault ? [...events].sort((a: Event, b: Event) => byDateDesc(a.date, b.date)) : [];
  const certs = isDefault
    ? [...certificates].sort(
        (a: Certificate, b: Certificate) =>
          Number(!!b.is_featured) - Number(!!a.is_featured) || byDateDesc(a.issue_date, b.issue_date),
      )
    : [];
  const live = projects.filter((p) => projectStatusOf(p) === "live").length;
  const ventures = new Set(
    projects.filter((p) => projectGroupOf(p) === "venture").map((p) => p.client || p.title),
  ).size;

  if (isLoading)
    return (
      <Layout>
        <div className="wrap py-24">
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  if (!author) return <NotFound />;

  const url = `${BASE_URL}/authors/${author.slug}`;
  const links = authorLinks(author);
  const expertise = author.expertise?.filter(Boolean) ?? [];
  const faq = authorFaq(author, articles, { expertise });
  const stats = [
    { value: articles.length, label: "Articles", to: "#articles" },
    ...(isDefault
      ? [
          { value: projects.length, label: "Projects", to: "/projects" },
          { value: live, label: "Live products", to: "/projects?status=live" },
          { value: ventures, label: "Ventures", to: "/projects#venture" },
          { value: events.length, label: "Talks & events", to: "/events" },
          { value: certificates.length, label: "Certifications", to: "/certifications" },
        ]
      : []),
  ].filter((s) => s.value > 0);

  const person = {
    ...personSchema(author, BASE_URL),
    ...(isDefault ? { "@id": PERSON_ID } : {}),
    ...(expertise.length || topics.length ? { knowsAbout: expertise.length ? expertise : topics } : {}),
    ...(current.length
      ? {
          worksFor: current.map((c) => ({
            "@type": "Organization",
            name: c.name,
            ...(c.url ? { url: c.url } : {}),
          })),
        }
      : {}),
    ...(isDefault && education.length
      ? {
          alumniOf: education.map((e) => ({
            "@type": "EducationalOrganization",
            name: e.school_name,
            ...(e.school_website_url ? { url: e.school_website_url } : {}),
          })),
        }
      : {}),
  };

  return (
    <Layout>
      <SEO
        title={`${author.name}${author.title ? `, ${author.title}` : ""}`}
        description={fitDescription(author.bio || `Articles by ${author.name}.`)}
        url={url}
        type="profile"
        {...(author.avatar
          ? { image: author.avatar, imageWidth: 400, imageHeight: 400, imageAlt: author.name }
          : {})}
        structuredData={[
          { "@context": "https://schema.org", "@type": "ProfilePage", url, mainEntity: person },
          ...(faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faq.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: author.name, url },
        ]}
      />

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Author</span>}>
        <div className="grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-[720px]">
            <div className="flex items-center gap-5 animate-rise">
              {author.avatar && (
                <img
                  src={resizedUrl(author.avatar, 480)}
                  alt=""
                  className="size-16 rounded-full border border-line-2 object-cover lg:hidden"
                />
              )}
              <Eyebrow>Author</Eyebrow>
            </div>
            <h1 className="mt-8 text-display-xl font-medium md:mt-10">
              <RisingWords text={author.name} />
            </h1>
            {author.title && (
              <p className="mt-6 animate-rise text-body-l text-fg [animation-delay:300ms]">{author.title}</p>
            )}
            {author.bio && (
              <p className="mt-4 max-w-[620px] animate-rise text-fg-2 [animation-delay:350ms]">
                {author.bio}
              </p>
            )}
            <div className="mt-8 flex animate-rise flex-wrap items-center gap-3 [animation-delay:400ms]">
              <Button to="/newsletters" icon={false}>
                <Mail aria-hidden className="size-4" /> Follow the writing
              </Button>
              <Button to="/contact" variant="secondary">
                Contact
              </Button>
              {links.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-2 pl-1 text-sm">
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
            {stats.length > 0 && (
              <dl className="mt-12 grid max-w-[720px] animate-rise grid-cols-3 gap-6 [animation-delay:450ms] sm:grid-cols-6">
                {stats.map((s) => (
                  <div key={s.label} className="border-l border-line-2 pl-4">
                    <Link
                      to={s.to.startsWith("#") ? { hash: s.to } : s.to}
                      className="group flex flex-col-reverse gap-2"
                    >
                      <dt className="label text-fg-3 transition-colors group-hover:text-fg">{s.label}</dt>
                      <dd className="text-display-m font-medium leading-none">
                        <CountUp value={s.value} />
                      </dd>
                    </Link>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {author.avatar && (
            <img
              src={resizedUrl(author.avatar, 480)}
              alt={author.name}
              className="hidden size-64 animate-rise rounded-full border border-line-2 object-cover [animation-delay:500ms] lg:block xl:size-72"
            />
          )}
        </div>
      </PageHero>

      {(categories.length > 0 || tags.length > 0 || expertise.length > 0) && (
        <section className="section screen border-t-0" aria-labelledby="topics">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="topics" label="Expertise" title="Writes" soft="about" />
            </Reveal>
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {expertise.map((e) => (
                  <Tag key={e} active>
                    {e}
                  </Tag>
                ))}
                {categories.map(([c, n]) => (
                  <Link key={c} to={`/blog/category/${slugify(c)}`}>
                    <Tag>
                      {c} · {n}
                    </Tag>
                  </Link>
                ))}
                {tags.map(([t, n]) => (
                  <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>
                    <Tag>
                      {t.replace(/-/g, " ")} · {n}
                    </Tag>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section id="articles" className="section screen scroll-mt-32" aria-labelledby="articles-title">
        <div className="wrap">
          <Reveal>
            <SectionHeader
              id="articles-title"
              label={`${articles.length} ${articles.length === 1 ? "article" : "articles"}`}
              title="Latest"
              soft="writing"
            />
          </Reveal>
          {articles.length === 0 ? (
            <Empty>No published articles yet.</Empty>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((p) => (
                <BlogCard
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

      {isDefault && (current.length > 0 || education.length > 0 || certs.length > 0 || talks.length > 0) && (
        <section className="section screen" aria-labelledby="credentials">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="credentials" label="Credentials" title="Why trust" soft="this author" />
            </Reveal>
            <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Credentials
                label="Currently"
                items={current.slice(0, 4).map((c) => ({
                  key: c.key,
                  title: c.name,
                  meta: c.roles.find((r) => r.isCurrent)?.title,
                  to: `/experience/${c.slug}`,
                }))}
                more={{ to: "/experience", label: "Full experience" }}
              />
              <Credentials
                label="Education"
                items={education.slice(0, 3).map((e) => ({
                  key: e.id,
                  title: e.school_name,
                  meta: [e.degree, e.field_of_study].filter(Boolean).join(", "),
                }))}
                more={{ to: "/education", label: "Education" }}
              />
              <Credentials
                label="Certifications"
                items={certs.slice(0, 4).map((c) => ({
                  key: String(c.id),
                  title: c.title,
                  meta: [c.issuer, monthYear(c.issue_date)].filter(Boolean).join(" · "),
                  to: certificatePath(c),
                }))}
                more={{ to: "/certifications", label: `All ${certificates.length}` }}
              />
              <Credentials
                label="Recent talks & events"
                items={talks.slice(0, 4).map((e) => ({
                  key: String(e.id),
                  title: e.title,
                  meta: [e.role, monthYear(e.date)].filter(Boolean).join(" · "),
                  to: eventPath(e),
                }))}
                more={{ to: "/events", label: "All events" }}
              />
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section aria-labelledby="author-faq" className="wrap border-t border-line-2 py-16 lg:py-24">
          <Eyebrow>About the author</Eyebrow>
          <h2 id="author-faq" className="mt-6 text-h2 font-medium">
            Quick <span className="soft">answers</span>
          </h2>
          <div className="mt-10 max-w-[820px] border-b border-line-2">
            {faq.map(({ question, answer }, i) => (
              <details key={question} open={i === 0} className="group border-t border-line-2 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-l font-medium [&::-webkit-details-marker]:hidden">
                  {question}
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[680px] text-fg-2">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default AuthorPage;
