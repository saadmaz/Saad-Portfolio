import { useQuery } from '@tanstack/react-query';
import { BlogService } from '../../services/blog-service';
import { BlogPost } from '../../types';

export const useBlogPosts = () => {
  return useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: () => BlogService.getAll(),
  });
};

export const useLatestBlogPost = () => {
  return useQuery<BlogPost | null>({
    queryKey: ['blog-posts', 'latest'],
    queryFn: () => BlogService.getLatest(),
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery<BlogPost | null>({
    queryKey: ['blog-posts', slug],
    queryFn: () => BlogService.getBySlug(slug),
    enabled: !!slug,
  });
};
