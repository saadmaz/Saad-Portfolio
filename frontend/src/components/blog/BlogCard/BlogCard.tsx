import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/shared/utils/dateUtils";
import type { Blog } from "@/shared/lib/dataManager";

interface BlogCardProps {
  slug: string;
  metadata: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ slug, metadata }) => {
  return (
    <Link to={`/blog/${slug}`} className="group block h-full">
      <Card className="overflow-hidden border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors h-full flex flex-col">
        {/* Cover image */}
        <div className="relative aspect-video overflow-hidden flex-shrink-0">
          {metadata.coverImage ? (
            <img
              src={metadata.coverImage}
              alt={metadata.title}
              loading="lazy"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                el.parentElement!.classList.add("bg-muted");
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>

        <CardContent className="p-5 flex flex-col flex-grow">
          {/* Meta: date · primary tag */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            <span>{formatDate(metadata.date)}</span>
            {metadata.tags?.[0] && (
              <>
                <span className="opacity-40">·</span>
                <span className="text-accent">{metadata.tags[0]}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-bold leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-2">
            {metadata.title}
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
            {metadata.excerpt}
          </p>

          {/* Footer: tags + read more */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <div className="flex gap-1.5 flex-wrap">
              {(metadata.tags || []).slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] capitalize font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent whitespace-nowrap group-hover:gap-2 transition-all">
              Read More <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
