import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FlashcardDto, Source } from "@/types";
import { cn } from "@/lib/utils";

interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { front: string; back: string; source: Source }) => Promise<void>;
  flashcard?: FlashcardDto;
  isSaving: boolean;
}

export function EditFlashcardModal({
  isOpen,
  onClose,
  onSave,
  flashcard,
  isSaving,
}: EditFlashcardModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Initialize form when flashcard changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (flashcard) {
        setFront(flashcard.front);
        setBack(flashcard.back);
      } else {
        setFront("");
        setBack("");
      }
    }
  }, [isOpen, flashcard]);

  const isValid =
    front.trim().length > 0 &&
    front.length <= 200 &&
    back.trim().length > 0 &&
    back.length <= 500;

  const handleSave = async () => {
    if (!isValid) return;

    // Determine source based on mode and original source
    let source: Source;
    if (!flashcard) {
      // Create mode: always manual
      source = "manual";
    } else {
      // Edit mode: if was ai-full, change to ai-edited, otherwise keep original
      source = flashcard.source === "ai-full" ? "ai-edited" : flashcard.source as Source;
    }

    await onSave({ front, back, source });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {flashcard ? "Edit Flashcard" : "Create Flashcard"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Front field */}
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter question or prompt"
              className="resize-none"
              maxLength={200}
              rows={3}
            />
            <div
              className={cn(
                "text-sm",
                front.length > 200 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {front.length}/200 characters
            </div>
          </div>

          {/* Back field */}
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter answer or explanation"
              className="resize-none"
              maxLength={500}
              rows={5}
            />
            <div
              className={cn(
                "text-sm",
                back.length > 500 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {back.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
