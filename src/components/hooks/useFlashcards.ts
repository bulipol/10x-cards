import { useState } from "react";
import { toast } from "sonner";
import type { FlashcardDto, FlashcardsListResponseDto, PaginationDto, Source } from "@/types";

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadFlashcards = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/flashcards?page=${page}&limit=10&sort=created_at&order=desc`
      );

      if (!response.ok) {
        throw new Error("Failed to load flashcards");
      }

      const data: FlashcardsListResponseDto = await response.json();
      setFlashcards(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", { description: "Failed to load flashcards" });
    } finally {
      setIsLoading(false);
    }
  };

  const createFlashcard = async (data: { front: string; back: string; source: Source }) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: [
            {
              front: data.front,
              back: data.back,
              source: data.source,
              generation_id: null,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      toast.success("Success!", { description: "Flashcard created" });
      await loadFlashcards(currentPage);
    } catch (err) {
      toast.error("Error", { description: "Failed to create flashcard" });
      throw err;
    }
  };

  const updateFlashcard = async (
    id: number,
    data: { front: string; back: string; source: Source }
  ) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      toast.success("Success!", { description: "Flashcard updated" });
      await loadFlashcards(currentPage);
    } catch (err) {
      toast.error("Error", { description: "Failed to update flashcard" });
      throw err;
    }
  };

  const deleteFlashcard = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      toast.success("Success!", { description: "Flashcard deleted" });

      // Handle page adjustment if we deleted last item on page
      const isLastItemOnPage = flashcards.length === 1 && currentPage > 1;
      const newPage = isLastItemOnPage ? currentPage - 1 : currentPage;
      await loadFlashcards(newPage);
    } catch (err) {
      toast.error("Error", { description: "Failed to delete flashcard" });
      throw err;
    }
  };

  return {
    flashcards,
    isLoading,
    error,
    pagination,
    currentPage,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  };
}
