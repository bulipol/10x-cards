import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { StudyCard } from "./StudyCard";
import { StudySessionProgress } from "./StudySessionProgress";
import { ErrorNotification } from "./ErrorNotification";
import { SkeletonLoader } from "./SkeletonLoader";
import { useStudySession } from "./hooks/useStudySession";

export function StudySessionView() {
  const {
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
  } = useStudySession();

  useEffect(() => {
    loadFlashcards();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Study Session</h1>
        <SkeletonLoader />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Study Session</h1>
        <ErrorNotification message={error} />
        <div className="mt-6 text-center">
          <Button onClick={loadFlashcards}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty state (no flashcards)
  if (total === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Study Session</h1>
        <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
          <p className="text-xl text-muted-foreground">No flashcards available for study.</p>
          <p className="text-sm text-muted-foreground">
            Create some flashcards first to start your study session.
          </p>
          <Button asChild>
            <a href="/flashcards">Go to My Flashcards</a>
          </Button>
        </div>
      </div>
    );
  }

  // Session completed state
  if (isSessionCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Study Session</h1>
        <div className="border-2 rounded-xl p-12 text-center space-y-6 bg-accent/50">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold">Session Completed!</h2>
          <p className="text-lg text-muted-foreground">
            You've reviewed <span className="font-semibold">{total}</span> flashcard{total > 1 ? "s" : ""}.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={restartSession} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/flashcards">Go to My Flashcards</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active session state
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Study Session</h1>

      {/* Progress */}
      <div className="mb-8">
        <StudySessionProgress current={completed} total={total} />
      </div>

      {/* Study Card */}
      {currentCard && (
        <div className="mb-8">
          <StudyCard flashcard={currentCard} showBack={showBack} onFlip={flipCard} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Button onClick={nextCard} disabled={!showBack || completed >= total} size="lg" className="px-8">
          Next Card
        </Button>
        <Button onClick={restartSession} variant="outline" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart Session
        </Button>
      </div>
    </div>
  );
}
