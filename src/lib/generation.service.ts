import crypto from "crypto";
import type { FlashcardProposalDto, GenerationCreateResponseDto, GenerationDto, GenerationDetailDto } from "../types";
import type { SupabaseClient } from "../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import { DEFAULT_USER_ID } from "../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";
import { OpenRouterError } from "./openrouter.types";

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

export class GenerationService {
  private readonly openRouter: OpenRouterService;
  private readonly model = "openai/gpt-4o-mini";

  constructor(
    private readonly supabase: SupabaseClient,
    openRouterConfig?: { apiKey: string }
  ) {
    if (!openRouterConfig?.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
    this.openRouter = new OpenRouterService({
      apiKey: openRouterConfig.apiKey,
      timeout: 60000, // 60 seconds timeout for longer generations
    });

    // Configure OpenRouter
    this.openRouter.setModel(this.model, {
      temperature: 0.7,
      top_p: 1,
    });

    this.openRouter
      .setSystemMessage(`You are an AI assistant specialized in creating high-quality flashcards from provided text.
Generate concise, clear, and effective flashcards that capture key concepts and knowledge.
Each flashcard should have a front (question/prompt) and back (answer/explanation).
Focus on important facts, definitions, concepts, and relationships.`);

    this.openRouter.setResponseFormat({
      name: "flashcards",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    });
  }

  /**
   * Fetches a paginated list of generations for a user
   * @param userId - The ID of the user
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page (1-100)
   * @returns Object containing data array and total count
   * @throws {DatabaseError} When database operation fails
   */
  async getAll(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: GenerationDto[]; total: number }> {
    // 1. Calculate offset for pagination
    const offset = (page - 1) * limit;

    // 2. Fetch generations with pagination and count
    // Filter: only show generations where total accepted > 0
    // Using OR condition: (accepted_unedited_count > 0 OR accepted_edited_count > 0)
    // This handles NULL values correctly - if both are NULL, condition is false
    const { data, error, count } = await this.supabase
      .from("generations")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .or("accepted_unedited_count.gt.0,accepted_edited_count.gt.0")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.handleDatabaseError(error);
    }

    // 3. Map to GenerationDto (pick only needed fields)
    const generations: GenerationDto[] = (data || []).map((gen) => ({
      id: gen.id,
      model: gen.model,
      generated_count: gen.generated_count,
      accepted_unedited_count: gen.accepted_unedited_count,
      accepted_edited_count: gen.accepted_edited_count,
      source_text_hash: gen.source_text_hash,
      source_text_length: gen.source_text_length,
      generation_duration: gen.generation_duration,
      created_at: gen.created_at,
      updated_at: gen.updated_at,
    }));

    return {
      data: generations,
      total: count || 0,
    };
  }

  /**
   * Fetches a single generation by ID with its related flashcards
   * @param userId - The ID of the user
   * @param id - The generation ID
   * @returns GenerationDetailDto with flashcards or null if not found
   * @throws {DatabaseError} When database operation fails
   */
  async getById(
    userId: string,
    id: number
  ): Promise<GenerationDetailDto | null> {
    // 1. Fetch generation with related flashcards (JOIN)
    const { data: generation, error } = await this.supabase
      .from("generations")
      .select(`
        *,
        flashcards (
          id,
          front,
          back,
          source,
          generation_id,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      this.handleDatabaseError(error);
    }

    return generation as GenerationDetailDto;
  }

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    try {
      // 1. Calculate metadata
      const startTime = Date.now();
      const sourceTextHash = await this.calculateHash(sourceText);

      // 2. Call AI service through OpenRouter
      const proposals = await this.callAIService(sourceText);

      // 3. Save generation metadata
      const generationId = await this.saveGenerationMetadata({
        sourceText,
        sourceTextHash,
        generatedCount: proposals.length,
        durationMs: Date.now() - startTime,
      });

      return {
        generation_id: generationId,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error and save to generation_error_logs
      await this.logGenerationError(error, {
        sourceTextHash: await this.calculateHash(sourceText),
        sourceTextLength: sourceText.length,
      });
      throw error;
    }
  }

  private async calculateHash(text: string): Promise<string> {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callAIService(text: string): Promise<FlashcardProposalDto[]> {
    try {
      // Set the user message with the source text
      this.openRouter.setUserMessage(`Generate flashcards from the following text:\n\n${text}`);

      // Get response from OpenRouter
      const response = await this.openRouter.sendChatMessage();

      // Parse the JSON response
      const data = JSON.parse(response);

      // Validate response structure
      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        throw new Error("Invalid response format: missing flashcards array");
      }

      // Convert to FlashcardProposalDto format
      return data.flashcards.map((card: { front: string; back: string }) => ({
        front: card.front,
        back: card.back,
        source: "ai-full" as const,
      }));
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw new Error(`AI Service error: ${error.message} (${error.code})`);
      }
      throw error;
    }
  }

  private async saveGenerationMetadata(data: {
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    durationMs: number;
  }): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        model: this.model,
      })
      .select("id")
      .single();

    if (error) throw error;
    return generation.id;
  }

  private async logGenerationError(
    error: unknown,
    data: {
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ): Promise<void> {
    await this.supabase.from("generation_error_logs").insert({
      user_id: DEFAULT_USER_ID,
      error_code: error instanceof Error ? error.name : "UNKNOWN",
      error_message: error instanceof Error ? error.message : String(error),
      model: this.model,
      source_text_hash: data.sourceTextHash,
      source_text_length: data.sourceTextLength,
    });
  }

  /**
   * Handles database errors and throws appropriate exceptions
   * @param error - PostgrestError from Supabase
   * @throws {DatabaseError} With appropriate error message and details
   */
  private handleDatabaseError(error: PostgrestError): never {
    console.error("Database error:", error);
    throw new DatabaseError(
      error.message || "Database operation failed",
      error.code || "UNKNOWN",
      error.details || ""
    );
  }
}
