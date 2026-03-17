import { useQuery } from '@tanstack/react-query';
import { ProjectService } from '../../services/project-service';
import { Project } from '../../types';

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAll(),
  });
};

export const useFeaturedProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects', 'featured'],
    queryFn: () => ProjectService.getFeatured(),
  });
};

export const useProject = (slug: string) => {
  return useQuery<Project | null>({
    queryKey: ['projects', slug],
    queryFn: () => ProjectService.getBySlug(slug),
    enabled: !!slug,
  });
};
