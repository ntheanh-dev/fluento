import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserPractice } from "./api";
import type { PracticeSetupInput, PracticeSetupOutput } from "./schema";
import { OK } from "../../shared/api/query-keys";

export function useCreateUserPracticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PracticeSetupInput) => createUserPractice(payload),
    onSuccess: (data: PracticeSetupOutput) => {
      qc.setQueryData(OK.userPractice(data.id), data);
    },
  });
}