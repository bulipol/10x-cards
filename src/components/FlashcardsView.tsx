import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardsList } from "./FlashcardsList";
import { Pagination } from "./Pagination";
import { EditFlashcardModal } from "./EditFlashcardModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { FlashcardsEmptyState } from "./FlashcardsEmptyState";
import { ErrorNotification } from "./ErrorNotification";
import { SkeletonLoader } from "./SkeletonLoader";
import { useFlashcards } from "./hooks/useFlashcards";
import type { FlashcardDto, Source } from "@/types";

export function FlashcardsView() {
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    flashcards,
    isLoading,
    error,
    pagination,
    currentPage,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useFlashcards();

  useEffect(() => {
    loadFlashcards(1);
  }, []);

  const handleCreateClick = () => {
    setEditingFlashcard(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (flashcard: FlashcardDto) => {
    setEditingFlashcard(flashcard);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    const flashcard = flashcards.find((f) => f.id === id);
    if (flashcard) {
      setDeletingId(id);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleModalSave = async (data: { front: string; back: string; source: Source }) => {
    try {
      setIsSaving(true);
      if (editingFlashcard) {
        await updateFlashcard(editingFlashcard.id, data);
      } else {
        await createFlashcard(data);
      }
      setIsModalOpen(false);
    } catch {
      // Error already handled in hook with toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      await deleteFlashcard(deletingId);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error already handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadFlashcards(page);
  };

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {error && <ErrorNotification message={error} />}

      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Flashcards</h1>
          {pagination && <p className="text-muted-foreground mt-1">{pagination.total} flashcards total</p>}
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flashcard
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && <SkeletonLoader />}

      {/* Empty state */}
      {!isLoading && flashcards.length === 0 && <FlashcardsEmptyState onCreateClick={handleCreateClick} />}

      {/* Flashcards list */}
      {!isLoading && flashcards.length > 0 && (
        <>
          <FlashcardsList flashcards={flashcards} onEdit={handleEditClick} onDelete={handleDeleteClick} />

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

      {/* Edit/Create Modal */}
      <EditFlashcardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        flashcard={editingFlashcard}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        flashcardFront={flashcards.find((f) => f.id === deletingId)?.front || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
