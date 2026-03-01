import { useMutation, useQuery } from "@tanstack/react-query";
import { getParagraphHints, getUserPracticeById } from "../api";
import type { UserPractice } from "../../../entities/userPractice/schema";
import { OK } from "../../../shared/api/query-keys";


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
   });

   return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
   };
}