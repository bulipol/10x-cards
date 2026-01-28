import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";

interface StudyCardProps {
  flashcard: FlashcardDto;
  showBack: boolean;
  onFlip: () => void;
}

export function StudyCard({ flashcard, showBack, onFlip }: StudyCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Card */}
      <div className="border-2 rounded-xl p-8 bg-white shadow-lg min-h-[320px] flex items-center justify-center">
        <div className="w-full space-y-6">
          {/* Front (always visible) */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Question</p>
            <p className="text-2xl font-semibold">{flashcard.front}</p>
          </div>

          {/* Divider (only when showing back) */}
          {showBack && (
            <div className="border-t-2 border-dashed border-muted pt-6" />
          )}

          {/* Back (conditionally visible) */}
          {showBack && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Answer</p>
              <p className="text-xl text-muted-foreground">{flashcard.back}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={onFlip}
          disabled={showBack}
          size="lg"
          className="px-8"
        >
          {showBack ? "Answer Shown" : "Show Answer"}
        </Button>
      </div>
    </div>
  );
}
