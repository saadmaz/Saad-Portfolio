import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui";
import { ArticleView } from "@/components/article/ArticleView";
import { useBlogPosts, usePreview } from "@/hooks/useBlog";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

/**
 * /preview/:id?token=… - a draft rendered with the real article layout.
 * Data comes from /api/preview, which checks the signed, expiring token;
 * without one nothing is shown. Never indexed (meta + X-Robots-Tag header).
 */
const PreviewPage = () => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { data, error, isLoading } = usePreview(id, token);
  const { data: live = [] } = useBlogPosts();

  return (
    <Layout>
      <Helmet>
        <title>Preview - {data?.post.title ?? "Draft"}</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Helmet>
      <div className="sticky top-[72px] z-40 border-b border-accent/30 bg-accent/[0.12] backdrop-blur lg:top-[88px]">
        <p className="wrap flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm text-fg">
          <Eye aria-hidden className="size-4 text-accent" />
          <span className="font-medium">Preview</span>
          {data && (
            <span className="text-fg-2">
              {STATUS_LABEL[data.post.status ?? (data.post.published ? "published" : "draft")]}
              {data.hasPendingChanges && " · includes unpublished changes"} · not visible to the public
            </span>
          )}
        </p>
      </div>
      {!token ? (
        <p className="wrap py-32 text-center text-fg-2">This preview link is missing its access token.</p>
      ) : isLoading ? (
        <div className="mx-auto flex max-w-prose flex-col gap-6 px-5 py-24">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="aspect-[2/1] w-full rounded-media" />
        </div>
      ) : error || !data ? (
        <p role="alert" className="wrap py-32 text-center text-fg-2">
          {error instanceof Error ? error.message : "Could not load this preview."}
        </p>
      ) : (
        <ArticleView post={data.post} livePosts={live} preview />
      )}
    </Layout>
  );
};

export default PreviewPage;
