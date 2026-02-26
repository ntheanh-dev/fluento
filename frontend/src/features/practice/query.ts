import { OK } from "../../shared/api/query-keys";
import { useQuery } from "@tanstack/react-query";
import type { PracticeSetupOutput } from "./schema";
import { getUserPracticeById } from "./api";

export function useUserPracticeData(id: number) {
  return useQuery<PracticeSetupOutput>({
    queryKey: OK.userPractice(id),
    queryFn: () => getUserPracticeById(id),
  });
}
