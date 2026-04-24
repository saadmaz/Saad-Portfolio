import { useQuery, useMutation } from '@tanstack/react-query';
import { CommonService } from '@/shared/services/common-service';
import { queryKeys } from '@/shared/lib/queryKeys';

export const useHackathons = () =>
  useQuery({
    queryKey: queryKeys.hackathons.all,
    queryFn:  () => CommonService.getHackathons(),
  });

export const useEducation = () =>
  useQuery({
    queryKey: ['education'],
    queryFn:  () => CommonService.getEducation(),
  });

export const useVolunteer = () =>
  useQuery({
    queryKey: ['volunteer'],
    queryFn:  () => CommonService.getVolunteerExperience(),
  });

export const useEvents = () =>
  useQuery({
    queryKey: ['events'],
    queryFn:  () => CommonService.getEvents(),
  });

export const useExperience = () =>
  useQuery({
    queryKey: queryKeys.experience.all,
    queryFn:  () => CommonService.getWorkExperience(),
  });

export const useSkills = () =>
  useQuery({
    queryKey: queryKeys.skills.all,
    queryFn:  () => CommonService.getSkills(),
  });

export const useCertificates = () =>
  useQuery({
    queryKey: queryKeys.certificates.all,
    queryFn:  () => CommonService.getCertificates(),
  });

export const useContactMutation = () =>
  useMutation({
    mutationFn: (data: { name: string; email: string; subject?: string; message: string }) =>
      CommonService.submitContact(data),
  });

export const useCourses = () =>
  useQuery({
    queryKey: ['courses'],
    queryFn:  () => CommonService.getCourses(),
  });

export const usePublications = () =>
  useQuery({
    queryKey: ['publications'],
    queryFn:  () => CommonService.getPublications(),
  });

export const usePatents = () =>
  useQuery({
    queryKey: ['patents'],
    queryFn:  () => CommonService.getPatents(),
  });

export const useTestScores = () =>
  useQuery({
    queryKey: ['testScores'],
    queryFn:  () => CommonService.getTestScores(),
  });

export const useOrganizations = () =>
  useQuery({
    queryKey: ['organizations'],
    queryFn:  () => CommonService.getOrganizations(),
  });

export const useCauses = () =>
  useQuery({
    queryKey: ['causes'],
    queryFn:  () => CommonService.getCauses(),
  });

export const useNewsletters = () =>
  useQuery({
    queryKey: ['newsletters'],
    queryFn:  () => CommonService.getNewsletters(),
  });
