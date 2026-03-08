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

/** Format tổng thời gian (ms) theo giờ dạng số thập phân, ví dụ: "1.5h", "0.5h", "2h". */
export function formatTotalHours(ms: number): string {
  const totalHours = ms / 3600000;
  const rounded = Math.round(totalHours * 10) / 10;
  return `${rounded}h`;
}