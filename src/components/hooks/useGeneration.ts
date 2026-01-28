import { useState } from "react";
import { toast } from "sonner";
import type { GenerationDetailDto } from "@/types";

export function useGeneration() {
  const [generation, setGeneration] = useState<GenerationDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGeneration = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/generations/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Generation not found");
        }
        throw new Error("Failed to load generation");
      }

      const data: GenerationDetailDto = await response.json();
      setGeneration(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", { description: "Failed to load generation details" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generation,
    isLoading,
    error,
    loadGeneration,
  };
}
