import { useQuery } from "@tanstack/react-query";
import { getParagraphHints, getUserPracticeById } from "../api";
import type { UserPractice } from "../../../entities/userPractice/schema";
import { OK } from "../../../shared/api/query-keys";
import type { HintContent } from "@/entities/hints/schema";


export function useUserPracticeData(id: number) {
  const { data, isLoading, error } = useQuery<UserPractice>({
    queryKey: OK.userPractice(id),
    queryFn: () => getUserPracticeById(id),
  });

  return { data, isLoading, error };
}

export function useParagraphHints(id: number, orderIndex: number, enable: boolean) {
    const { data, isLoading, error } = useQuery<HintContent>({
        queryKey: OK.usePracticeParagraphHints(id, orderIndex),
        queryFn: () => getParagraphHints(id, orderIndex),
        enabled: enable,
    });

    return { data, isLoading, error };
}