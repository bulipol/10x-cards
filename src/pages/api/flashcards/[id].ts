import type { APIRoute } from "astro";
import { flashcardIdSchema, flashcardUpdateSchema } from "../../../lib/schemas/flashcards.schema";
import { DatabaseError, FlashcardService } from "../../../lib/flashcard.service";

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

    // Validate ID param
    const validationResult = flashcardIdSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid id parameter",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get flashcard by ID
    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.getFlashcardById(user.id, validationResult.data.id);

    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flashcard:", error);

    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate ID param
    const idValidation = flashcardIdSchema.safeParse({ id: params.id });
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid id parameter",
          details: idValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyValidation = flashcardUpdateSchema.safeParse(body);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: bodyValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update flashcard
    const flashcardService = new FlashcardService(locals.supabase);
    const updatedFlashcard = await flashcardService.updateFlashcard(user.id, idValidation.data.id, bodyValidation.data);

    if (!updatedFlashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);

    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate ID param
    const validationResult = flashcardIdSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid id parameter",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete flashcard
    const flashcardService = new FlashcardService(locals.supabase);
    const deleted = await flashcardService.deleteFlashcard(user.id, validationResult.data.id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);

    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
