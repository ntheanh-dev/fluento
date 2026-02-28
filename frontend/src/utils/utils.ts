export function splitIntoSentences(text: string): string[] {
    if (!text) return [];

    const normalized = text.replace(/\r\n/g, "\n");
  
    const sentenceRegex =
      /.*?(?:[.!?](?:\n+|\s+)|,(?:\n+)|$)/gs;
  
    const matches = normalized.match(sentenceRegex);
  
    return matches
      ?.map(s => s.replace(/^[ ]+|[ ]+$/g, ""))
      .filter(Boolean) ?? [];
  }