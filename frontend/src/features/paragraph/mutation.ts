import { useMutation } from "@tanstack/react-query";
import { createUserPractice } from "./api";
import type { UserPractice } from "@/entities/userPractice/schema";
import { OK } from "@/shared/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import type { TargetLanguage } from "@/shared/constants/target-language";

export function useCreateUserPracticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paragraphId, targetLanguage }: { paragraphId: number; targetLanguage: TargetLanguage }) =>
      createUserPractice(paragraphId, targetLanguage),
    onSuccess: (data: UserPractice) => {
      qc.setQueryData(OK.userPractice(data.id), data);
    },
  });
}