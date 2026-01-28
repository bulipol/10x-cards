import { useEffect } from "react";
import { ArrowLeft, Clock, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorNotification } from "./ErrorNotification";
import { SkeletonLoader } from "./SkeletonLoader";
import { useGeneration } from "./hooks/useGeneration";
import type { FlashcardDto } from "@/types";
import { cn } from "@/lib/utils";

interface GenerationDetailViewProps {
  generationId: number;
}

export function GenerationDetailView({ generationId }: GenerationDetailViewProps) {
  const { generation, isLoading, error, loadGeneration } = useGeneration();

  useEffect(() => {
    loadGeneration(generationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (milliseconds: number | null) => {
    if (!milliseconds) return "N/A";
    return `${(milliseconds / 1000).toFixed(2)}s`;
  };

  const formatModelName = (model: string) => {
    if (model.includes("claude")) {
      const parts = model.split("-");
      if (parts[1] && parts[2]) {
        const version = `${parts[1]}.${parts[2]}`;
        const name = parts[3]?.charAt(0).toUpperCase() + parts[3]?.slice(1);
        return `Claude ${version} ${name}`;
      }
    }
    return model;
  };

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
    <div className="space-y-6">
      {/* Error notification */}
      {error && <ErrorNotification message={error} />}

      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <a href="/generations" aria-label="Back to generations">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Generation Details</h1>
            {generation && (
              <p className="text-muted-foreground mt-1">
                Created {formatDate(generation.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <SkeletonLoader />}

      {/* Not found state */}
      {!isLoading && error && error.includes("not found") && (
        <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
          <div className="space-y-2">
            <p className="text-xl font-semibold">Generation not found</p>
            <p className="text-sm text-muted-foreground">
              The generation you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button asChild>
            <a href="/generations">Back to Generations</a>
          </Button>
        </div>
      )}

      {/* Generation details */}
      {!isLoading && generation && (
        <>
          {/* Generation metadata card */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Header: Date and Model */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(generation.created_at)}</span>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {formatModelName(generation.model)}
                </Badge>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Generated Count */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generated</span>
                  </div>
                  <p className="text-2xl font-bold">{generation.generated_count}</p>
                </div>

                {/* Accepted Unedited */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Accepted (original)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {generation.accepted_unedited_count ?? 0}
                  </p>
                </div>

                {/* Accepted Edited */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Accepted (edited)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {generation.accepted_edited_count ?? 0}
                  </p>
                </div>

                {/* Total Accepted */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total accepted</p>
                  <p className="text-2xl font-bold">
                    {(generation.accepted_unedited_count ?? 0) +
                      (generation.accepted_edited_count ?? 0)}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Source: {generation.source_text_length.toLocaleString()} chars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Duration: {formatDuration(generation.generation_duration)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Flashcards section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Flashcards ({generation.flashcards?.length || 0})
              </h2>
            </div>

            {/* Empty state for flashcards */}
            {(!generation.flashcards || generation.flashcards.length === 0) && (
              <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-xl font-semibold">No flashcards</p>
                  <p className="text-sm text-muted-foreground">
                    This generation doesn't have any flashcards yet.
                  </p>
                </div>
              </div>
            )}

            {/* Flashcards list */}
            {generation.flashcards && generation.flashcards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generation.flashcards.map((flashcard: FlashcardDto) => (
                  <div
                    key={flashcard.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="space-y-2">
                      <p className="font-medium">{flashcard.front}</p>
                      <p className="text-muted-foreground">{flashcard.back}</p>
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
