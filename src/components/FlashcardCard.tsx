import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";
import { cn } from "@/lib/utils";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
}

export function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "ai-full":
        return "bg-blue-100 text-blue-800";
      case "ai-edited":
        return "bg-yellow-100 text-yellow-800";
      case "manual":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 transition-colors bg-white hover:bg-accent/50">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="font-medium">{flashcard.front}</p>
          <p className="text-muted-foreground">{flashcard.back}</p>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(flashcard)}
            aria-label="Edit flashcard"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onDelete(flashcard.id)}
            aria-label="Delete flashcard"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getSourceBadgeClass(flashcard.source)
          )}
        >
          {flashcard.source}
        </span>
      </div>
    </div>
  );
}
