import { useMutation, useQuery } from "@tanstack/react-query";
import { getParagraphHints, getUserPracticeById } from "../api";
import type { UserPractice } from "../../../entities/userPractice/schema";
import { OK } from "../../../shared/api/query-keys";
import { queryClient } from "@/app/providers/query-client";


export function useUserPracticeData(id: number) {
  const { data, isLoading, error } = useQuery<UserPractice>({
    queryKey: OK.userPractice(id),
    queryFn: () => getUserPracticeById(id),
  });

  return { data, isLoading, error };
}

export function useParagraphHints(id: number, orderIndex: number) {
   const mutation = useMutation({
    mutationFn: () => getParagraphHints(id, orderIndex),
    onSuccess: (data) => {
      queryClient.setQueryData(OK.usePracticeParagraphHints(id, orderIndex), data);
    },  
   });

   return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
   };
}