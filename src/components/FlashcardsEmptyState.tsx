import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlashcardsEmptyStateProps {
  onCreateClick: () => void;
}

export function FlashcardsEmptyState({ onCreateClick }: FlashcardsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">No flashcards yet</h3>
        <p className="text-muted-foreground">
          Create your first flashcard to get started
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Flashcard
      </Button>
    </div>
  );
}
