import { FlashcardCard } from "./FlashcardCard";
import type { FlashcardDto } from "@/types";

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
}

export function FlashcardsList({ flashcards, onEdit, onDelete }: FlashcardsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardCard
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
