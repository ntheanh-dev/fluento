import { OK } from "../../shared/api/query-keys";
import { useQuery } from "@tanstack/react-query";
import type { UserPractice } from "@/entities/userPractice/schema";
import { getUserPracticeById } from "./api";

export function useUserPracticeData(id: number) {
  return useQuery<UserPractice>({
    queryKey: OK.userPractice(id),
    queryFn: () => getUserPracticeById(id),
  });
}
