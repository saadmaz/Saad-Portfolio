import { useQuery, useMutation } from '@tanstack/react-query';
import { CommonService } from '../services/common-service';

export const useExperience = () => {
  return useQuery({
    queryKey: ['experience'],
    queryFn: () => CommonService.getWorkExperience(),
  });
};

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => CommonService.getSkills(),
  });
};

export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => CommonService.getCertificates(),
  });
};

export const useContactMutation = () => {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject?: string; message: string }) => 
      CommonService.submitContact(data),
  });
};
