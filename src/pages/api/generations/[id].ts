import type { APIRoute } from "astro";
import { GenerationService } from "../../../lib/generation.service";
import { generationIdSchema } from "../../../lib/schemas/generations.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate path parameter
    const validationResult = generationIdSchema.safeParse(params);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid ID parameter",
          details: validationResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // Fetch generation from service
    const generationService = new GenerationService(locals.supabase, {
      apiKey: import.meta.env.OPENROUTER_API_KEY,
    });
    const generation = await generationService.getById(user.id, id);

    // Check if found
    if (!generation) {
      return new Response(
        JSON.stringify({ error: "Generation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return response
    return new Response(JSON.stringify(generation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching generation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
