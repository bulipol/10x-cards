import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerationsListResponseDto } from "../../../types";
import { GenerationService } from "../../../lib/generation.service";
import { generationsPaginationSchema } from "../../../lib/schemas/generations.schema";

export const prerender = false;

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize service and generate flashcards
    const generationService = new GenerationService(locals.supabase, {
      apiKey: import.meta.env.OPENROUTER_API_KEY,
    });
    const result = await generationService.generateFlashcards(user.id, body.source_text);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const params = {
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    };

    const validationResult = generationsPaginationSchema.safeParse(params);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit } = validationResult.data;

    // Fetch generations from service
    const generationService = new GenerationService(locals.supabase, {
      apiKey: import.meta.env.OPENROUTER_API_KEY,
    });
    const { data, total } = await generationService.getAll(user.id, page, limit);

    // Build response
    const response: GenerationsListResponseDto = {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching generations:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
