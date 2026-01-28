import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationsList } from "./GenerationsList";
import { Pagination } from "./Pagination";
import { ErrorNotification } from "./ErrorNotification";
import { SkeletonLoader } from "./SkeletonLoader";
import { useGenerations } from "./hooks/useGenerations";

export function GenerationsView() {
  const { generations, isLoading, error, pagination, currentPage, loadGenerations } =
    useGenerations();

  useEffect(() => {
    loadGenerations(1);
  }, []);

  const handlePageChange = (page: number) => {
    loadGenerations(page);
  };

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {error && <ErrorNotification message={error} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Generations History</h1>
          {pagination && (
            <p className="text-muted-foreground mt-1">{pagination.total} generations total</p>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <SkeletonLoader />}

      {/* Empty state */}
      {!isLoading && generations.length === 0 && (
        <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold">No generations yet</p>
            <p className="text-sm text-muted-foreground">
              Generate your first set of flashcards to see them here.
            </p>
          </div>
          <Button asChild>
            <a href="/generate">Generate Flashcards</a>
          </Button>
        </div>
      )}

      {/* Generations list */}
      {!isLoading && generations.length > 0 && (
        <>
          <GenerationsList generations={generations} />

          {pagination && pagination.total > pagination.limit && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
