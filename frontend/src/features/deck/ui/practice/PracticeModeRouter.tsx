import { useParams } from "react-router-dom";
import FlashcardPracticePage from "@/features/deck/ui/practice/flashcard/FlashcardPracticePage";
import MatchMeaningPracticePage from "@/features/deck/ui/practice/match-meaning/MatchMeaningPracticePage";
import TypeWordPracticePage from "@/features/deck/ui/practice/type-word/TypeWordPracticePage";

export default function PracticeModeRouter() {
  const { mode } = useParams();

  if (mode === "flashcard") return <FlashcardPracticePage />;
  if (mode === "match-meaning") return <MatchMeaningPracticePage />;
  if (mode === "type-word") return <TypeWordPracticePage />;

  return <FlashcardPracticePage />;
}
