import { useState } from "react";
import { toast } from "sonner";
import type { FlashcardDto, FlashcardsListResponseDto } from "@/types";

interface UseStudySessionResult {
  flashcards: FlashcardDto[];
  currentIndex: number;
  currentCard: FlashcardDto | null;
  showBack: boolean;
  isLoading: boolean;
  error: string | null;
  completed: number;
  total: number;
  isSessionCompleted: boolean;
  loadFlashcards: () => Promise<void>;
  flipCard: () => void;
  nextCard: () => void;
  restartSession: () => void;
}

export function useStudySession(): UseStudySessionResult {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Shuffles array using Fisher-Yates algorithm
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /**
   * Load flashcards from API and shuffle them
   */
  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all flashcards (no pagination for study session)
      const response = await fetch("/api/flashcards?limit=100");

      if (!response.ok) {
        throw new Error("Failed to load flashcards");
      }

      const data: FlashcardsListResponseDto = await response.json();
      const shuffled = shuffleArray(data.data);

      setFlashcards(shuffled);
      setCurrentIndex(0);
      setShowBack(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", { description: "Failed to load flashcards" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Flip the current card to show the answer
   */
  const flipCard = () => {
    setShowBack(true);
  };

  /**
   * Move to the next card
   */
  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowBack(false);
    }
  };

  /**
   * Restart the session with new shuffle
   */
  const restartSession = () => {
    const shuffled = shuffleArray(flashcards);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowBack(false);
  };

  // Computed values
  const currentCard = flashcards[currentIndex] || null;
  const completed = Math.min(currentIndex + 1, flashcards.length);
  const total = flashcards.length;
  const isSessionCompleted = flashcards.length > 0 && currentIndex >= flashcards.length - 1 && showBack;

  return {
    flashcards,
    currentIndex,
    currentCard,
    showBack,
    isLoading,
    error,
    completed,
    total,
    isSessionCompleted,
    loadFlashcards,
    flipCard,
    nextCard,
    restartSession,
  };
}
