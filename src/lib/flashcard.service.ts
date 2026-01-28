import type { SupabaseClient } from "../db/supabase.client";
import type { FlashcardCreateDto, FlashcardDto, FlashcardsQueryParams, FlashcardUpdateDto } from "../types";
import type { PostgrestError } from "@supabase/supabase-js";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates multiple flashcards in a single batch operation
   * @param userId - The ID of the user creating the flashcards
   * @param flashcards - Array of flashcard data to create
   * @returns Array of created flashcards
   * @throws {DatabaseError} When database operation fails
   */
  async createBatch(userId: string, flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[]> {
    const flashcardsWithUserId = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
    }));

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert(flashcardsWithUserId)
      .select("id, front, back, source, generation_id, created_at, updated_at");

    if (error) {
      this.handleDatabaseError(error);
    }

    // Update generation counts after successfully creating flashcards
    await this.updateGenerationCounts(flashcards);

    return data as FlashcardDto[];
  }

  /**
   * Updates generation counts (accepted_unedited_count and accepted_edited_count)
   * based on the flashcards that were just created
   * @param flashcards - Array of flashcard data that was created
   */
  private async updateGenerationCounts(flashcards: FlashcardCreateDto[]): Promise<void> {
    // Group flashcards by generation_id
    const generationGroups = new Map<number, { aiFull: number; aiEdited: number }>();

    for (const flashcard of flashcards) {
      if (flashcard.generation_id === null) continue;

      const genId = flashcard.generation_id;
      if (!generationGroups.has(genId)) {
        generationGroups.set(genId, { aiFull: 0, aiEdited: 0 });
      }

      const counts = generationGroups.get(genId)!;
      if (flashcard.source === "ai-full") {
        counts.aiFull++;
      } else if (flashcard.source === "ai-edited") {
        counts.aiEdited++;
      }
    }

    // Update counts for each generation
    for (const [generationId, counts] of generationGroups) {
      // Get current values
      const { data: current, error: fetchError } = await this.supabase
        .from("generations")
        .select("accepted_unedited_count, accepted_edited_count")
        .eq("id", generationId)
        .single();

      if (fetchError) {
        console.error(`Failed to fetch generation ${generationId} for count update:`, fetchError);
        continue;
      }

      if (current) {
        const newUnedited = (current.accepted_unedited_count ?? 0) + counts.aiFull;
        const newEdited = (current.accepted_edited_count ?? 0) + counts.aiEdited;

        const { error: updateError } = await this.supabase
          .from("generations")
          .update({
            accepted_unedited_count: newUnedited,
            accepted_edited_count: newEdited,
          })
          .eq("id", generationId);

        if (updateError) {
          console.error(`Failed to update generation ${generationId} counts:`, updateError);
        }
      }
    }
  }

  /**
   * Handles database errors and throws appropriate exceptions
   * @param error - PostgrestError from Supabase
   * @throws {DatabaseError} With appropriate error message and details
   */
  private handleDatabaseError(error: PostgrestError): never {
    console.error("Database error:", error);

    switch (error.code) {
      case "23503": // foreign key violation
        throw new DatabaseError(
          "Referenced record does not exist",
          error.code,
          "The generation_id provided does not exist in the database"
        );
      default:
        throw new DatabaseError("Failed to create flashcards", error.code || "UNKNOWN", error.message);
    }
  }

  /**
   * Validates that all provided generation IDs exist in the database
   * @param generationIds - Array of generation IDs to validate
   * @throws {DatabaseError} When one or more generation IDs don't exist
   */
  async validateGenerationIds(generationIds: number[]): Promise<void> {
    if (generationIds.length === 0) return;

    const uniqueGenerationIds = [...new Set(generationIds)];

    const { count } = await this.supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .in("id", uniqueGenerationIds);

    if (count !== uniqueGenerationIds.length) {
      throw new DatabaseError(
        "Invalid generation IDs",
        "INVALID_GENERATION_ID",
        "One or more generation_ids do not exist"
      );
    }
  }

  /**
   * Retrieves flashcards with pagination, sorting, and filtering
   * @param params - Query parameters for pagination, sorting, and filtering
   * @returns Object with flashcards data and total count
   * @throws {DatabaseError} When database operation fails
   */
  async getFlashcards(params: FlashcardsQueryParams): Promise<{ data: FlashcardDto[]; total: number }> {
    const offset = (params.page - 1) * params.limit;

    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", { count: "exact" });

    // Apply filters
    if (params.source) {
      query = query.eq("source", params.source);
    }

    if (params.generation_id) {
      query = query.eq("generation_id", params.generation_id);
    }

    // Apply sorting
    query = query.order(params.sort, { ascending: params.order === "asc" });

    // Apply pagination
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError("Failed to fetch flashcards", error.code || "UNKNOWN", error.message);
    }

    return {
      data: (data as FlashcardDto[]) || [],
      total: count || 0,
    };
  }

  /**
   * Retrieves a single flashcard by ID
   * @param id - The flashcard ID
   * @returns Flashcard data or null if not found
   * @throws {DatabaseError} When database operation fails
   */
  async getFlashcardById(id: number): Promise<FlashcardDto | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError("Failed to fetch flashcard", error.code || "UNKNOWN", error.message);
    }

    return data as FlashcardDto;
  }

  /**
   * Updates an existing flashcard with partial data
   * @param id - The flashcard ID
   * @param updateData - Partial flashcard data to update
   * @returns Updated flashcard or null if not found
   * @throws {DatabaseError} When database operation fails
   */
  async updateFlashcard(id: number, updateData: FlashcardUpdateDto): Promise<FlashcardDto | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", id)
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError("Failed to update flashcard", error.code || "UNKNOWN", error.message);
    }

    return data as FlashcardDto;
  }

  /**
   * Deletes a flashcard by ID
   * @param id - The flashcard ID
   * @returns True if flashcard was deleted, false if not found
   * @throws {DatabaseError} When database operation fails
   */
  async deleteFlashcard(id: number): Promise<boolean> {
    const { error, count } = await this.supabase.from("flashcards").delete({ count: "exact" }).eq("id", id);

    if (error) {
      throw new DatabaseError("Failed to delete flashcard", error.code || "UNKNOWN", error.message);
    }

    return (count || 0) > 0;
  }
}
