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

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}