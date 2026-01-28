// src/lib/schemas/generations.schema.ts
import { z } from "zod";

// ------------------------------------------------------------------------------------------------
// 1. Schema dla parametrów paginacji (GET /api/generations)
//    Waliduje query parameters: page i limit
// ------------------------------------------------------------------------------------------------
export const generationsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ------------------------------------------------------------------------------------------------
// 2. Schema dla parametru ID w path (GET /api/generations/[id])
//    Waliduje path parameter: id
// ------------------------------------------------------------------------------------------------
export const generationIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ------------------------------------------------------------------------------------------------
// TypeScript types inferred from schemas
// ------------------------------------------------------------------------------------------------
export type GenerationsPaginationParams = z.infer<typeof generationsPaginationSchema>;
export type GenerationIdParams = z.infer<typeof generationIdSchema>;
