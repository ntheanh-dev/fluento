/** Mirrors backend Paragraph.Service split + meaningless filter for client-side validation. */

export const USER_INPUT_MAX_CHARS = 12_000;
export const USER_INPUT_MAX_SENTENCES = 30;

function isMeaninglessSentence(sentence: string): boolean {
  if (sentence == null || sentence.trim() === "") return true;
  const stripped = sentence.replace(/\n/g, "").replace(/\r/g, "").replace(/\\n/g, "");
  return stripped.trim() === "";
}

/** Same idea as backend: line breaks (incl. literal \\n) then split on . ! ? + whitespace. */
export function splitUserInputSentences(rawContent: string): string[] {
  const sentences: string[] = [];
  const lines = rawContent.split(/\\n|\r\n|\r|\n/g);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") continue;
    const parts = trimmedLine.split(/(?<=[.!?])\s+/);
    for (const p of parts) {
      const s = p.trim();
      if (s !== "" && !isMeaninglessSentence(s)) sentences.push(s);
    }
  }
  return sentences;
}
