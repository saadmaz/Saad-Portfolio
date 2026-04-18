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
