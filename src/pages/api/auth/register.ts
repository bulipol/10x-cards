import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/schemas/auth.schema";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return new Response(
          JSON.stringify({ error: "email_taken", message: "Email already registered" }),
          { status: 409 }
        );
      }
      console.error("Supabase signUp error:", error);
      return new Response(
        JSON.stringify({ error: "server_error", message: "Registration failed" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Registration successful",
        user: { id: data.user?.id, email: data.user?.email },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Internal server error" }),
      { status: 500 }
    );
  }
};
