import { z } from "zod";

// Allowed sort fields for flashcards query
const ALLOWED_SORT_FIELDS = ["created_at", "updated_at", "front", "back"] as const;

// ------------------------------------------------------------------------------------------------
// 1. Schema for GET /flashcards query parameters
//    Validates pagination, sorting, and filtering parameters
// ------------------------------------------------------------------------------------------------
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(ALLOWED_SORT_FIELDS).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  generation_id: z.coerce.number().int().positive().optional(),
});

// ------------------------------------------------------------------------------------------------
// 2. Schema for path parameter ID validation
//    Used in GET/PUT/DELETE /flashcards/{id} endpoints
// ------------------------------------------------------------------------------------------------
export const flashcardIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ------------------------------------------------------------------------------------------------
// 3. Schema for PUT /flashcards/{id} request body
//    Validates partial update of flashcard fields
// ------------------------------------------------------------------------------------------------
export const flashcardUpdateSchema = z
  .object({
    front: z.string().max(200).optional(),
    back: z.string().max(500).optional(),
    source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
    generation_id: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
