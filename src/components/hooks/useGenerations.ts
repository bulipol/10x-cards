import { useState } from "react";
import { toast } from "sonner";
import type { GenerationDto, GenerationsListResponseDto, PaginationDto } from "@/types";

export function useGenerations() {
  const [generations, setGenerations] = useState<GenerationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadGenerations = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/generations?page=${page}&limit=10`);

      if (!response.ok) {
        throw new Error("Failed to load generations");
      }

      const data: GenerationsListResponseDto = await response.json();
      setGenerations(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", { description: "Failed to load generations" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generations,
    isLoading,
    error,
    pagination,
    currentPage,
    loadGenerations,
  };
}
