import { useQuery } from "@tanstack/react-query";
import { getParagraphs } from "./api";
import type { ParagraphListParams } from "./schema";

export function useParagraphs(params: ParagraphListParams) {
  return useQuery({
    queryKey: ["paragraphs", params],
    queryFn: () => getParagraphs(params),
  });
}
